"use client";
import { Box, Flex, Image, Text, Button } from "@chakra-ui/react";
import { X } from "../icons/x";
import { TelegramIcon } from "../icons/telegram";
import { Agent } from "@/app/types/agent";
import { colorTokens } from "../theme/theme";
import {
  formatFinanceNumber,
  formatTinyPrice,
  isFiniteNum,
} from "@/app/lib/utils/formatters";
type AgentCardProps = {
  agent: Agent;
};

export const AgentListCard = ({ agent }: AgentCardProps) => {
  const liquidity = agent.liquidity_usd?.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const mktCap = agent.mcap_usd?.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (
    <Flex
      position="relative"
      w="100%"
      bg={colorTokens.gray.tertiaryDark}
      p={2}
      gap={3}
      borderRadius={7}
      minW="100%"
    >
      <Box position="relative" minW={100} w={100} h={100} overflow="hidden">
        <Image
          src={agent.agent_icon_url}
          alt="overlay icon"
          width="100%"
          height="100%"
          objectFit="cover"
          objectPosition="center"
          pointerEvents="none"
          borderRadius={5}
        />
      </Box>
      <Flex
        w="full"
        minH="100%"
        direction="column"
        justifyContent="space-between"
      >
        <Flex justifyContent="space-between" zIndex={1} w="100%">
          <Box>
            <Text
              fontSize={14}
              fontWeight="normal"
              color="white"
              fontFamily="inter"
            >
              {agent.agent_name}
            </Text>
            {agent.twitter?.meta?.username && (
              <Text
                fontSize={12}
                fontWeight="normal"
                color={colorTokens.gray.platinum}
              >
                @{agent.twitter?.meta?.username}
              </Text>
            )}
          </Box>
        </Flex>
        <Box w="full">
          <Flex justify="space-between">
            <Text
              color={colorTokens.gray.tertiary}
              fontSize={13}
              fontFamily="inter"
            >
              Price:
            </Text>

            <Text color="white" fontSize={13} fontFamily="inter">
              <>
                {isFiniteNum(agent.price_usd) ? (
                  <>${formatTinyPrice(agent.price_usd!.toFixed(20))}</>
                ) : (
                  "—"
                )}
              </>
            </Text>
          </Flex>
          <Flex justify="space-between">
            <Text
              color={colorTokens.gray.tertiary}
              fontSize={13}
              fontFamily="inter"
            >
              Liquidity:
            </Text>

            <Text color="white" fontSize={13} fontFamily="inter">
              <>
                {isFiniteNum(agent.liquidity_usd) ? (
                  <>${formatFinanceNumber(liquidity)}</>
                ) : (
                  "—"
                )}
              </>
            </Text>
          </Flex>
          <Flex justify="space-between">
            <Text
              color={colorTokens.gray.tertiary}
              fontSize={13}
              fontFamily="inter"
            >
              Mkt. cap.
            </Text>

            <Text
              color={colorTokens.green.brightErin}
              fontSize={13}
              fontFamily="inter"
            >
              <>
                {isFiniteNum(agent.mcap_usd) ? (
                  <>${formatFinanceNumber(mktCap)}</>
                ) : (
                  "—"
                )}
              </>
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};
