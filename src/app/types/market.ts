export type MarketStatus = "open" | "resolving" | "resolved";

export type MarketWinner = "yes" | "no" | null;

export type MarketDocument = {
  id: string;
  source: string;
  post_id?: string | null;
  media_id?: string | null;
  media_url?: string | null;
  status: MarketStatus;
  like_threshold?: number | null;
  like_count?: number | null;
  likes_needed?: number | null;
  yes_total?: number | null;
  no_total?: number | null;
  winner?: MarketWinner;
  created_at?: string | null;
  expires_at?: string | null;
};

export type MarketsEnvelope = { items: MarketDocument[] };

export type MarketsResponse = MarketDocument[] | MarketsEnvelope;
