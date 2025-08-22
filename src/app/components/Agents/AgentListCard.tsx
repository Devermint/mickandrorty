"use client";
import { Box, Flex, Image, Text, Button } from "@chakra-ui/react";
import { X } from "../icons/x";
import { Telegram } from "../icons/telegram";
import { Agent } from "@/app/types/agent";
import { colorTokens } from "../theme/theme";
import { AgentMarketInfo } from "./AgentMarketInfo";

type AgentCardProps = {
  agent: Agent;
  isActive: boolean;
};

export const AgentListCard = ({ isActive, agent }: AgentCardProps) => (
  <Flex
    direction="column"
    align="center"
    position="relative"
    width="fit-content"
    overflow="visible"
  >
    <Box position="relative" w={60} h={60} overflow="hidden" py={10} px={12}>
      {/* <Image
        src="agents/agent-bg.gif"
        alt="swirl"
        width="100%"
        height="100%"
        objectFit="cover"
        scale={2}
      /> */}

      <Image
        src={agent.agent_icon_url}
        alt="overlay icon"
        // position="absolute"
        // top="5"
        // left="0"
        width="100%"
        height="100%"
        objectFit="cover"
        pointerEvents="none"
        scale={1.2}
      />
    </Box>

    <Box
      borderRadius="23px"
      backdropFilter="blur(42.6px)"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      zIndex={1}
      overflow="visible"
      w="100%"
      px={4}
    >
      <Box>
        <Text
          fontSize="sm"
          fontWeight="bold"
          color={colorTokens.gray.timberwolf}
        >
          {agent.agent_name}
        </Text>
        <Text fontSize="xs" color={colorTokens.gray.platinum}>
          {agent.tag}
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
    <Box p={2}></Box>
  </Flex>
);
