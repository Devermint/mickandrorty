"use client";

import { ChatEntry } from "@/app/lib/chat";
import { Box, Flex, Text, Button } from "@chakra-ui/react";
import NextImage from "next/image";

interface AgentMessageProps {
  entry: ChatEntry;
  agentImage?: string;
  handleSendTransaction?: () => void;
}

function AgentMessage({
  entry,
  agentImage = "/default-agent.png",
  handleSendTransaction,
}: AgentMessageProps) {
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
        <NextImage src={agentImage} alt="agent icon" width="31" height="31" />
      </Box>
      <Box borderRadius="11px" opacity="30%" width="80%" background="#1D3114" padding="0.5rem">
        <Text fontWeight="400" fontSize="14px" lineHeight="21px">
          {entry?.action === "WAIT_FOR_TOKEN" ? (
            <>
              <p>{entry.message}</p> {/* Display the message text */}
              <Button
                onClick={handleSendTransaction}
                className="bg-[#AFDC29] text-[#0B3D0B] rounded-r-lg px-4 py-2 hover:text-[#AFDC29] hover:border-[#AFDC29] border border-transparent"
              >
                Send Transaction
              </Button>
            </>
          ) : (
            entry.message
          )}
        </Text>
      </Box>
    </Flex>
  );
}

export default AgentMessage;
