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
import { useSearchParams } from "next/navigation";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { Network } from "aptos";

import { useAgentsInfinite } from "@/app/hooks/useAgentsInfinite";
import type { Agent } from "@/app/types/agent";
import { useColorModeValue } from "@/components/ui/color-mode";
import { AgentListCard } from "@/app/components/Agents/AgentListCard";
import { colorTokens } from "@/app/components/theme/theme";
import {
  verifyPaymentTransaction,
  PaymentVerificationError,
} from "@/app/lib/utils/verifyPaymentTransaction";
import { Banner } from "@/app/components/Banner/Banner";

function useDebounced<T>(value: T, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

type Sort = "newest" | "oldest";

const TREASURY_ADDRESS =
  "0x24cc3a079fcecd1ec7d71bfc71639765a60cab04514b950728fb83285c271596";
const DEFAULT_APTOS_NODE_URL =
  "https://ultra-withered-patina.aptos-mainnet.quiknode.pro/804be4e05ef290503e6020df7efd44fb2ad52b8c/v1";

const shortenHash = (hash: string) =>
  hash.length > 18 ? `${hash.slice(0, 10)}�${hash.slice(-6)}` : hash;

export default function AgentExplorerPage() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const txHash = searchParams.get("tx")?.trim() ?? "";

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "checking" | "success" | "error"
  >("idle");
  const [verificationMessage, setVerificationMessage] = useState<string>("");

  const debounced = useDebounced(query, 350);

  const aptosClient = useMemo(() => {
    const config = new AptosConfig({
      network: Network.MAINNET,
      fullnode:
        process.env.NEXT_PUBLIC_APTOS_NODE_URL ?? DEFAULT_APTOS_NODE_URL,
    });
    return new Aptos(config);
  }, []);

  const minFeeOctas = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_VIDEO_JOB_MIN_FEE_OCTAS ?? "1000000";
    try {
      return BigInt(raw);
    } catch {
      console.warn(
        "NEXT_PUBLIC_VIDEO_JOB_MIN_FEE_OCTAS is invalid. Falling back to 1_000_000 octas (0.01 APT)."
      );
      return 1_000_000n;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!txHash) {
      setVerificationStatus("idle");
      setVerificationMessage("");
      return () => {
        cancelled = true;
      };
    }

    setVerificationStatus("checking");
    setVerificationMessage("");

    (async () => {
      try {
        const verified = await verifyPaymentTransaction({
          aptos: aptosClient,
          transactionHash: txHash,
          expectedReceiver: TREASURY_ADDRESS,
          minAmount: minFeeOctas,
        });

        if (cancelled) return;
        setVerificationStatus("success");
        setVerificationMessage(
          `Payment confirmed for ${shortenHash(
            txHash
          )}. Amount: ${verified.amount.toString()} octas.`
        );
      } catch (error) {
        if (cancelled) return;
        setVerificationStatus("error");
        if (error instanceof PaymentVerificationError) {
          setVerificationMessage(error.message);
        } else {
          console.error("Unexpected payment verification error", error);
          setVerificationMessage("Unexpected payment verification error.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [txHash, aptosClient, minFeeOctas]);

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
    <Flex
      flexDir="column"
      position="relative"
      overflowX="hidden"
      overflowY="scroll"
      px={{ base: 3, md: 6 }}
      h="full"
    >
      {/* <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        bgSize="100% 100%, 24px 24px, 24px 24px"
        opacity={0.5}
      />
      <Box position="absolute" inset={0} pointerEvents="none" /> */}

      <Flex
        direction="column"
        py={{ base: 4, md: 8 }}
        gap={5}
        position="relative"
        w="full"
        maxW={1620}
        mx="auto"
      >
        <Flex gap={15} direction={{ base: "column", md: "row" }}>
          <Banner
            text="Build your persona"
            buttonText="Create your AI agent in seconds"
            image="/img/new/banner1.webp"
            href="/"
          />
          <Banner
            text="Invite & Earn"
            buttonText="Share your link, complete tasks, and earn rewards with friends."
            image="/img/new/banner2.webp"
            href="/referrals"
          />
          <Banner
            text="Climb the ranks."
            buttonText="Track your referrals and see who’s leading the community."
            image="/img/new/banner3.webp"
            href="/referrals"
          />
        </Flex>
        <Text color="white" fontFamily="inter" fontSize={16}>
          Community Agents
        </Text>
        {txHash && (
          <Flex
            w={{ base: "100%", md: "70%" }}
            bg="rgba(62, 255, 150, 0.08)"
            border={`1px solid ${neonSoft}`}
            borderRadius="lg"
            py={3}
            align="center"
            gap={3}
          >
            {verificationStatus === "checking" && (
              <Spinner size="sm" color={neon} />
            )}
            <Text
              color={verificationStatus === "error" ? "red.300" : neon}
              fontSize="sm"
            >
              {verificationStatus === "checking"
                ? `Verifying payment for ${shortenHash(txHash)}�`
                : verificationMessage ||
                  `Awaiting verification for ${shortenHash(txHash)}`}
            </Text>
          </Flex>
        )}
        {/* {isLoading && !data && (
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
        )} */}
        {isError && (
          <Text color="red.400">Failed to load agents. Please try again.</Text>
        )}
        <SimpleGrid
          w="full"
          minChildWidth="350px"
          justifyItems="center"
          alignItems="start"
          flex={1}
          columns={{ base: 2, sm: 2, md: 4, lg: 4, xl: 5 }}
          gap="2rem 2rem"
        >
          {agents.map((agent) => (
            <Box
              key={agent.fa_id}
              role="button"
              onClick={() => agent.fa_id && openAgent(agent.fa_id)}
              cursor="pointer"
              _hover={{
                transform: "translateY(-2px)",
              }}
              transition="all 160ms ease"
              w="100%"
            >
              <AgentListCard agent={agent} />
            </Box>
          ))}
        </SimpleGrid>
        <Flex justify="center">
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
          ) : null}
        </Flex>
        <Box ref={sentinelRef} h="1px" />
      </Flex>
    </Flex>
  );
}
