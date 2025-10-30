"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Flex, SimpleGrid, Spinner, Text } from "@chakra-ui/react";
import { PredictionMarket } from "@/app/components/Media/PredictionMarket";
import type { MarketDefinition } from "@/app/components/Media/PredictionMarket";
import type { MarketDocument, MarketsResponse } from "@/app/types/market";
import { useAuthToken } from "@/app/hooks/useAuth";
import {
  extractMarkets,
  marketToDefinition,
} from "@/app/lib/utils/predictionMarkets";
import { colorTokens } from "@/app/components/theme/theme";

type MarketWithDefinition = {
  market: MarketDocument;
  definition: MarketDefinition;
};

export default function PredictionsPage() {
  const [markets, setMarkets] = useState<MarketDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [placingMarketId, setPlacingMarketId] = useState<string | null>(null);

  const { signIn, authHeader } = useAuthToken();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const ensureAuthHeader = useCallback(async () => {
    const header = authHeader();
    if (header.Auth) {
      return header;
    }
    await signIn();
    const refreshed = authHeader();
    if (!refreshed.Auth) {
      throw new Error("Wallet authentication required to place a bet");
    }
    return refreshed;
  }, [authHeader, signIn]);

  const loadMarkets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/markets", { cache: "no-store" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message =
          (body && typeof body.message === "string" && body.message) ||
          `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      const payload = (await response.json()) as MarketsResponse;
      if (!isMountedRef.current) return;
      setMarkets(extractMarkets(payload));
      setHasFetched(true);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(
        err instanceof Error ? err.message : "Failed to load predictions"
      );
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadMarkets();
  }, [loadMarkets]);

  const marketsWithDefinitions = useMemo<MarketWithDefinition[]>(() => {
    return markets.map((market) => ({
      market,
      definition: marketToDefinition(market),
    }));
  }, [markets]);

  const handlePredict = useCallback(
    async (direction: "for" | "against", marketId?: string, stake?: number) => {
      if (!marketId) {
        setActionError("Market identifier missing");
        return;
      }

      const amount = Math.max(1, Math.round(Number(stake ?? 0)));
      if (!Number.isFinite(amount) || amount <= 0) {
        setActionError("Enter a stake greater than zero.");
        return;
      }

      const side = direction === "against" ? "no" : "yes";

      setPlacingMarketId(marketId);
      setActionError(null);

      try {
        const headers = await ensureAuthHeader();
        const response = await fetch("/api/bets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            market_id: marketId,
            side,
            amount,
          }),
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok || body?.ok === false) {
          const message =
            typeof body?.error === "string"
              ? body.error
              : typeof body?.message === "string"
              ? body.message
              : "Bet placement failed";
          throw new Error(message);
        }

        await loadMarkets();
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : "Failed to place bet"
        );
      } finally {
        if (isMountedRef.current) {
          setPlacingMarketId(null);
        }
      }
    },
    [ensureAuthHeader, loadMarkets]
  );

  return (
    <Flex flex={1} overflowY="auto" justify="center" px={{ base: 4, lg: 6 }}>
      <Flex direction="column" w="full" maxW="1620px" py={6}>
        <Text
          fontFamily="inter"
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight={600}
          color="white"
        >
          Predictions
        </Text>

        <Box mt={6} pb={6}>
          {error ? (
            <Text color="red.300" fontSize="sm">
              {error}
            </Text>
          ) : null}

          {actionError ? (
            <Text mt={error ? 2 : 0} color="red.300" fontSize="sm">
              {actionError}
            </Text>
          ) : null}

          {loading ? (
            <Flex align="center" justify="center" py={6}>
              <Spinner color={colorTokens.gray.timberwolf} />
            </Flex>
          ) : null}

          {!loading && hasFetched && !error && marketsWithDefinitions.length === 0 ? (
            <Text color="gray.300" fontSize="sm">
              No markets available yet.
            </Text>
          ) : null}

          {marketsWithDefinitions.length > 0 ? (
            <SimpleGrid
              mt={error || loading ? 4 : 0}
              columns={{ base: 1, md: 2, xl: 3, "2xl": 4 }}
              gap={{ base: 2, lg: 4 }}
            >
              {marketsWithDefinitions.map(({ market, definition }) => (
                <Box
                  key={market.id}
                  // px={{ base: 4, md: 5 }}
                  // py={{ base: 5, md: 6 }}
                  // borderRadius="2xl"
                  // borderWidth="1px"
                  // borderColor={colorTokens.blackCustom.a3}
                  // bg={colorTokens.blackCustom.a2}
                  // position="relative"
                  // overflow="hidden"
                >
                  <PredictionMarket
                    videoId={market.post_id ?? undefined}
                    marketId={market.id}
                    isSubmitting={placingMarketId === market.id}
                    onPredict={handlePredict}
                    definition={definition}
                  />
                </Box>
              ))}
            </SimpleGrid>
          ) : null}
        </Box>
      </Flex>
    </Flex>
  );
}
