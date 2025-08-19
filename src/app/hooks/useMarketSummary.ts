"use client";
import { useEffect, useRef, useState } from "react";

export type MarketSummary = {
    price_apt: number;
    price_usd: number;
    market_cap_usd: number;
    liquidity_usd: number;
    volume_24h_usd: number;
    apt_usd: number;
    pair_address: string;
    stale: { apt_usd_over_60m: boolean };
    at: string;
};

export function useMarketSummary(faId: string | undefined, refreshMs = 60_000) {
    const [data, setData] = useState<MarketSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const timer = useRef<number | null>(null);

    const fetchOnce = async (isRefresh = false) => {
        if (!faId) return;
        isRefresh ? setRefreshing(true) : setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/market-summary?fa_id=${faId}`, { cache: "no-store" });
            if (!res.ok) throw new Error(await res.text());
            const j = await res.json();
            setData(j);
        } catch (e) {
            console.error("market-summary error", e);
        } finally {
            isRefresh ? setRefreshing(false) : setLoading(false);
        }
    };

    useEffect(() => {
        fetchOnce(false);
        if (timer.current) window.clearInterval(timer.current);
        timer.current = window.setInterval(() => fetchOnce(true), refreshMs) as unknown as number;
        return () => { if (timer.current) window.clearInterval(timer.current); };
    }, [faId, refreshMs]);

    return { data, loading, refreshing, refetch: () => fetchOnce(true) };
}
