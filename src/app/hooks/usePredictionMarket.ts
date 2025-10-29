"use client";

import * as React from "react";
import {useAuthToken} from "@/app/hooks/useAuth";

// ---------- Types (mirrors your backend payloads) ----------
export type MarketStatus = "open" | "resolving" | "resolved";
export type MarketWinner = "yes" | "no" | null;

export type Market = {
    id: string;
    source?: string;
    post_id?: string;
    media_id?: string;
    status: MarketStatus;
    like_threshold?: number;
    like_count?: number;
    likes_needed?: number;
    yes_total?: number;
    no_total?: number;
    winner?: MarketWinner;
    expires_at?: string | Date | null;
    created_at?: string | Date | null;
};

export type MarketsResponse =
    | { items: Market[] }                        // /markets or /markets?expiring=1
    | { fa_id: string; items: Market[] };       // /markets/fa/:fa_id

export type Bet = {
    market_id: string;
    fa_id?: string;
    source?: string;
    post_id?: string;
    status?: MarketStatus;
    winner?: MarketWinner;
    side: "yes" | "no";
    amount: number;
    created_at?: string | Date | null;
};

export type UsePredictionMarketsOptions = {
    /**
     * API base URL (defaults to process.env.NEXT_PUBLIC_API_URL)
     */
    apiBase?: string;
    /**
     * When set, the hook will scope main list fetches/polling to this FA.
     * If omitted, it fetches the global markets list.
     */
    faId?: string;
    /**
     * What list to poll by default.
     * - "all" → GET /markets
     * - "fa"  → GET /markets/fa/:faId (requires faId)
     * - "expiring" → GET /markets/expiring (with fallbacks)
     */
    mode?: "all" | "fa" | "expiring";
    /**
     * Poll interval in ms. Default 10_000.
     */
    pollIntervalMs?: number;
    /**
     * Enable auto polling on mount. Default true.
     */
    autoRefresh?: boolean;
};

export type UsePredictionMarketsReturn = {
    // data
    markets: Market[];
    myBets: Bet[];
    myBetsForFa: Record<string, Bet[]>; // keyed by faId

    // status
    loading: boolean;           // currently fetching the primary list
    loaded: boolean;            // fetched at least once
    lastUpdated: number | null; // Date.now() of last successful list fetch
    error: string | null;
    isPolling: boolean;

    // auth/wallet
    isSignedIn: boolean;
    walletAddress: string | null;
    ensureAuth: () => Promise<string>;      // ensures JWT by prompting wallet sign-in if needed
    promptSignIn: () => Promise<string>;    // same as ensureAuth (explicit name)

    // actions: bets
    placing: boolean;
    placeBet: (params: { marketId: string; side: "yes" | "no"; amount: number }) => Promise<{ ok: boolean; error?: string }>;
    placeFor: (marketId: string, amount: number) => Promise<{ ok: boolean; error?: string }>;
    placeAgainst: (marketId: string, amount: number) => Promise<{ ok: boolean; error?: string }>;

    // fetchers: lists
    refreshNow: () => Promise<void>;
    setAutoRefresh: (enabled: boolean) => void;

    fetchAllMarkets: () => Promise<Market[]>;
    fetchExpiringMarkets: () => Promise<Market[]>;
    fetchMarketsForFa: (faId: string) => Promise<Market[]>;

    fetchMyBets: () => Promise<Bet[]>;
    fetchMyBetsForFa: (faId: string) => Promise<Bet[]>;

    // helpers: resolved views
    isMarketResolved: (m: Market) => boolean;
    betOutcome: (b: Bet) => "WIN" | "LOSE" | "PENDING";
};

