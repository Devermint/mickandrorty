"use client";
import { Box, Flex, Image, Text, Button } from "@chakra-ui/react";
import { X } from "../icons/x";
import { Telegram } from "../icons/telegram";
import { Agent } from "@/app/types/agent";
import { colorTokens } from "../theme/theme";
type AgentCardProps = {
  agent: Agent;
};

export const AgentListCard = ({ agent }: AgentCardProps) => (
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
            <Telegram h={13} w="14px" mr={0.5} color={colorTokens.green.erin} />
          </Button>
        </Flex>
      </Box>
      <Box w="full" mt={6} pb={2}>
        <Flex justify="space-between" mb={2}>
          <Text color={colorTokens.gray.timberwolf} fontSize={13}>
            Market CAP
          </Text>

          <Text color={colorTokens.gray.platinum} fontSize={13}>
            {agent.mcap_usd}
          </Text>
        </Flex>
        <Flex justify="space-between" mb={2}>
          <Text color={colorTokens.gray.timberwolf} fontSize={13}>
            Trades in 24h
          </Text>

          <Text color={colorTokens.gray.platinum} fontSize={13}>
            NaN
          </Text>
        </Flex>
      </Box>
    </Box>
  </Flex>
);
