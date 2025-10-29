// prediction-market-sdk.ts
import { Aptos } from "@aptos-labs/ts-sdk";
import type { InputTransactionData } from "@aptos-labs/wallet-adapter-core";

// Optional wallet interface (Petra-like)
export type WalletLike = {
    signAndSubmitTransaction: (tx: InputTransactionData) => Promise<{ hash: string } | any>;
};

const strip0x = (h: string) => (h.startsWith("0x") ? h.slice(2) : h);
const normalizeAddr = (a: string): `0x${string}` =>
    (`0x${strip0x(a).toLowerCase().padStart(64, "0")}` as const);
const u64 = (v: number | string | bigint) => BigInt(v).toString();

export type PMInit = {
    /** Aptos RPC client (already configured with your network/RPC URL) */
    aptosSDK: Aptos;
    /** On-chain package/account address that deployed pm::interface (e.g. "0x...") */
    moduleAddress: string;
    /** Optional: default sender address for transaction builders (wallet can override) */
    defaultSender?: string;
    /** Optional: base URL for your backend REST (e.g. "https://api.yourapp.com") */
    apiBase?: string;
    /** Optional: custom fetch implementation (defaults to globalThis.fetch) */
    fetchFn?: typeof fetch;
    /** Optional: override path prefix if your routes live under a sub-path */
    routesPrefix?: string; // default ""
};

export type MarketDoc = {
    id?: string;
    market_id?: number;
    tweet_id?: string;
    source?: "twitter";
    agent_fa_id?: string;
    admin_addr?: string;
    asset_meta?: string;
    expiry_ts?: number;
    expiry_mode?: 0 | 1 | 2;
    like_threshold?: number;
    like_count?: number;
    likes_needed?: number;
    status?: "open" | "resolved" | "cancelled";
    winner?: "yes" | "no" | null;
    [k: string]: any;
};

export type MarketsByFAResponse = {
    fa_id: string;
    items: MarketDoc[];
};

export type StakeEvent = {
    event_index: number;
    market_id: number;
    wallet: string;   // lowercased address
    side: "yes" | "no";
    amount: number;
};

export type BetFromTxResponse =
    | { ok: true; tx_hash: string; events: StakeEvent[]; inserted: number }
    | { ok: false; error: string; details?: string };

export type WalletBet = {
    market_id: number;
    tweet_id?: string;
    status?: string;
    winner?: "yes" | "no" | null;
    like_count?: number;
    likes_needed?: number;
    last_like_refresh_at?: string;
    next_refresh_at?: string;
    expiry_ts?: number;
    positions?: { side: "yes" | "no"; amount: number }[];
    [k: string]: any;
};
// --- Add these near other types ---
export type ClaimEvent = {
    event_index: number;
    market_id: number;
    wallet: string;
    amount: number;
};

export type ClaimFromTxResponse =
    | { ok: true; tx_hash: string; events: ClaimEvent[]; inserted: number }
    | { ok: false; error: string; details?: string };

export class PredictionMarketSDK {
    readonly aptos: Aptos;
    readonly moduleAddress: `0x${string}`;
    readonly interfaceModule: `${string}::${string}`;
    private readonly defaultSender?: `0x${string}`;

    // REST
    private readonly apiBase?: string;
    private readonly fetchFn: typeof fetch;
    private readonly routesPrefix: string;

    constructor(opts: PMInit) {
        this.aptos = opts.aptosSDK;
        this.moduleAddress = normalizeAddr(opts.moduleAddress);
        this.interfaceModule = `${this.moduleAddress}::interface`;
        this.defaultSender = opts.defaultSender ? normalizeAddr(opts.defaultSender) : undefined;

        this.apiBase = opts.apiBase?.replace(/\/+$/, ""); // trim trailing slash
        this.fetchFn = opts.fetchFn ?? globalThis.fetch.bind(globalThis);
        this.routesPrefix = (opts.routesPrefix ?? "").replace(/^\/+|\/+$/g, ""); // no leading/trailing slashes
    }

    // -------------------- Address helpers --------------------
    static normalizeAddress(a: string) {
        return normalizeAddr(a);
    }

