"use client";

import { Agent } from "@/app/types/agent";
import { colorTokens } from "../theme/theme";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Image,
  Spacer,
  Text,
} from "@chakra-ui/react";
import TokenSwapForm from "../Token/TokenSwapForm";
import { IoChevronBackOutline } from "react-icons/io5";
import { Telegram } from "../icons/telegram";
import { X } from "../icons/x";
import { useRouter } from "next/navigation";
import { AgentMarketInfo } from "./AgentMarketInfo";
import {useMarketSummary} from "@/app/hooks/useMarketSummary";

export const MobileAgentInfoView = ({ agent }: { agent: Agent }) => {
  const router = useRouter();

  // refresh every 10s (10000 ms)
  const { data, loading, refreshing } = useMarketSummary(agent.fa_id, 10_000);
  const busy = loading || refreshing;

  // string formatters for tiles (keep values as strings; AgentMarketCard expects strings)
  const fmtUSD = (n?: number) =>
      n == null || !isFinite(n)
          ? "Nan"
          : n < 1
              ? `$${n.toFixed(4)}`
              : `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const fmtAPT = (n?: number) =>
      n == null || !isFinite(n)
          ? "Nan"
          : n < 0.000001
              ? `${n.toExponential(2)} APT`
              : `${n.toFixed(6)} APT`;

  const priceUsd = fmtUSD(data?.price_usd);
  const priceApt = fmtAPT(data?.price_apt);
  const liquidity = fmtUSD(data?.liquidity_usd);
  const mktCap = fmtUSD(data?.market_cap_usd);

  const handleBackClick = () => {
    router.push("/agents");
  };

  return (
      <Flex
          flexDir="column"
          p={{ base: 4, md: 0 }}
          bg={{ base: colorTokens.blackCustom.a1, md: colorTokens.blackCustom.a2 }}
          h="100%"
          overflow="auto"
          borderRadius={{ base: "none", md: 11 }}
      >
        <Flex
            direction="column"
            align="flex-start"
            flex={1}
            borderRadius={13}
            bg="linear-gradient(rgba(81, 254, 83, 0.09), rgba(81, 254, 83, 0))"
            p={3}
            maxH="100%"
        >
          <IconButton
              color={colorTokens.gray.timberwolf}
              bg="transparent"
              onClick={handleBackClick}
              display={{ base: "block", md: "none" }}
          >
            <IoChevronBackOutline />
          </IconButton>

          <Flex w="100%" justify="center">
            <Box position="relative" w={71} h={71} borderRadius="full" overflow="hidden">
              <Image
                  src="/agents/agent-bg.gif"
                  alt="swirl"
                  width="100%"
                  height="100%"
                  objectFit="cover"
              />
              <Image
                  src={agent.image}
                  alt="overlay icon"
                  position="absolute"
                  top="5"
                  left="0"
                  width="100%"
                  height="100%"
                  objectFit="contain"
                  pointerEvents="none"
              />
            </Box>
          </Flex>

          <Flex w="100%" justifyContent="space-between" mt={5}>
            <Box>
              <Text fontSize={15} fontWeight={300} color={colorTokens.gray.timberwolf}>
                {agent.name}
              </Text>
              <Text fontSize="xs" color={colorTokens.gray.platinum}>
                {agent.tag}
              </Text>
            </Box>

            <Flex gap={2}>
              <Button
                  borderRadius={22}
                  p={4}
                  h={10}
                  w={10}
                  borderWidth={1}
                  borderColor={colorTokens.gray.platinum}
                  bgColor="#090A0B"
              >
                <X h={13} w={13} color={colorTokens.gray.timberwolf} />
              </Button>
              <Button
                  borderRadius={22}
                  p={4}
                  h={10}
                  w={10}
                  borderWidth={1}
                  borderColor={colorTokens.gray.platinum}
                  bgColor="#090A0B"
              >
                <Telegram h={13} w="14px" mr={0.5} color={colorTokens.gray.timberwolf} />
              </Button>
            </Flex>
          </Flex>

          {/* Auto-refresh every 10s via hook; per-tile spinners controlled by `loading` prop */}
          <AgentMarketInfo
              priceUsd={priceUsd}
              price={priceApt}
              liquidity={liquidity}
              mktCap={mktCap}
              loading={busy}
              mt={5}
          />
        </Flex>

        <Spacer />
        <TokenSwapForm agent={agent} />
      </Flex>
  );
};

export default MobileAgentInfoView;
