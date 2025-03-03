"use client";

import { Box, Flex } from "@chakra-ui/react";
import AgentCardInteractive from "./AgentCardInteractive";
import { Agent } from "@/app/lib/agent";

function AgentListDesktop({ agents }: { agents: Agent[] }) {
  return (
    <Box padding="2rem" marginTop="1rem">
      <Flex
        overflowY="hidden"
        overflowX="auto"
        padding="1rem"
        justify="center"
        width="100%"
        gap="2.5rem"
      >
        {agents.map((agent, index) => (
          <AgentCardInteractive key={index} {...agent} />
        ))}
      </Flex>
    </Box>
  );
}

export default AgentListDesktop;
