"use client";
// import { CircularProgress, CircularProgressLabel } from '@chakra-ui/react'
import {useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Box,
    Flex,
    Text,
    InputGroup,
    NumberInput,
    Spinner,
    Tabs,
    Button,
} from "@chakra-ui/react";
import "./TokenSwapForm.css";
import type { Agent } from "@/app/types/agent";
import { colorTokens } from "../theme/theme";
import { WalletIcon } from "../icons/wallet";
import { useAptosWallet } from "@/app/context/AptosWalletContext";
import { toaster } from "@/components/ui/toaster";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { Network } from "aptos";
import {AptosSwapSDK} from "@/app/hooks/AptosSwapSDK";
import {AptosSwapDemo} from "@/app/components/Agents/AgentMarketInfoSwapDemo";

/* ------------------------------ constants -------------------------------- */
const APT_META = "0x000000000000000000000000000000000000000000000000000000000000000a";
const APT_DECIMALS = 8;
const REFRESH_MS = 15000;

/* ----------------------------- utils/format ------------------------------- */
export function formatThousands(num: string | number, sep = ","): string {
    const s = String(num);
    const isNeg = s.startsWith("-");
    const body = isNeg ? s.slice(1) : s;
    const [intPart, fracPart] = body.split(".");
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    return (isNeg ? "-" : "") + grouped + (fracPart !== undefined ? "." + fracPart : "");
}

export function formatTinyPrice(numStr?: string) {
    if (!numStr) return <>{numStr}</>;
    if (!numStr.includes(".")) return <>{formatThousands(numStr)}</>;
    const [intPart, fracPart] = numStr.split(".");
    let trueZeroCount = 0;
    while (fracPart[trueZeroCount] === "0") trueZeroCount++;
    const significant = fracPart.slice(trueZeroCount).slice(0, 4).padEnd(4, "0");
    const intFmt = formatThousands(intPart);
    if (trueZeroCount > 0) {
        return (
            <>
                {intFmt}.0{trueZeroCount - 1 > 0 && <sup>{trueZeroCount - 1}</sup>}
                {significant}
            </>
        );
    }
    return (
        <>
            {intFmt}.{significant}
        </>
    );
}

function sanitizeDecimalInput(raw: string, maxDecimals: number): string {
    let s = raw.replace(/[^0-9.]/g, "");
    const parts = s.split(".");
    if (parts.length > 2) s = parts[0] + "." + parts.slice(1).join("");
    const [ip, fp = ""] = s.split(".");
    const trimmedFp = fp.slice(0, Math.max(0, maxDecimals));
    if (ip && ip !== "0" && ip.startsWith("0")) {
        const n = String(parseInt(ip, 10));
        s = n + (trimmedFp ? "." + trimmedFp : "");
    } else {
        s = (ip || "0") + (trimmedFp ? "." + trimmedFp : (s.endsWith(".") ? "." : ""));
    }
    if (s === "." || s === "") s = "0";
    return s;
}

function toAtomic(amountStr: string, decimals: number): bigint {
    const [i, f = ""] = amountStr.split(".");
    const frac = f.padEnd(decimals, "0").slice(0, decimals);
    const whole = BigInt(i || "0");
    const fracBI = BigInt(frac || "0");
    return whole * BigInt(10) ** BigInt(decimals) + fracBI;
}
function fromAtomic(amount: bigint, decimals: number): string {
    const base = BigInt(10) ** BigInt(decimals);
    const i = amount / base;
    const f = amount % base;
    if (f === 0n) return i.toString();
    const fStr = f.toString().padStart(decimals, "0").replace(/0+$/, "");
    return `${i.toString()}.${fStr}`;
}
function normalizeHex(addr: string) {
    const a = addr.toLowerCase();
    return a.startsWith("0x") ? a : `0x${a}`;
}
// NEW: compare addresses canonical (match SDK ordering)
function addrLT(a: string, b: string) {
    try {
        return BigInt(normalizeHex(a)) < BigInt(normalizeHex(b));
    } catch {
        return normalizeHex(a) < normalizeHex(b);
    }
}
const isFiniteNum = (n: number | null) => n != null && Number.isFinite(n);