    // -------------------- Tx Builders (pure payloads) --------------------
    buildCreateMarketTx(
        assetMeta: string,
        expiryTs: number | string | bigint,
        expiryMode: 0 | 1 | 2,
        sender?: string
    ): InputTransactionData {
        return {
            ...(sender || this.defaultSender ? { sender: (sender ? normalizeAddr(sender) : this.defaultSender)! } : {}),
            data: {
                function: `${this.interfaceModule}::create_market`,
                typeArguments: [],
                functionArguments: [normalizeAddr(assetMeta), u64(expiryTs), Number(expiryMode)],
            },
        };
    }

    buildResolveTx(
        marketId: number | string | bigint,
        winnerYes: boolean,
        sender?: string
    ): InputTransactionData {
        return {
            ...(sender || this.defaultSender ? { sender: (sender ? normalizeAddr(sender) : this.defaultSender)! } : {}),
            data: {
                function: `${this.interfaceModule}::resolve`,
                typeArguments: [],
                functionArguments: [u64(marketId), Boolean(winnerYes)],
            },
        };
    }

    buildCancelMarketTx(
        marketId: number | string | bigint,
        sender?: string
    ): InputTransactionData {
        return {
            ...(sender || this.defaultSender ? { sender: (sender ? normalizeAddr(sender) : this.defaultSender)! } : {}),
            data: {
                function: `${this.interfaceModule}::cancel_market`,
                typeArguments: [],
                functionArguments: [u64(marketId)],
            },
        };
    }

    buildFinalizeExpiryTx(
        marketId: number | string | bigint,
        sender?: string
    ): InputTransactionData {
        return {
            ...(sender || this.defaultSender ? { sender: (sender ? normalizeAddr(sender) : this.defaultSender)! } : {}),
            data: {
                function: `${this.interfaceModule}::finalize_expiry`,
                typeArguments: [],
                functionArguments: [u64(marketId)],
            },
        };
    }

    buildStakeYesTx(
        marketId: number | string | bigint,
        amount: number | string | bigint,
        sender?: string
    ): InputTransactionData {
        return {
            ...(sender || this.defaultSender ? { sender: (sender ? normalizeAddr(sender) : this.defaultSender)! } : {}),
            data: {
                function: `${this.interfaceModule}::stake_yes`,
                typeArguments: [],
                functionArguments: [u64(marketId), u64(amount)],
            },
        };
    }

    buildStakeNoTx(
        marketId: number | string | bigint,
        amount: number | string | bigint,
        sender?: string
    ): InputTransactionData {
        return {
            ...(sender || this.defaultSender ? { sender: (sender ? normalizeAddr(sender) : this.defaultSender)! } : {}),
            data: {
                function: `${this.interfaceModule}::stake_no`,
                typeArguments: [],
                functionArguments: [u64(marketId), u64(amount)],
            },
        };
    }

    buildClaimTx(
        marketId: number | string | bigint,
        sender?: string
    ): InputTransactionData {
        return {
            ...(sender || this.defaultSender ? { sender: (sender ? normalizeAddr(sender) : this.defaultSender)! } : {}),
            data: {
                function: `${this.interfaceModule}::claim`,
                typeArguments: [],
                functionArguments: [u64(marketId)],
            },
        };
    }

    // -------------------- Convenience submitters (Petra-like) --------------------
    async submitWithWallet(wallet: WalletLike, payload: InputTransactionData) {
        return wallet.signAndSubmitTransaction(payload as any);
    }

    async createMarketWithWallet(
        wallet: WalletLike,
        assetMeta: string,
        expiryTs: number | string | bigint,
        expiryMode: 0 | 1 | 2,
        sender?: string
    ) {
        return this.submitWithWallet(
            wallet,
            this.buildCreateMarketTx(assetMeta, expiryTs, expiryMode, sender)
        );
    }

    async resolveWithWallet(
        wallet: WalletLike,
        marketId: number | string | bigint,
        winnerYes: boolean,
        sender?: string
    ) {
        return this.submitWithWallet(wallet, this.buildResolveTx(marketId, winnerYes, sender));
    }

    async cancelMarketWithWallet(
        wallet: WalletLike,
        marketId: number | string | bigint,
        sender?: string
    ) {
        return this.submitWithWallet(wallet, this.buildCancelMarketTx(marketId, sender));
    }

