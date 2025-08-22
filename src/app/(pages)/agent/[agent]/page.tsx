"use client";

import React from "react";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import FullHeightLayout from "@/app/components/Layout/FullHeightLayout";
import { AgentView } from "@/app/components/Agents/AgentView";
import { MobileAgentView } from "@/app/components/Agents/MobileAgentView";
import { useAgent } from "@/app/hooks/useAgent";
import { testAgents } from "@/app/types/agent";

export default function Page({
  params,
}: {
  params: Promise<{ agent: string }>;
}) {
  const { agent: faId } = React.use(params);

  const { data: agent, isLoading, isError, error } = useAgent(faId);

  if (isLoading) {
    return (
      <FullHeightLayout>
        <Flex justify="center" align="center" h="100%">
          <Spinner size="lg" />
        </Flex>
      </FullHeightLayout>
    );
  }

  if (isError || !agent) {
    return (
      <FullHeightLayout>
        <Flex justify="center" align="center" h="100%">
          <Text color="red.400">
            {error instanceof Error ? error.message : "Failed to load agent"}
          </Text>
        </Flex>
      </FullHeightLayout>
    );
  }

  return (
    <FullHeightLayout>
      <Box
        as="main"
        flex="1"
        overflowY="auto"
        overflowX="hidden"
        position="relative"
        minH={0}
      >
        <Flex
          w="full"
          h="full"
          maxH="100%"
          minH={0}
          justify="center"
          display={{ base: "none", md: "flex" }}
          px={4}
        >
          <AgentView agent={agent} />
        </Flex>
        <MobileAgentView agent={agent} />
      </Box>
    </FullHeightLayout>
  );
}