// ---------- Hook implementation ----------
export function usePredictionMarketsSDK(opts: UsePredictionMarketsOptions = {}): UsePredictionMarketsReturn {
    const {
        apiBase = process.env.NEXT_PUBLIC_API_URL!,
        faId,
        mode = faId ? "fa" : "all",
        pollIntervalMs = 10_000,
        autoRefresh: autoRefreshDefault = true,
    } = opts;

    const { jwt, address, signIn, authHeader } = useAuthToken();

    // state
    const [markets, setMarkets] = React.useState<Market[]>([]);
    const [myBets, setMyBets] = React.useState<Bet[]>([]);
    const [myBetsForFa, setMyBetsForFa] = React.useState<Record<string, Bet[]>>({});

    const [loading, setLoading] = React.useState<boolean>(false);
    const [loaded, setLoaded] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);
    const [placing, setPlacing] = React.useState<boolean>(false);

    const [isPolling, setIsPolling] = React.useState<boolean>(autoRefreshDefault);
    const [lastUpdated, setLastUpdated] = React.useState<number | null>(null);

    const abortRef = React.useRef<AbortController | null>(null);
    const pollTimerRef = React.useRef<number | null>(null);

    // -------- utils --------
    const safeFetch =
        async (input: RequestInfo | URL, init?: RequestInit) => {
            abortRef.current?.abort();
            const ctrl = new AbortController();
            abortRef.current = ctrl;
            try {
                const res = await fetch(input, { ...(init || {}), signal: ctrl.signal });
                return res;
            } finally {
                // do not clear controller here (kept for cancellation)
            }
        };

    const jsonOrThrow = async (res: Response) => {
        let body: any = null;
        try {
            body = await res.json();
        } catch (_) {
            // ignore
        }
        if (!res.ok) {
            const msg = body?.error || body?.description || `HTTP ${res.status}`;
            throw new Error(msg);
        }
        return body;
    };

    // -------- auth helpers --------
    const ensureAuth = async (): Promise<string> => {
        // Reuse existing JWT if present, else prompt sign-in
        if (jwt) return jwt;
        const token = await signIn();
        return token;
    };

    const promptSignIn = ensureAuth;

    // -------- backend wrappers (routes) --------
    const fetchAllMarkets = async (): Promise<Market[]> => {
        const res = await safeFetch(`${apiBase}/markets`);
        const body: MarketsResponse = await jsonOrThrow(res);
        if ("items" in body) return body.items || [];
        return [];
    };

    const fetchExpiringMarkets = async (): Promise<Market[]> => {
        const res = await safeFetch(`${apiBase}/markets`);
        const body: MarketsResponse = await jsonOrThrow(res);
        if ("items" in body) return body.items || [];
        return [];
    };

    const fetchMarketsForFa =
        async (fa: string): Promise<Market[]> => {
            const res = await safeFetch(`${apiBase}/markets/fa/${encodeURIComponent(fa)}`);
            const body: MarketsResponse = await jsonOrThrow(res);
            if ("items" in body) return body.items || [];
            return [];
        };

    const fetchMyBets = async (): Promise<Bet[]> => {
        await ensureAuth();
        const res = await safeFetch(`${apiBase}/bets`, {
            headers: { "Content-Type": "application/json", ...authHeader() },
        });
        const body = await jsonOrThrow(res);
        // backend returns a list directly
        return Array.isArray(body) ? (body as Bet[]) : [];
    };

    const fetchMyBetsForFa =
        async (fa: string): Promise<Bet[]> => {
            await ensureAuth();
            const res = await safeFetch(`${apiBase}/bets/fa/${encodeURIComponent(fa)}`, {
                headers: { "Content-Type": "application/json", ...authHeader() },
            });
            const body = await jsonOrThrow(res);
            return Array.isArray(body) ? (body as Bet[]) : [];
        };

    const placeBet =
        async (params: { marketId: string; side: "yes" | "no"; amount: number }) => {
            const { marketId, side, amount } = params;
            if (!marketId || (side !== "yes" && side !== "no") || !Number.isFinite(amount) || amount <= 0) {
                return { ok: false, error: "invalid_params" };
            }
            try {
                await ensureAuth();
            } catch (e: any) {
                return { ok: false, error: e?.message || "auth_required" };
            }
            setPlacing(true);
            try {
                const res = await fetch(`${apiBase}/bets`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...authHeader() },
                    body: JSON.stringify({ market_id: marketId, side, amount }),
                });
                const body = await res.json().catch(() => ({}));
                if (!res.ok || body?.ok === false) {
                    return { ok: false, error: body?.error || "place_bet_failed" };
                }
                // opportunistic refresh of markets and bets
                void refreshNow();
                void fetchMyBets().then(setMyBets).catch(() => void 0);
                if (faId) {
                    void fetchMyBetsForFa(faId).then((bets) =>
                        setMyBetsForFa((prev) => ({ ...prev, [faId]: bets }))
                    );
                }
                return { ok: true };
            } catch (e: any) {
                return { ok: false, error: e?.message || "network_error" };
            } finally {
                setPlacing(false);
            }
        };

    const placeFor = (marketId: string, amount: number) => placeBet({ marketId, side: "yes", amount });
    const placeAgainst = (marketId: string, amount: number) => placeBet({ marketId, side: "no", amount });

    // -------- primary list fetch (respects mode/faId) --------
    const _fetchPrimaryList = async (): Promise<Market[]> => {
        if (mode === "fa") {
            if (!faId) return [];
            return await fetchMarketsForFa(faId);
        }
        if (mode === "expiring") {
            return await fetchExpiringMarkets();
        }
        return await fetchAllMarkets();
    };

    const refreshNow = async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await _fetchPrimaryList();
            setMarkets(list);
            setLoaded(true);
            setLastUpdated(Date.now());
        } catch (e: any) {
            setError(e?.message || "fetch_failed");
        } finally {
            setLoading(false);
        }
    };

    const setAutoRefresh = (enabled: boolean) => {
        setIsPolling(enabled);
    };

    // -------- effects: initial load & polling --------
    React.useEffect(() => {
        // initial fetch
        void refreshNow();
        // preload bets (if signed in or will sign in)
        void fetchMyBets().then(setMyBets).catch(() => void 0);
        if (faId) {
            void fetchMyBetsForFa(faId).then((bets) =>
                setMyBetsForFa((prev) => ({ ...prev, [faId]: bets }))
            );
        }
        // cleanup on unmount
        return () => {
            abortRef.current?.abort();
        };
    }, []); // run once

    React.useEffect(() => {
        if (!isPolling) {
            if (pollTimerRef.current) {
                window.clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
            return;
        }
        // start polling
        pollTimerRef.current = window.setInterval(() => {
            void refreshNow();
        }, Math.max(1000, pollIntervalMs));
        return () => {
            if (pollTimerRef.current) {
                window.clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
        };
    }, [isPolling, pollIntervalMs, refreshNow]);

    // -------- helpers: resolved views --------
    const isMarketResolved = React.useCallback((m: Market) => m.status === "resolved", []);
    const betOutcome = React.useCallback((b: Bet): "WIN" | "LOSE" | "PENDING" => {
        if (!b?.winner || b.status !== "resolved") return "PENDING";
        return b.winner === b.side ? "WIN" : "LOSE";
    }, []);

    return {
        // data
        markets,
        myBets,
        myBetsForFa,

        // status
        loading,
        loaded,
        lastUpdated,
        error,
        isPolling,

        // auth/wallet
        isSignedIn: !!jwt,
        walletAddress: address ?? null,
        ensureAuth,
        promptSignIn,

        // actions
        placing,
        placeBet,
        placeFor,
        placeAgainst,

        // fetchers / controls
        refreshNow,
        setAutoRefresh,
        fetchAllMarkets,
        fetchExpiringMarkets,
        fetchMarketsForFa,
        fetchMyBets,
        fetchMyBetsForFa,

        // helpers
        isMarketResolved,
        betOutcome,
    };
}
