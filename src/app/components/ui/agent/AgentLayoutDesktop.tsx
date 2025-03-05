"use client";

import AgentCard from "@/app/components/ui/agent/AgentCard";
import AgentChat from "@/app/components/ui/agent/AgentChat";
import AgentGraph from "@/app/components/ui/agent/AgentGraph";
import { Agent } from "@/app/lib/agent";
import { AgentDMChatAdapter } from "@/app/lib/chat";
import { Box, Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import { useAgentStats } from "@/app/hooks/useAgentStats";

function GridBox({ children }: { children: React.ReactNode }) {
  return (
    <Box background="#1D3114" borderRadius="16px" width="100%" height="100%" padding="0.5rem">
      {children}
    </Box>
  );
}

function AgentLayoutDesktop({ activeAgent }: { activeAgent: Agent }) {
  const { subscriberCount, messageCount, messageHistory } = useAgentStats(activeAgent.id);
  return (
    <Flex paddingLeft="2rem" paddingRight="2rem" height="508px">
      <AgentCard {...activeAgent} />
      <Box marginLeft="2rem" marginRight="2rem" position="relative" alignItems="center">
        <Grid
          height="100%"
          width="100%"
          templateRows="repeat(5, 1fr)"
          templateColumns="repeat(5, 1fr)"
          gap="0.5rem"
        >
          <GridItem>
            <GridBox>
              <Box justifyItems="center" alignContent="center" height="100%">
                <Text fontWeight="400" fontSize="16px" lineHeight="24px">
                  SOCIAL GRAPH
                </Text>
              </Box>
            </GridBox>
          </GridItem>
          <GridItem colSpan={2}>
            <GridBox>
              <Text fontWeight="700" fontSize="32px" lineHeight="41px">
                {messageCount}
              </Text>
              <Text fontWeight="500" fontSize="16px" lineHeight="21px" color="#FFFFFF">
                Messages
              </Text>
            </GridBox>
          </GridItem>
          <GridItem colSpan={2}>
            <GridBox>
              <Text fontWeight="700" fontSize="32px" lineHeight="41px">
                {subscriberCount}
              </Text>
              <Text fontWeight="500" fontSize="16px" lineHeight="21px" color="#FFFFFF">
                Subscribers
              </Text>
            </GridBox>
          </GridItem>
          <GridItem colSpan={5} rowSpan={4}>
            <AgentGraph data={messageHistory} />
          </GridItem>
        </Grid>
      </Box>
      <Box width="30%">
        <AgentChat adapter={new AgentDMChatAdapter(activeAgent)} />
      </Box>
    </Flex>
  );
}

export default AgentLayoutDesktop;
