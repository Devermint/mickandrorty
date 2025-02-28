"use client";

import { ChatEntry } from "@/app/lib/chat";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import NextImage from "next/image";

interface AgentMessageProps {
  entry: ChatEntry;
  agentImage?: string;
}

function AgentMessage({ entry, agentImage = "/default-agent.png" }: AgentMessageProps) {
  return (
    <Flex gap="1rem" overflowX="hidden" justifyContent="flex-start">
      <Box
        background="#1D3114"
        width="31px"
        height="31px"
        overflow="hidden"
        borderWidth="1px"
        borderRadius="50%"
        borderColor="#5A7219"
      >
        <Image asChild alt="agent icon">
          <NextImage src={agentImage} alt="agent icon" width="31" height="31" />
        </Image>
      </Box>
      <Box borderRadius="11px" opacity="30%" width="80%" background="#1D3114" padding="0.5rem">
        <Text fontWeight="400" fontSize="14px" lineHeight="21px">
          {entry.message}
        </Text>
      </Box>
    </Flex>
  );
}

export default AgentMessage;
