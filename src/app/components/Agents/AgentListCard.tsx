"use client";
import { Box, Flex, Image, Text, Button } from "@chakra-ui/react";
import { X } from "../icons/x";
import { Telegram } from "../icons/telegram";
import { Agent } from "@/app/types/agent";
import { colorTokens } from "../theme/theme";
import { formatTinyPrice, isFiniteNum } from "@/app/lib/utils/formatters";
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
      direction="column"
      align="center"
      position="relative"
      width="fit-content"
      overflow="visible"
    >
      <Box position="relative" w={60} h={60} overflow="hidden" py={5} px={6}>
        <Image
          src={agent.agent_icon_url}
          alt="overlay icon"
          width="100%"
          height="100%"
          objectFit="cover"
          pointerEvents="none"
          borderRadius={10}
        />
      </Box>

      <Box w="full" px={6}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          zIndex={1}
          overflow="visible"
          w="100%"
        >
          <Box>
            <Text
              fontSize="sm"
              fontWeight="normal"
              color={colorTokens.gray.timberwolf}
            >
              {agent.agent_name}
            </Text>
          </Box>

          <Flex gap={2}>
            <Button
              borderRadius={22}
              p={4}
              h={11}
              w={11}
              border="none"
              bgColor="#090A0B"
            >
              <X h={13} w={13} color={colorTokens.green.erin} />
            </Button>
            <Button
              borderRadius={22}
              p={4}
              h={11}
              w={11}
              border="none"
              bgColor="#090A0B"
            >
              <Telegram
                h={13}
                w="14px"
                mr={0.5}
                color={colorTokens.green.erin}
              />
            </Button>
          </Flex>
        </Box>
        <Box w="full" mt={6} pb={2}>
          <Flex justify="space-between" mb={2}>
            <Text color={colorTokens.gray.timberwolf} fontSize={13}>
              Price
            </Text>

            <Text color={colorTokens.green.erin} fontSize={13}>
              <>
                {isFiniteNum(agent.price_usd) ? (
                  <>${formatTinyPrice(agent.price_usd!.toFixed(20))}</>
                ) : (
                  "—"
                )}
              </>
            </Text>
          </Flex>
          <Flex justify="space-between" mb={2}>
            <Text color={colorTokens.gray.timberwolf} fontSize={13}>
              Market CAP
            </Text>

            <Text color={colorTokens.green.erin} fontSize={13}>
              <>{isFiniteNum(agent.mcap_usd) ? <>${mktCap}</> : "—"}</>
            </Text>
          </Flex>
          <Flex justify="space-between" mb={2}>
            <Text color={colorTokens.gray.timberwolf} fontSize={13}>
              Liquidity
            </Text>

            <Text color={colorTokens.green.erin} fontSize={13}>
              <>{isFiniteNum(agent.liquidity_usd) ? <>${liquidity}</> : "—"}</>
            </Text>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
};
