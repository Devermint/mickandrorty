"use client";

import { useMobileBreak } from "@/app/components/responsive";
import AgentListDesktop from "@/app/components/ui/agent/AgentListDesktop";
import AgentListMobile from "@/app/components/ui/agent/AgentListMobile";
import Underline from "@/app/components/ui/Underline";
import { testingAgents } from "@/app/lib/data";
import { Flex, Text } from "@chakra-ui/react";

export default function HomePage() {
  const isMobile = useMobileBreak();
  const agents = testingAgents;

  return (
    <div>
      <Flex flexDirection="column" display={{ base: "none", md: "flex" }} alignItems="center">
        <Text
          fontSize="20px"
          textAlign="center"
          lineHeight="26px"
          fontWeight="700"
          marginBottom="0.5rem"
        >
          Select AI agent
        </Text>
        <Underline />
      </Flex>

      {isMobile ? <AgentListMobile agents={agents} /> : <AgentListDesktop agents={agents} />}
    </div>
  );
}
