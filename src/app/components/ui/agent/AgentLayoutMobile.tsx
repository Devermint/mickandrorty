"use client";

import AgentChat from "@/app/components/ui/agent/AgentChat";
import AgentGraph from "@/app/components/ui/agent/AgentGraph";
import { Agent } from "@/app/lib/agent";
import { AgentDMChatAdapter } from "@/app/lib/chat";
import { Box, Flex } from "@chakra-ui/react";

// function GridBox({ children }: { children: React.ReactNode }) {
//   return (
//     <Box background="#1D3114" borderRadius="16px" width="100%" height="100%" padding="0.5rem">
//       {children}
//     </Box>
//   );
// }

function AgentLayoutMobile({ activeAgent }: { activeAgent: Agent }) {
  return (
    <>
      <Flex height="60vh" direction="column">
        <Flex height="100%" width="100%">
          <AgentGraph />
        </Flex>
        <Box
          marginLeft="2rem"
          marginRight="2rem"
          position="relative"
          alignItems="center"
          height="40%"
        >
          {/* <Grid
          filter="auto"
          height="100%"
          width="100%"
          templateRows="repeat(5, 1fr)"
          templateColumns="repeat(5, 1fr)"
          gap="0.5rem"
        >
          <GridItem>
            <GridBox>
              <Box justifyItems="center" alignContent="center" height="100%">
                <Text fontWeight="400" fontSize="14px" lineHeight="21px">
                  SOCIAL GRAPH
                </Text>
              </Box>
            </GridBox>
          </GridItem>
          <GridItem colSpan={2}>
            <GridBox>
              <Text fontWeight="700" fontSize="17px" lineHeight="22px">
                302
              </Text>
              <Text fontWeight="500" fontSize="8px" lineHeight="11px" color="#FFFFFF">
                Score
              </Text>
            </GridBox>
          </GridItem>
          <GridItem colSpan={2}>
            <GridBox>
              <Text fontWeight="700" fontSize="17px" lineHeight="22px">
                30.32K
              </Text>
              <Text fontWeight="500" fontSize="8px" lineHeight="11px" color="#FFFFFF">
                Followers
              </Text>
            </GridBox>
          </GridItem>
        </Grid> */}
        </Box>
        <Box height="100%" marginTop="0.5rem">
          <AgentChat adapter={new AgentDMChatAdapter(activeAgent)} />
        </Box>
      </Flex>
    </>
  );
}

export default AgentLayoutMobile;
