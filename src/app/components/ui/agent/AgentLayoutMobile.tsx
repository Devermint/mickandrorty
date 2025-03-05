"use client";

import AgentChat from "@/app/components/ui/agent/AgentChat";
import AgentGraph from "@/app/components/ui/agent/AgentGraph";
import { Agent } from "@/app/lib/agent";
import { AgentDMChatAdapter } from "@/app/lib/chat";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useState } from "react";

// function GridBox({ children }: { children: React.ReactNode }) {
//   return (
//     <Box background="#1D3114" borderRadius="16px" width="100%" height="100%" padding="0.5rem">
//       {children}
//     </Box>
//   );
// }

function AgentLayoutMobile({ activeAgent }: { activeAgent: Agent }) {
  const [isInputFocused, setIsInputFocused] = useState(false);

  return (
    <Flex height="68dvh" direction="column">
      {!isInputFocused && (
        <>
          <Flex height="30dvh" width="100%">
            <AgentGraph />
          </Flex>
          <Flex gap="1rem" px="1rem" justifyContent="center">
            <Flex
              alignItems="center"
              justifyContent="center"
              background="#0A1C12"
              borderRadius="16px"
              padding="0.5rem"
              width="50%"
            >
              <Text fontWeight="500" fontSize="14px" lineHeight="21px" color="#FFFFFF">
                Messages
              </Text>
            </Flex>
            <Box background="#1D3114" borderRadius="16px" padding="0.5rem" width="50%">
              <Text fontWeight="700" fontSize="24px" lineHeight="41px">
                302
              </Text>
              <Text fontWeight="500" fontSize="14px" lineHeight="21px" color="#FFFFFF">
                Messages
              </Text>
            </Box>
            <Box background="#1D3114" borderRadius="16px" padding="0.5rem" width="50%">
              <Text fontWeight="700" fontSize="24px" lineHeight="41px">
                302
              </Text>
              <Text fontWeight="500" fontSize="14px" lineHeight="21px" color="#FFFFFF">
                Subscribers
              </Text>
            </Box>
          </Flex>
        </>
      )}
      <Box height={isInputFocused ? "100%" : undefined} padding="0.5rem" pb="1rem">
        <AgentChat
          adapter={new AgentDMChatAdapter(activeAgent)}
          onInputFocus={() => setIsInputFocused(true)}
          onInputBlur={() => setIsInputFocused(false)}
        />
      </Box>
    </Flex>
  );
}

export default AgentLayoutMobile;
