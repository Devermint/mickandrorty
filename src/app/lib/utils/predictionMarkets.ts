import type { MarketDefinition } from "@/app/components/Media/PredictionMarket";
import type { MarketDocument, MarketsResponse } from "@/app/types/market";

export const extractMarkets = (payload: MarketsResponse): MarketDocument[] => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload.items)) {
    return payload.items;
  }
  return [];
};

export const formatMarketDateLabel = (
  value: MarketDocument["expires_at"]
): string | null => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const marketToDefinition = (
  market: MarketDocument
): MarketDefinition => {
  const yesTotal = Math.max(0, Number(market.yes_total ?? 0));
  const noTotal = Math.max(0, Number(market.no_total ?? 0));
  const totalVolume = yesTotal + noTotal;
  const yesProbability = totalVolume > 0 ? yesTotal / totalVolume : 0.5;
  const noProbability = totalVolume > 0 ? noTotal / totalVolume : 0.5;

  const likesRemaining = Math.max(0, Number(market.likes_needed ?? 0));
  const likeThreshold = Math.max(0, Number(market.like_threshold ?? 0));
  const currentLikes = Math.max(0, Number(market.like_count ?? 0));
  const expiresLabel = formatMarketDateLabel(market.expires_at);

  const descriptionParts: string[] = [];
  if (likeThreshold > 0) {
    descriptionParts.push(`Goal ${likeThreshold.toLocaleString()} likes`);
  }
  descriptionParts.push(`${currentLikes.toLocaleString()} likes now`);
  if (likesRemaining > 0) {
    descriptionParts.push(`${likesRemaining.toLocaleString()} likes remaining`);
  }
  if (expiresLabel) {
    descriptionParts.push(`Closes ${expiresLabel}`);
  }

  const description =
    descriptionParts.filter(Boolean).join(" • ") ||
    "Forecast engagement and place your prediction.";

  const upperSource =
    market.source && market.source.length > 0
      ? market.source.charAt(0).toUpperCase() + market.source.slice(1)
      : "Prediction";
  const identifier = market.post_id ?? market.media_id ?? market.id.slice(-6);

  const title =
    likeThreshold > 0
      ? `Will this ${upperSource} post hit ${likeThreshold.toLocaleString()} likes?`
      : `${upperSource} market ${identifier}`;

  const volumeLabel =
    totalVolume > 0
      ? `${totalVolume.toLocaleString()} total wagers`
      : "No wagers yet";

  const backgroundVideo =
    typeof market.media_url === "string" && market.media_url.trim().length > 0
      ? market.media_url.trim()
      : undefined;

  return {
    title,
    description,
    avatar: "prediction-market/photo.png",
    backgroundImage: "prediction-market/trum.png",
    backgroundVideo,
    volumeLabel,
    poolTotals: {
      yes: yesTotal,
      no: noTotal,
      total: yesTotal + noTotal,
    },
    outcomes: [
      {
        id: "yes",
        name: "Yes",
        probability: yesProbability,
        prices: {
          yes: yesProbability,
          no: noProbability,
        },
      },
      {
        id: "no",
        name: "No",
        probability: noProbability,
        prices: {
          yes: noProbability,
          no: yesProbability,
        },
      },
    ],
  };
};
