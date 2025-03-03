"use client";

import { useMobileBreak } from "@/app/components/responsive";
import AgentListDesktop from "@/app/components/ui/agent/AgentListDesktop";
import AgentListMobile from "@/app/components/ui/agent/AgentListMobile";
import Underline from "@/app/components/ui/Underline";
import { Agent } from "@/app/lib/agent";
import { Container, Flex, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function HomePage() {
  const isMobile = useMobileBreak();
  const [agents, setAgents] = useState<Agent[]>();

  useEffect(() => {
    fetch("/api/agents")
      .then((response) => {
        response.json().then((data) => {
          setAgents(data);
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  if (agents === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Flex flexDirection="column" alignItems="center">
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
