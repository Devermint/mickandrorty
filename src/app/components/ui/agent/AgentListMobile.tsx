"use client";

import AgentCard from "@/app/components/ui/agent/AgentCard";
import AgentMiniIcons from "@/app/components/ui/agent/AgenMiniIcons";
import { Agent } from "@/app/lib/agent";
import { Box, Button, Flex } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

function AgentListMobile({ agents }: { agents: Agent[] }) {
  const router = useRouter();
  const [activeAgent, setActiveAgent] = useState(0);

  const agentMiniIconClick = (index: number) => {
    setActiveAgent(index);
  };

  const onContinueClick = () => {
    router.push(`/agents/${agents[activeAgent].id}`);
  };

  const agentImages = agents.map((agent) => agent.image);

  return (
    <div>
      <AgentMiniIcons images={agentImages} activeIndex={activeAgent} onClick={agentMiniIconClick} />

      <Box overflowY="auto" px="3rem" py="1rem" height="60dvh">
        <AgentCard {...agents[activeAgent]} />
      </Box>

      <Flex justifyContent="center">
        <Button
          background="#AFDC29"
          borderColor="#5C7B1D"
          borderWidth="1px"
          px="4rem"
          color="#1D3114"
          onClick={onContinueClick}
          boxShadow="0 0 20px #AFDC29"
          _hover={{
            background: "#9DC521",
            boxShadow: "0 0 25px #AFDC29",
          }}
        >
          Continue
        </Button>
      </Flex>
    </div>
  );
}

export default AgentListMobile;