/* ------------------------------ price feed -------------------------------- */
function useAptUsd() {
    const [usd, setUsd] = useState<number>(0);
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const r = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/apt-price`
                );
                if (!r.ok) throw new Error(`status ${r.status}`);
                const j = await r.json();
                const v = Number(j?.price);
                if (mounted && isFinite(v)) setUsd(v);
            } catch {}
        };
        load();
        const id = setInterval(load, 60000);
        return () => {
            mounted = false;
            clearInterval(id);
        };
    }, []);
    return usd;
}

/* --------------------------------- props ---------------------------------- */
export default function TokenSwapForm({
                                          agent,
                                          defaultSlippageBps = 100,
                                          defaultTab = "buy",
                                      }: {
    agent: Agent;
    defaultSlippageBps?: number;
    defaultTab?: "buy" | "sell";
}) {
    const { wallet, isConnected, account, connect } = useAptosWallet();

    const agentMeta = useMemo(() => normalizeHex(agent.fa_id ?? ""), [agent.fa_id]);
    const agentSymbol = agent.agent_symbol ?? "AGENT";
    const agentDecimals = agent.decimals ?? 6;

    /* -------------------------------- state --------------------------------- */
    const [tab, setTab] = useState<"buy" | "sell">(defaultTab);
    const [slippageBps, setSlippageBps] = useState<number>(defaultSlippageBps);

    const [pay, setPay] = useState<string>("0");
    const [receive, setReceive] = useState<string>("0");
    const [typingSide, setTypingSide] = useState<"pay" | "receive">("pay");

    const [aptBal, setAptBal] = useState<bigint | null>(null);
    const [agentBal, setAgentBal] = useState<bigint | null>(null);
    const [balancesLoading, setBalancesLoading] = useState(false);

    const [spotPrice, setSpotPrice] = useState<number | null>(null);
    const [executionPrice, setExecutionPrice] = useState<number | null>(null);
    const [priceImpact, setPriceImpact] = useState<number | null>(null);
    const [pairAddress, setPairAddress] = useState<string | null>(null);
    const [reserves, setReserves] = useState<{ reserveX: bigint; reserveY: bigint } | null>(null);
    const [quoting, setQuoting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [balanceError, setBalanceError] = useState<string>("");
    const quoteSeq = useRef(0);

    const aptUsd = useAptUsd();

    const inMeta = tab === "buy" ? APT_META : agentMeta;
    const outMeta = tab === "buy" ? agentMeta : APT_META;
    const inDecimals = tab === "buy" ? APT_DECIMALS : agentDecimals;
    const outDecimals = tab === "buy" ? agentDecimals : APT_DECIMALS;

    // NEW: 1-unit equivalence cache for zero-input state
    const [unitOut, setUnitOut] = useState<string | null>(null);

    /* ------------------------------ SDK events ------------------------------ */
    const [swapSDK, setSwapSDK] = useState<AptosSwapSDK | null>(null);
    const [refreshIn, setRefreshIn] = useState(Math.floor(REFRESH_MS / 1000));

    useEffect(() => {
        const t = setInterval(() => {
            setRefreshIn((s) => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        if (!agent?.fa_id || !process.env.NEXT_PUBLIC_RPC_URL) return;

        const config = new AptosConfig({
            network: Network.MAINNET,
            fullnode: process.env.NEXT_PUBLIC_RPC_URL!,
        });
        const aptosSDK = new Aptos(config);

        const sdk = new AptosSwapSDK({
            nodeUrl: process.env.NEXT_PUBLIC_RPC_URL!,
            moduleAddress: process.env.NEXT_PUBLIC_SWAP_MODULE_ADDRESS!,
            aptosSDK,
            defaultSlippageBps: 100,
        });

        setSwapSDK(sdk);
    }, [agent?.fa_id, process.env.NEXT_PUBLIC_RPC_URL]);
    useEffect(() => {
        if (!isConnected) {
            setBalanceError("");
            return;
        }

        // Pick the correct balance + decimals
        const bal = tab === "buy" ? aptBal : agentBal;
        const dec = tab === "buy" ? APT_DECIMALS : agentDecimals;
        const symbol = tab === "buy" ? "APT" : agentSymbol;

        if (bal == null) {
            setBalanceError("");
            return;
        }

        try {
            const amt = toAtomic(pay, dec);
            if (amt > bal) {
                setBalanceError(`Insufficient balance (${fromAtomic(bal, dec)} ${symbol})`);
            } else {
                setBalanceError("");
            }
        } catch {
            setBalanceError("");
        }
    }, [pay, tab, aptBal, agentBal, isConnected, agentSymbol, agentDecimals]);
    useEffect(() => {
        if (!swapSDK) return;

        const off1 = swapSDK.emitter.on("loading:start", (d) => {
            if (d?.op === "submit") setSubmitting(true);
        });
        const off2 = swapSDK.emitter.on("loading:end", (d) => {
            if (d?.op === "submit") setSubmitting(false);
        });
        const off3 = swapSDK.emitter.on("tx:submitted", () => setSubmitting(true));
        const off4 = swapSDK.emitter.on("tx:success", () => {
            setSubmitting(false);
            toaster.create({ type: "success", description: "Transaction success", duration: 3000 });
            refreshBalances();
        });
        const off5 = swapSDK.emitter.on("tx:error", (e) => {
            setSubmitting(false);
            toaster.create({ type: "error", description: String(e?.message ?? e), duration: 4000 });
        });
        const off6 = swapSDK.emitter.on("reserves:update", ({ entry }: any) => {
            setPairAddress(entry?.pairAddress ?? null);
            setReserves(entry ? { reserveX: entry.reserveX, reserveY: entry.reserveY } : null);
        });
        return () => {
            off1?.(); off2?.(); off3?.(); off4?.(); off5?.(); off6?.();
        };
    }, [swapSDK]);

    /* ----------------------------- balances load ---------------------------- */
    const refreshBalances = async () => {
        if (!swapSDK) return;
        if (!isConnected || !account?.address || !agentMeta) return;
        try {
            setBalancesLoading(true);
            const [apt, ag] = await Promise.all([
                swapSDK.getWalletBalance(account.address.toString(), APT_META),
                swapSDK.getWalletBalance(account.address.toString(), agentMeta),
            ]);
            setAptBal(apt);
            setAgentBal(ag);
        } catch {} finally {
            setBalancesLoading(false);
        }
    };
    useEffect(() => { refreshBalances(); }, [isConnected, account?.address, agentMeta]);

    /* ----------------------------- reserves/quote --------------------------- */
    const doReserves = useCallback(async () => {
        if (!agentMeta || !swapSDK) return;
        try {
            const { reserves } = await swapSDK.getReserves(APT_META, agentMeta, { refreshIfStale: true });
            setReserves({ reserveX: reserves.reserveX, reserveY: reserves.reserveY });
            setPairAddress(reserves.pairAddress);
            setRefreshIn(Math.floor(REFRESH_MS / 1000));

            const aptFirstLocal = addrLT(APT_META, agentMeta);
            const rAPT = aptFirstLocal ? reserves.reserveX : reserves.reserveY;
            const rAG  = aptFirstLocal ? reserves.reserveY : reserves.reserveX;

            if (tab === "buy") {
                const spotHuman = rAG === 0n
                    ? Infinity
                    : (Number(rAPT) / Number(rAG)) * Math.pow(10, agentDecimals - APT_DECIMALS);
                setSpotPrice(spotHuman);
            } else {
                const spotHuman = rAPT === 0n
                    ? Infinity
                    : (Number(rAG) / Number(rAPT)) * Math.pow(10, APT_DECIMALS - agentDecimals);
                setSpotPrice(spotHuman);
            }

            setPriceImpact(null);
            await ensureUnitOut();
        } catch {}
    }, [agentMeta, swapSDK, tab, agentDecimals]); // <-- include tab
    useEffect(() => {
        if (refreshIn === 0) {
            (async () => {
                await doReserves();
                if (isConnected) await refreshBalances();
                setRefreshIn(REFRESH_MS / 1000);
            })();
        }
    }, [refreshIn, doReserves]);

    useEffect(() => {
        doReserves();
        const id = setInterval(doReserves, REFRESH_MS);
        const onFocus = () => doReserves();
        window.addEventListener("focus", onFocus);
        return () => {
            clearInterval(id);
            window.removeEventListener("focus", onFocus);
        };
    }, [doReserves]); // <-- depend on the callback

    const runQuote = async (side: "pay" | "receive", payStr: string, recvStr: string) => {
        if (!agentMeta || !swapSDK) return;

        setQuoting(true);
        try {
            // converts atomic ratio (in/out) -> human ratio by scaling 10^(outDec - inDec)
            const scale = Math.pow(10, outDecimals - inDecimals);

            if (side === "pay") {
                const inAmt = toAtomic(payStr, inDecimals);

                if (inAmt <= 0n) {
                    // zero input → clear outputs, show em dashes, but still show 1-unit quote + spot
                    setReceive("0");
                    setExecutionPrice(null);   // em dash
                    setPriceImpact(null);      // em dash

                    const one = BigInt(10) ** BigInt(inDecimals); // 1 unit of IN
                    try {
                        const q = await swapSDK.quoteExactIn(inMeta, outMeta, one, true, slippageBps);
                        setSpotPrice(q.spotPrice * scale); // decimals-aware
                        setPairAddress(q.pairAddress);
                        setReserves({ reserveX: q.reserves.reserveX, reserveY: q.reserves.reserveY });
                        setUnitOut(fromAtomic(q.amountOut, outDecimals)); // how much OUT for 1 IN
                    } catch (e) {
                        debugLog(e);
                    }
                    return;
                }

                const q = await swapSDK.quoteExactIn(inMeta, outMeta, inAmt, true, slippageBps);
                const { amountOut, spotPrice, executionPrice, priceImpact, pairAddress, reserves } = q;

                setReceive(fromAtomic(amountOut, outDecimals));
                setSpotPrice(spotPrice * scale);              // decimals-aware
                setExecutionPrice(executionPrice * scale);    // decimals-aware
                setPriceImpact(priceImpact);
                setPairAddress(pairAddress);
                setReserves({ reserveX: reserves.reserveX, reserveY: reserves.reserveY });
                setUnitOut(null);
            } else {
                const outAmt = toAtomic(recvStr, outDecimals);

                if (outAmt <= 0n) {
                    // zero desired OUT → clear inputs, show em dashes, but still show 1 OUT quote + spot
                    setPay("0");
                    setExecutionPrice(null);   // em dash
                    setPriceImpact(null);      // em dash

                    const oneOut = BigInt(10) ** BigInt(outDecimals); // want 1 OUT
                    try {
                        const q = await swapSDK.quoteExactOut(inMeta, outMeta, oneOut, true, slippageBps);
                        setSpotPrice(q.spotPrice * scale); // decimals-aware
                        setPairAddress(q.pairAddress);
                        setReserves({ reserveX: q.reserves.reserveX, reserveY: q.reserves.reserveY });
                        setUnitOut(fromAtomic(q.amountIn, inDecimals)); // how much IN for 1 OUT
                    } catch {}
                    return;
                }

                const q = await swapSDK.quoteExactOut(inMeta, outMeta, outAmt, true, slippageBps);
                const { amountIn, spotPrice, executionPrice, priceImpact, pairAddress, reserves } = q;

                setPay(fromAtomic(amountIn, inDecimals));
                setSpotPrice(spotPrice * scale);             // decimals-aware
                setExecutionPrice(executionPrice * scale);   // decimals-aware
                setPriceImpact(priceImpact);
                setPairAddress(pairAddress);
                setReserves({ reserveX: reserves.reserveX, reserveY: reserves.reserveY });
                setUnitOut(null);
            }
        } catch (e: any) {
            debugLog("quoting", { e });
            toaster.create({ type: "error", description: String(e?.message ?? e), duration: 3000 });
        } finally {
            await ensureUnitOut(); // keep the 1-APT summary fresh
            setQuoting(false);
        }
    };

    const ensureUnitOut = async () => {
        if (!swapSDK || !agentMeta) return;
        try {
            if (tab === "buy") {
                const one = BigInt(10) ** BigInt(APT_DECIMALS); // 1 APT in atomic
                const q = await swapSDK.quoteExactIn(APT_META, agentMeta, one, true, slippageBps);
                setUnitOut(fromAtomic(q.amountOut, agentDecimals));   // AGCR per 1 APT
            } else {
                const oneOut = BigInt(10) ** BigInt(APT_DECIMALS);     // want 1 APT out
                const q = await swapSDK.quoteExactOut(agentMeta, APT_META, oneOut, true, slippageBps);
                setUnitOut(fromAtomic(q.amountIn, agentDecimals));     // AGCR needed for 1 APT
            }
        } catch {}
    };
    // FIX: re-quote on slippage/tab; also reset inputs on tab change to refresh view
    useEffect(() => {
        if (typingSide === "pay") runQuote("pay", pay, receive);
        else runQuote("receive", pay, receive);
    }, [slippageBps]);
    useEffect(() => {
        setPay("0");
        setReceive("0");
        setTypingSide("pay");
        setUnitOut(null);
        setExecutionPrice(null);
        setPriceImpact(null);
    }, [tab]);
    // @ts-ignore
    const debugLog=(
        message?: any,
        ...optionalParams: any[]
    ): void=>{
        console.log("[tokenSWAP] ",message, optionalParams)
    }
    /* ------------------------------ input handlers -------------------------- */
    const shortenMiddle = (str: string, front = 6, back = 4) =>
        str.length > front + back ? `${str.slice(0, front)}...${str.slice(-back)}` : str;
    const handleCopy = async (text: string, label: string) => {
        if (typeof window === "undefined") return;

        try {
            await navigator.clipboard.writeText(text);
            toaster.create({
                description: `${label} copied!`,
                type: "success",
            });
        } catch (err) {
            toaster.create({
                description: `Failed to copy ${label}`,
                type: "error",
            });
        }
    };
    const renderTokenInfoField = (label:string, value:any) => {
        return (<Flex justify="space-between" mb={2}>
            <Text color={colorTokens.gray.timberwolf} fontSize={13}>{label}</Text>
            {!quoting &&<Text color={colorTokens.gray.platinum} fontSize={13}>{value}</Text>}
            {quoting && <Spinner size="sm" ml={2} />}
        </Flex>)
    }
    const onPayChange = (v: string | number) => {
        const s = sanitizeDecimalInput(String(v ?? ""), inDecimals); // FIX: coerce
        setTypingSide("pay");
        setPay(s);
        runQuote("pay", s, receive);

    };
    const onReceiveChange = (v: string | number) => {
        const s = sanitizeDecimalInput(String(v ?? ""), outDecimals); // FIX: coerce
        setTypingSide("receive");
        setReceive(s);
        runQuote("receive", pay, s);
    };

    const onMax = () => {
        if (tab === "buy") {
            if (aptBal == null) return;
            const s = fromAtomic(aptBal, APT_DECIMALS);
            onPayChange(s);
        } else {
            if (agentBal == null) return;
            const s = fromAtomic(agentBal, agentDecimals);
            onPayChange(s);
        }
    };
    // utilities (top-level, near other utils)
    const isUserCancel = (e: any) => {
        const code = e?.code ?? e?.statusCode;
        const name = String(e?.name ?? "").toLowerCase();
        const msg  = String(e?.message ?? e ?? "").toLowerCase();
        return code === 4001                   // common "user rejected" code
            || name.includes("userrejected")
            || name.includes("rejected")
            || msg.includes("user rejected")
            || msg.includes("rejected")
            || msg.includes("cancel");
    };


    /* -------------------------------- execute ------------------------------- */
    const onExecute = async () => {
        if (!swapSDK) return;
        if (!isConnected || !wallet || !account?.address) {
            await connect?.();
            return;
        }
        try {
            const amountIn = toAtomic(pay, inDecimals);
            if (amountIn <= 0n) {
                toaster.create({ type: "error", description: "Amount must be > 0", duration: 2500 });
                return;
            }
            const { payload } = await swapSDK.buildSwapTx(
                inMeta, outMeta, amountIn, account.address.toString(), slippageBps
            );
            setSubmitting(true); // ensure we flip it on before wallet prompt
            await swapSDK.submitWithWallet(wallet, payload);
            await refreshBalances();

        } catch (e: any) {
            setSubmitting(false); // ← make sure we always clear it
            if (isUserCancel(e)) {
                toaster.create({ type: "info", description: "Swap cancelled in wallet", duration: 2500 });
            } else {
                toaster.create({ type: "error", description: String(e?.message ?? e), duration: 3500 });
            }
        }
    };


    /* -------------------------------- derived UI ----------------------------- */
    const payLabel = tab === "buy" ? "You pay (APT)" : `You pay (${agentSymbol})`;
    const receiveLabel = tab === "buy" ? `You receive (${agentSymbol})` : "You receive (APT)";
    const buttonLabel = tab === "buy" ? `Buy ${agentSymbol}` : `Sell ${agentSymbol} for APT`;

    const aptAmountForUsd = tab === "buy" ? pay : receive;
    const aptUsdText =
        aptUsd && aptAmountForUsd && aptAmountForUsd !== "0"
            ? ` (~$${formatThousands((Number(aptAmountForUsd) * aptUsd).toFixed(2))})`
            : "";

    const impactColor = (() => {
        if (priceImpact == null) return "gray.400";
        const pct = Math.abs(priceImpact) * 100;
        if (pct < 1) return "green.400";
        if (pct < 5) return "yellow.400";
        return "red.400";
    })();

    // NEW: map reserves to token order for display
    const aptFirst = useMemo(() => addrLT(APT_META, agentMeta), [agentMeta]);
    const reserveAPT =
        reserves ? (aptFirst ? reserves.reserveX : reserves.reserveY) : 0n;
    const reserveAG =
        reserves ? (aptFirst ? reserves.reserveY : reserves.reserveX) : 0n;

    return (
        <Box borderRadius={16} bg={colorTokens.blackCustom.a3} p={4} flexShrink={0}>
            {/* Tabs */}
            <Tabs.Root value={tab} onValueChange={(v) => setTab(v.value as "buy" | "sell")}>
                <Flex align="center" mb={3}>
                    {/* Tabs on the left */}
                    <Tabs.List borderBottom="none" display="flex">
                        <Tabs.Trigger
                            value="buy"
                            mr={2}
                            color={colorTokens.gray.timberwolf}
                            _focus={{ boxShadow: "none" }}
                        >
                            Buy
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="sell"
                            color={colorTokens.gray.timberwolf}
                            _focus={{ boxShadow: "none" }}
                        >
                            Sell
                        </Tabs.Trigger>
                    </Tabs.List>

                    {/* Spacer pushes the next flex to the right */}
                    <Flex flex="1" />

                    {/* Refresh timer on the right */}
                    <Flex align="center" gap={2} pb="2">
                        <Text color={colorTokens.gray.timberwolf} fontSize={13}>
                            Refresh:
                        </Text>
                        {(() => {
                            const pct = Math.max(
                                0,
                                Math.min(
                                    100,
                                    (((REFRESH_MS / 1000) - refreshIn) / (REFRESH_MS / 1000)) * 100
                                )
                            );
                            return (
                                <Box
                                    position="relative"
                                    w="28px"
                                    h="28px"
                                    borderRadius="9999px"
                                    bg={`conic-gradient(#ffffff ${pct}%, rgba(255,255,255,0.18) 0)`}
                                >
                                    <Flex
                                        position="absolute"
                                        inset="3px"
                                        borderRadius="9999px"
                                        bg="rgba(18, 19, 21, 1)"
                                        align="center"
                                        justify="center"
                                    >
                                        <Text fontSize="10px" color={colorTokens.gray.timberwolf}>
                                            {refreshIn}s
                                        </Text>
                                    </Flex>
                                </Box>
                            );
                        })()}
                    </Flex>
                </Flex>

                <Tabs.Content value="buy" />
                <Tabs.Content value="sell" />
            </Tabs.Root>

            {/* Pay row */}
            <Flex justifyContent="space-between" fontSize={13} fontFamily="Sora" fontWeight={300}>
                <Text color={colorTokens.gray.timberwolf}>{payLabel}</Text>
                <Flex gap={1} align="center">
                    <Text color={colorTokens.gray.timberwolf}>
                        {tab === "buy"
                            ? `${fromAtomic(aptBal ?? 0n, APT_DECIMALS)} APT`
                            : `${fromAtomic(agentBal ?? 0n, agentDecimals)} ${agentSymbol}`}
                    </Text>
                    {balancesLoading && <Spinner size="sm" ml={2} />}
                    <WalletIcon boxSize={5} color={colorTokens.green.darkErin} />
                </Flex>
            </Flex>

            <NumberInput.Root
                key={`pay-${tab}`} // NEW: force re-mount on tab switch
                mt={2}
                value={pay}
                onValueChange={(d: any) => onPayChange(d?.valueAsString ?? d?.value ?? "")} // FIX
            >
                <InputGroup
                    endElement={
                        <Flex align="center" gap={2}>
                            <Button size="xs" onClick={onMax} bg={colorTokens.green.erin} color="rgba(31,125,32,1)" _hover={{ bg: colorTokens.green.erin }}>
                                MAX
                            </Button>
                            <Text as="span" px={2} color={colorTokens.gray.timberwolf}>
                                {tab === "buy" ? "APT" : agentSymbol}
                            </Text>
                        </Flex>
                    }
                >
                    <NumberInput.Input
                        borderRadius={8}
                        borderWidth={1}
                        borderColor={colorTokens.green.dark}
                        bg="rgba(18, 19, 21, 1)"
                        color={colorTokens.gray.timberwolf}
                        inputMode="decimal"
                    />
                </InputGroup>
            </NumberInput.Root>

            {/* Receive row */}
            <Flex justifyContent="space-between" fontSize={13} fontFamily="Sora" fontWeight={300} mt={4}>
                <Text color={colorTokens.gray.timberwolf}>{receiveLabel}</Text>
                <Text color={colorTokens.gray.timberwolf}>{agent.agent_name}</Text>
            </Flex>

            <NumberInput.Root
                key={`recv-${tab}`} // NEW: force re-mount on tab switch
                mt={2}
                value={receive}
                onValueChange={(d: any) => onReceiveChange(d?.valueAsString ?? d?.value ?? "")} // FIX
            >
                <InputGroup
                    endElement={
                        <Text as="span" px={2} color={colorTokens.gray.timberwolf}>
                            {tab === "buy" ? agentSymbol : "APT"}
                        </Text>
                    }
                >
                    <NumberInput.Input
                        borderRadius={8}
                        borderWidth={1}
                        borderColor={colorTokens.green.dark}
                        bg="rgba(18, 19, 21, 1)"
                        color={colorTokens.gray.timberwolf}
                        inputMode="decimal"
                    />
                </InputGroup>
            </NumberInput.Root>

            {/* Live summary line */}
            <Text mt={3} color={colorTokens.gray.timberwolf} fontSize={13}>
                {/*{`1 APT ≈ ${unitOut ?? "—"} ${agentSymbol} (~$${formatThousands(aptUsd.toFixed(2))})`}*/}
                {tab === "buy"
                    ?  `1 APT ≈ ${unitOut ?? "—"} ${agentSymbol} (~$${formatThousands(aptUsd?.toFixed(2)??"")})`
                    : `1 ${agentSymbol} ≈ ${unitOut ?? "—"} APT (~$${formatThousands((aptUsd*parseFloat(unitOut??"0"))?.toFixed(2)??"")})`}
                {quoting && <Spinner size="sm" ml={2} />}
            </Text>

            {/* Slippage */}
            <Flex mt={3} align="center" gap={2}>
                <Text color={colorTokens.gray.timberwolf} fontSize={13}>Slippage</Text>
                <NumberInput.Root
                    value={(slippageBps / 100).toString()}
                    onValueChange={(d: any) => {
                        const raw = Number(d?.valueAsString ?? d?.value);
                        const v = Number.isFinite(raw) ? raw : 0;
                        const clamped = Math.min(100, Math.max(0, v));
                        setSlippageBps(Math.round(clamped * 100));
                    }}
                    inputMode={"numeric"}
                    width="90px"
                >
                    <InputGroup endElement={<Text as="span" px={2} color={colorTokens.gray.timberwolf}>%</Text>}>
                        <NumberInput.Input
                            borderRadius={8}
                            borderWidth={1}
                            borderColor={colorTokens.green.dark}
                            bg="rgba(18, 19, 21, 1)"
                            color={colorTokens.gray.timberwolf}
                            inputMode="decimal"
                        />
                    </InputGroup>
                </NumberInput.Root>
            </Flex>

            {/* Market info */}
            <Box mt={3}>
                {renderTokenInfoField("Spot price:", <>
                    {" "}{isFiniteNum(spotPrice) ? formatTinyPrice(spotPrice!.toString()):"—"} {tab === "buy" ? `APT` : `${agentSymbol}`}
                </>)}
                {isFiniteNum(executionPrice) && (

                    renderTokenInfoField("Execution price:", <>
                    {" "}{isFiniteNum(executionPrice) ? formatTinyPrice(executionPrice!.toString()):"—" } {tab === "buy" ? `APT` : `${agentSymbol}`}
                </>)
                 )}
                {priceImpact != null && Number.isFinite(priceImpact) && (

                    renderTokenInfoField("Price impact:", <div color={impactColor}>
                    {" "}{Number.isFinite(priceImpact) ? `${(priceImpact * 100).toFixed(2)}%` : "—%"} {quoting && <Spinner size="sm" ml={2} />}
                </div>)
               )}
                <Flex justify="space-between" mb={2}>
                    <Text color={colorTokens.gray.timberwolf} fontSize={13}>Dev:</Text>
                    <Text
                        color={colorTokens.gray.platinum} fontSize={13}
                          onClick={() => handleCopy(agent.wallet ?? "", "Dev address")}
                          _hover={{ color: colorTokens.green.erin, cursor: "pointer" }}>
                        {shortenMiddle(agent.wallet?? "") ?? "—"}
                    </Text>
                </Flex>
                <Flex justify="space-between" mb={2}>
                    <Text color={colorTokens.gray.timberwolf} fontSize={13}>LP:</Text>
                    <Text
                        color={colorTokens.gray.platinum}
                          onClick={() => handleCopy(pairAddress ?? "", "LP address")}
                          _hover={{ color: colorTokens.green.erin, cursor: "pointer" }}
                     fontSize={13}>
                        {shortenMiddle(pairAddress?? "") ?? "—"}
                    </Text>
                </Flex>
                { renderTokenInfoField("Reserves:", <>
                        {" "}{reserves
                    ? `${fromAtomic(reserveAPT, APT_DECIMALS)} APT / ${fromAtomic(reserveAG, agentDecimals)} ${agentSymbol}`
                    : "—"}
                    </>)}
            </Box>

            {/* CTA */}
            <Flex w="100%" gap="17px" mt={4}>
                {!isConnected ? (
                    <Button
                        borderRadius={8}
                        bg={colorTokens.green.erin}
                        flex="1"
                        color="rgba(31, 125, 32, 1)"
                        _hover={{ bg: colorTokens.green.erin }}
                        onClick={() => connect?.()}
                    >
                        Connect Wallet
                    </Button>
                ) : (
                    <Button
                        borderRadius={8}
                        bg={tab === "buy" ? colorTokens.green.erin : "rgba(231, 55, 55, 1)"}
                        flex="1"
                        color={tab === "buy" ? "rgba(31, 125, 32, 1)" : "white"}
                        _hover={{ bg: tab === "buy" ? colorTokens.green.erin : "rgba(231, 55, 55, 1)" }}
                        onClick={onExecute}
                        disabled={submitting || quoting || !!balanceError}
                    >
                        {submitting && <Spinner size="sm" mr={2} />}
                        {balanceError?balanceError:buttonLabel}
                    </Button>
                )}
            </Flex>
        </Box>
    );
}