    async finalizeExpiryWithWallet(
        wallet: WalletLike,
        marketId: number | string | bigint,
        sender?: string
    ) {
        return this.submitWithWallet(wallet, this.buildFinalizeExpiryTx(marketId, sender));
    }

    async stakeYesWithWallet(
        wallet: WalletLike,
        marketId: number | string | bigint,
        amount: number | string | bigint,
        sender?: string
    ) {
        return this.submitWithWallet(wallet, this.buildStakeYesTx(marketId, amount, sender));
    }

    async stakeNoWithWallet(
        wallet: WalletLike,
        marketId: number | string | bigint,
        amount: number | string | bigint,
        sender?: string
    ) {
        return this.submitWithWallet(wallet, this.buildStakeNoTx(marketId, amount, sender));
    }

    async claimWithWallet(
        wallet: WalletLike,
        marketId: number | string | bigint,
        sender?: string
    ) {
        return this.submitWithWallet(wallet, this.buildClaimTx(marketId, sender));
    }

    // -------------------- Aptos helpers --------------------
    /** Wait until a tx hash is executed (delegates to Aptos SDK) */
    async waitForTransaction(txHash: string, opts?: { timeoutSecs?: number }) {
        return this.aptos.waitForTransaction({ transactionHash: txHash });
    }

    // -------------------- Backend REST (optional) --------------------
    /** GET /prediction-markets/markets/:fa_id */
    async fetchMarketsForFA(faId: string): Promise<MarketsByFAResponse> {
        this._ensureApi();
        const url = this._u(`/prediction-markets/markets/${faId}`);
        const res = await this.fetchFn(url, { method: "GET" });
        await this._assertOk(res, "fetchMarketsForFA");
        return (await res.json()) as MarketsByFAResponse;
    }

    /** POST /prediction-markets/bet-from-tx  { tx_hash } */
    async recordBetFromTx(txHash: string): Promise<BetFromTxResponse> {
        this._ensureApi();
        const url = this._u(`/prediction-markets/bet-from-tx`);
        const res = await this.fetchFn(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tx_hash: txHash }),
        });
        // this endpoint uses 200 or 4xx with json; return parsed either way
        const body = await res.json().catch(() => ({}));
        if (!res.ok && body?.ok !== true) return body as BetFromTxResponse;
        return body as BetFromTxResponse;
    }
    /** POST /prediction-markets/claim-from-tx  { tx_hash } */
    async recordClaimFromTx(txHash: string): Promise<ClaimFromTxResponse> {
        this._ensureApi();
        const url = this._u(`/prediction-markets/claim-from-tx`);
        const res = await this.fetchFn(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tx_hash: txHash }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok && body?.ok !== true) return body as ClaimFromTxResponse;
        return body as ClaimFromTxResponse;
    }

    /** GET /prediction-markets/wallet/:wallet */
    async fetchWalletBets(wallet: string): Promise<WalletBet[]> {
        this._ensureApi();
        const url = this._u(`/prediction-markets/wallet/${wallet}`);
        const res = await this.fetchFn(url, { method: "GET" });
        await this._assertOk(res, "fetchWalletBets");
        return (await res.json()) as WalletBet[];
    }

    // -------------------- Config mutators --------------------
    setModuleAddress(addr: string) {
        (this as any).moduleAddress = normalizeAddr(addr);
        (this as any).interfaceModule = `${this.moduleAddress}::interface`;
        return this;
    }

    setApiBase(url: string) {
        (this as any).apiBase = url.replace(/\/+$/, "");
        return this;
    }

    setDefaultSender(addr?: string) {
        (this as any).defaultSender = addr ? normalizeAddr(addr) : undefined;
        return this;
    }

    // -------------------- internals --------------------
    private _ensureApi() {
        if (!this.apiBase) {
            throw new Error("PredictionMarketSDK: apiBase not set. Pass it in the constructor or call setApiBase().");
        }
    }

    private _u(path: string) {
        const prefix = this.routesPrefix ? `/${this.routesPrefix}` : "";
        return `${this.apiBase}${prefix}${path}`;
    }

    private async _assertOk(res: Response, label: string) {
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`${label} failed: HTTP ${res.status} ${text}`);
        }
    }
}
