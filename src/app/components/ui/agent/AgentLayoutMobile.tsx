"use client";

import AgentChat from "@/app/components/ui/agent/AgentChat";
import AgentGraph from "@/app/components/ui/agent/AgentGraph";
import { Agent } from "@/app/lib/agent";
import { AgentDMChatAdapter } from "@/app/lib/chat";
import { Box, Flex, Text } from "@chakra-ui/react";

// function GridBox({ children }: { children: React.ReactNode }) {
//   return (
//     <Box background="#1D3114" borderRadius="16px" width="100%" height="100%" padding="0.5rem">
//       {children}
//     </Box>
//   );
// }

function AgentLayoutMobile({ activeAgent }: { activeAgent: Agent }) {
  return (
    <Flex height="70dvh" direction="column">
      <Flex height="30dvh" width="100%">
        <AgentGraph />
      </Flex>
      <Flex gap="1rem" padding="1rem" justifyContent="center">
        <Flex
          alignItems="center"
          justifyContent="center"
          background="#0A1C12"
          borderRadius="16px"
          padding="1rem"
          width="50%"
        >
          <Text fontWeight="500" fontSize="14px" lineHeight="21px" color="#FFFFFF">
            Messages
          </Text>
        </Flex>
        <Box background="#1D3114" borderRadius="16px" padding="1rem" width="50%">
          <Text fontWeight="700" fontSize="24px" lineHeight="41px">
            302
          </Text>
          <Text fontWeight="500" fontSize="14px" lineHeight="21px" color="#FFFFFF">
            Messages
          </Text>
        </Box>
        <Box background="#1D3114" borderRadius="16px" padding="1rem" width="50%">
          <Text fontWeight="700" fontSize="24px" lineHeight="41px">
            302
          </Text>
          <Text fontWeight="500" fontSize="14px" lineHeight="21px" color="#FFFFFF">
            Subscribers
          </Text>
        </Box>
      </Flex>
      <Box height="100%" marginTop="0.5rem" padding="1rem">
        <AgentChat adapter={new AgentDMChatAdapter(activeAgent)} />
      </Box>
    </Flex>
  );
}

export default AgentLayoutMobile;
