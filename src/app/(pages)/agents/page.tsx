"use client";

import { AgentCarousel } from "@/app/components/Agent/AgentCarousel";
import { Agent } from "@/app/types/agent";

import { Box, Flex } from "@chakra-ui/react";
import { useEffect } from "react";
import { AgentInput } from "@/app/components/Agent/AgentInput";

export default function AgentsPage() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      window.location.protocol === "http:"
    ) {
      window.location.href = window.location.href.replace("http:", "https:");
    }
  }, []);

  const agents: Agent[] = [
    {
      id: "1",
      image: "/agents/agent3.png",
      name: "Agent Medusa",
      tag: "@AgentMedusa",
    },
    {
      id: "2",
      image: "/agents/agent1.png",
      name: "Rorty Rick",
      tag: "@RortyRick",
    },
    {
      id: "3",
      image: "/agents/agent2.png",
      name: "Monica Rorty",
      tag: "@MonicaRorty",
    },
  ];

  return (
    <div>
      <Flex flexDirection="column" alignItems="center" mt={20} zIndex={1}>
        <Box maxW={760}>
          <AgentCarousel agents={agents} />
          <AgentInput mt={100} h={100} p={0} />
        </Box>
      </Flex>
    </div>
  );
}
