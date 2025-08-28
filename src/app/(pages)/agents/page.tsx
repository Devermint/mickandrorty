"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Spinner,
  Text,
  Skeleton,
} from "@chakra-ui/react";
import { useTransitionRouter } from "next-view-transitions";
import { useAgentsInfinite } from "@/app/hooks/useAgentsInfinite";
import type { Agent } from "@/app/types/agent";
import { useColorModeValue } from "@/components/ui/color-mode";
import { AgentListCard } from "@/app/components/Agents/AgentListCard";
import { colorTokens } from "@/app/components/theme/theme";

function useDebounced<T>(value: T, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

type Sort = "newest" | "oldest";

export default function AgentExplorerPage() {
  const router = useTransitionRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const debounced = useDebounced(query, 350);

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useAgentsInfinite({ search: debounced, sort, limit: 24 });

  const agents: Agent[] = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.items) as Agent[],
    [data]
  );

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasNextPage || !sentinelRef.current) return;
    const ob = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) fetchNextPage();
      },
      { rootMargin: "600px" }
    );
    ob.observe(sentinelRef.current);
    return () => ob.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const neon = "#56f09f";
  const neonSoft = "rgba(86, 240, 159, 0.15)";
  const cardBg = useColorModeValue("rgba(14,16,18,0.6)", "rgba(14,16,18,0.6)");
  const border = "rgba(86, 240, 159, 0.18)";

  const openAgent = (faId: string) => router.push(`/agent/${faId}`);

  return (
    <Box position="relative" overflowX="hidden" overflowY="scroll">
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        bgSize="100% 100%, 24px 24px, 24px 24px"
        opacity={0.5}
      />
      <Box position="absolute" inset={0} pointerEvents="none" />

      <Flex
        direction="column"
        px={{ base: 3, md: 6 }}
        py={{ base: 4, md: 8 }}
        gap={5}
        position="relative"
        w="100%"
        align="center"
      >
        {isLoading && !data && (
          <SimpleGrid
            columns={{ base: 2, sm: 2, md: 3, lg: 4, xl: 5 }}
            gap="2rem 2rem"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="shine"
                height="250px"
                borderRadius="xl"
                css={{
                  "--start-color": "rgba(0, 255, 119, 0.6)",
                  "--end-color": "rgba(86, 240, 158, 0.34)",
                }}
              />
            ))}
          </SimpleGrid>
        )}

        {isError && (
          <Text color="red.400">Failed to load agents. Please try again.</Text>
        )}

        <SimpleGrid
          w={{ base: "90%", md: "70%" }}
          minChildWidth="220px"
          justifyItems="center"
          alignItems="start"
          flex={1}
          maxW={{ base: "90%", md: "70%" }}
          columns={{ base: 2, sm: 2, md: 3, lg: 4, xl: 5 }}
          gap="2rem 2rem"
        >
          {agents.map((agent) => (
            <Box
              key={agent.fa_id}
              role="button"
              onClick={() => agent.fa_id && openAgent(agent.fa_id)}
              cursor="pointer"
              bg={cardBg}
              border={`1px solid ${border}`}
              borderRadius={20}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: `0 0 0 1px ${neonSoft}, 0 0 24px ${neonSoft}`,
              }}
              transition="all 160ms ease"
            >
              <AgentListCard agent={agent} />
            </Box>
          ))}
        </SimpleGrid>

        <Flex justify="center" py={6}>
          {isFetchingNextPage ? (
            <Spinner color={neon} />
          ) : hasNextPage ? (
            <Button
              onClick={() => fetchNextPage()}
              variant="outline"
              borderColor={border}
              color={neon}
              _hover={{ borderColor: neon, boxShadow: `0 0 0 1px ${neonSoft}` }}
            >
              Load more
            </Button>
          ) : agents.length > 0 ? (
            <Text color={colorTokens.green.darkErin}>No more agents</Text>
          ) : null}
        </Flex>

        <Box ref={sentinelRef} h="1px" />
      </Flex>
    </Box>
  );
}
