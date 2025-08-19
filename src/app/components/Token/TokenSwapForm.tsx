"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Flex,
    Text,
    Input,
    Button,
    InputGroup,
    NumberInput,
    Spinner,
    HStack,
} from "@chakra-ui/react";
import type { Agent } from "@/app/types/agent";
import { colorTokens } from "../theme/theme";
import { WalletIcon } from "../icons/wallet";

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useAptosWallet } from "@/app/context/AptosWalletContext";
import { AptosSwapSDK } from "@/app/hooks/AptosSwapSDK";

// keep your util here
export function formatTinyPrice(numStr?: string) {
    if (!numStr || !numStr.includes(".")) return <>{numStr}</>;
    const [intPart, fracPart] = numStr.split(".");
    let zeroCount = 0;
    while (fracPart[zeroCount] === "0") zeroCount++;
    let significant = fracPart.slice(zeroCount, zeroCount + 4);
    if (significant.length < 4) significant = significant.padEnd(4, "0");
    return (
        <>
            {intPart}.
            {zeroCount > 0 ? (
                <>
                    0<sup>{zeroCount}</sup>
                </>
            ) : null}
            {significant}
        </>
    );
}

export default function TokenSwapForm({
                                          agent,
                                          defaultAmount = 1.0,
                                      }: {
    agent: Agent;
    defaultAmount?: number;
}) {
    // metas (unchanged)
    const agentMeta =
        (agent as any).fa_id || (agent as any).faId || (agent as any).fa_meta || "";
    const baseMeta = "0x000000000000000000000000000000000000000000000000000000000000000a"; // FA meta for wrapped APT
    const tokenSymbol = (agent as any).symbol || agent.tag || agent.name || "AGENT";

    const { wallet, account, isConnected, connect } = useAptosWallet();

    const nodeUrl = process.env.NEXT_PUBLIC_RPC_URL!;
    const moduleAddress = process.env.NEXT_PUBLIC_SWAP_MODULE_ADDRESS!;

    const aptos = useMemo(
        () => new Aptos(new AptosConfig({ network: Network.MAINNET, fullnode: nodeUrl })),
        [nodeUrl]
    );
    const sdk = useMemo(
        () =>
            new AptosSwapSDK({
                nodeUrl,
                moduleAddress,
                aptosSDK: aptos,
                defaultSlippageBps: 100,
            }),
        [aptos, moduleAddress]
    );

    // state
    const [amt, setAmt] = useState(String(defaultAmount ?? ""));
    const [receive, setReceive] = useState("");
    const [quote, setQuote] =
        useState<null | Awaited<ReturnType<typeof sdk.quoteExactIn>>>(null);

    // spinners & tx status driven by emitter events
    const [loadingQuote, setLoadingQuote] = useState(false);  // reserves/quote loading
    const [submitting, setSubmitting] = useState(false);      // tx submitting
    const [lastTxHash, setLastTxHash] = useState<string | null>(null);

    // ---- LISTEN TO SDK EMITTER EVENTS ----
    useEffect(() => {
        // generic loading flags
        const offStart = sdk.emitter.on("loading:start", (d) => {
            if (d?.op === "getReserves") setLoadingQuote(true);
            if (d?.op === "submit") setSubmitting(true);
        });
        const offEnd = sdk.emitter.on("loading:end", (d) => {
            if (d?.op === "getReserves") setLoadingQuote(false);
            // note: submit path doesn't emit loading:end; handled by tx:success below
        });

        // reserves changed -> re-quote at same input
        const offRes = sdk.emitter.on("reserves:update", () => {
            // only re-quote when we have a positive numeric amount
            const n = Number(amt);
            if (!isFinite(n) || n <= 0) return;
            // fire & forget; quoteExactIn calls getReserves internally if stale
            (async () => {
                const raw = BigInt(Math.floor(n));
                const q = await sdk.quoteExactIn(baseMeta, agentMeta, raw, true);
                setQuote(q);
                setReceive(q.amountOut.toString());
            })().catch(() => void 0);
        });

        // tx events
        const offSubmitted = sdk.emitter.on("tx:submitted", () => {
            setSubmitting(true);
        });
        const offSuccess = sdk.emitter.on("tx:success", (res) => {
            setSubmitting(false);
            const h = res?.hash || res?.transactionHash || null;
            if (typeof h === "string") setLastTxHash(h);
            // after a tx, refresh reserves and re-quote
            (async () => {
                await sdk.getReserves(baseMeta, agentMeta, { refresh: true });
                const n = Number(amt);
                if (isFinite(n) && n > 0) {
                    const q = await sdk.quoteExactIn(baseMeta, agentMeta, BigInt(Math.floor(n)), true);
                    setQuote(q);
                    setReceive(q.amountOut.toString());
                }
            })().catch(() => void 0);
        });

        const offError = sdk.emitter.on("tx:error", () => {
            setSubmitting(false);
        });

        return () => {
            offStart();
            offEnd();
            offRes();
            offSubmitted();
            offSuccess();
            offError();
        };
    }, [sdk, amt, baseMeta, agentMeta]);

    // initial / on-change BUY re-quote (APT -> AGENT)
    useEffect(() => {
        const n = Number(amt);
        if (!isFinite(n) || n <= 0) {
            setQuote(null);
            setReceive("");
            return;
        }
        let alive = true;
        (async () => {
            setLoadingQuote(true);
            try {
                const raw = BigInt(Math.floor(n));
                const q = await sdk.quoteExactIn(baseMeta, agentMeta, raw, true);
                if (!alive) return;
                setQuote(q);
                setReceive(q.amountOut.toString());
            } finally {
                setLoadingQuote(false);
            }
        })().catch(() => setLoadingQuote(false));
        return () => { alive = false; };
    }, [amt, baseMeta, agentMeta, sdk]);

    // inputs
    const onAmtChange = ({ value }: { value: string }) => setAmt(value);
    const onReceiveChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setReceive(e.target.value.replace(/[^0-9.]/g, ""));

    // display strings
    const spotText = quote ? formatTinyPrice(quote.spotPrice.toPrecision(12)) : "—";
    const execText = quote ? formatTinyPrice(quote.executionPrice.toPrecision(12)) : "—";
    const impactText = quote ? (quote.priceImpact * 100).toFixed(3) + "%" : "—";
    const slipText = quote ? (quote.slippageBps / 100).toFixed(2) + "%" : "—";

    // actions
    const handleBuy = async () => {
        if (!wallet || !account || !quote) return;
        const v = BigInt(Math.floor(Number(amt || "0")));
        const { payload } = await sdk.buildSwapTx(
            baseMeta,     // spend APT
            agentMeta,    // receive AGENT
            v,
            account.address.toString(),
            quote.slippageBps
        );
        await sdk.submitWithWallet(wallet, payload);
        // tx lifecycle handled by emitter (submitting flag + refresh)
    };

    const handleSell = async () => {
        if (!wallet || !account) return;
        const v = BigInt(Math.floor(Number(receive || "0")));
        if (v <= 0n) return;
        const { payload } = await sdk.buildSwapTx(
            agentMeta,    // spend AGENT
            baseMeta,     // receive APT
            v,
            account.address.toString(),
            100
        );
        await sdk.submitWithWallet(wallet, payload);
    };

    return (
        <Box borderRadius={16} bg={colorTokens.blackCustom.a3} maxH="50%" p={4}>
            <Flex justifyContent="space-between" fontSize={13} fontFamily="Sora" fontWeight={300}>
                <Text color="white">Amount to buy</Text>
                <Flex gap={1} align="center">
                    <Text color="white">{amt} APT</Text>
                    <WalletIcon boxSize={5} color={colorTokens.green.darkErin} />
                </Flex>
            </Flex>

            <NumberInput.Root defaultValue={amt} mt={2} onValueChange={onAmtChange}>
                <InputGroup endElement={<Text as="span" px={2} color="white">APT</Text>}>
                    <NumberInput.Input
                        borderRadius={8}
                        borderWidth={1}
                        borderColor={colorTokens.green.dark}
                        bg="rgba(18, 19, 21, 1)"
                        color="white"
                        inputMode="decimal"
                    />
                </InputGroup>
            </NumberInput.Root>

            <Flex justifyContent="space-between" fontSize={13} fontFamily="Sora" fontWeight={300} mt={4}>
                <Text color="white">Receive</Text>
                <Text color="white">{agent.name}</Text>
            </Flex>

            <Input
                borderRadius={8}
                borderWidth={1}
                borderColor={colorTokens.green.dark}
                bg="rgba(18, 19, 21, 1)"
                mt={2}
                placeholder={"0"}
                value={receive}
                onChange={onReceiveChange}
                inputMode="decimal"
            />

            {/* Market info rows with inline spinners (quote/reserve updates) */}
            <Flex direction="column" gap={1} mt={3} color="gray.400" fontSize="sm">
                <HStack>
                    <Text>Spot price:</Text>
                    <Text>{spotText} {tokenSymbol}</Text>
                    {loadingQuote && <Spinner size="xs" />}
                </HStack>
                <HStack>
                    <Text>Execution price:</Text>
                    <Text>{execText} {tokenSymbol}</Text>
                    {loadingQuote && <Spinner size="xs" />}
                </HStack>
                <HStack>
                    <Text>Price impact:</Text>
                    <Text>{impactText}</Text>
                    {loadingQuote && <Spinner size="xs" />}
                </HStack>
                <HStack>
                    <Text>Slippage:</Text>
                    <Text>{slipText}</Text>
                    {loadingQuote && <Spinner size="xs" />}
                </HStack>
                {lastTxHash ? (
                    <HStack>
                        <Text>Last tx:</Text>
                        <Text>{lastTxHash.slice(0, 10)}…</Text>
                    </HStack>
                ) : null}
            </Flex>

            <Flex w="100%" gap="17px" mt={4}>
                {isConnected ? (
                    <>
                        <Button
                            borderRadius={8}
                            bg={colorTokens.green.erin}
                            flex="1"
                            color="rgba(31, 125, 32, 1)"
                            _hover={{ bg: colorTokens.green.erin }}
                            disabled={!quote || loadingQuote || submitting}
                            onClick={handleBuy}
                        >
                            {submitting ? <Spinner size="sm" mr={2} /> : null}
                            Buy
                        </Button>
                        <Button
                            borderRadius={8}
                            flex="1"
                            bg="rgba(231, 55, 55, 1)"
                            color="white"
                            _hover={{ bg: "rgba(231, 55, 55, 1)" }}
                            disabled={loadingQuote || submitting || Number(receive) <= 0}
                            onClick={handleSell}
                        >
                            {submitting ? <Spinner size="sm" mr={2} /> : null}
                            Sell
                        </Button>
                    </>
                ) : (
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
                )}
            </Flex>
        </Box>
    );
}
