import { useQuery } from "@tanstack/react-query";

type MarketSummary = {
  fa_id: string;
  pair_address: string;
  price_apt: number;
  price_usd: number;
  apt_usd: number;
  market_cap_usd: number;
  liquidity_usd: number;
  volume_24h_usd: number;
  reserves: {
    agent_raw: string;
    agent_decimals: number;
    apt_raw: string;
    apt_decimals: number;
  };
  stale: {
    apt_usd_over_60m: boolean;
  };
  at: string; // ISO timestamp
};

export const useMarketSummary = (faId: string) => {
  return useQuery<MarketSummary>({
    queryKey: ["market-summary", faId],
    queryFn: async () => {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/market-summary?fa_id=${faId}`;
      const res = await fetch(url);
      if (!res.ok)
        throw new Error(`Failed to fetch market summary for ${faId}`);
      return res.json();
    },
    enabled: !!faId,
    refetchInterval: 60_000, // refresh every minute
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
};
