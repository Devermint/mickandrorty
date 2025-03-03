"use client";

import AgentCard from "@/app/components/ui/agent/AgentCard";
import { Agent } from "@/app/lib/agent";
import { Box, Button, Flex, Image } from "@chakra-ui/react";
import NextImage from "next/image";
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

  return (
    <div>
      <Flex justifyContent="center" marginTop="0.5rem" gap="1.25rem">
        {agents.map((agent, index) => (
          <Flex key={index} alignItems="center" flexDirection="column" gap="0.5rem">
            <Box
              key={index}
              onClick={() => agentMiniIconClick(index)}
              position="relative"
              minWidth="80px"
              height="60px"
              overflow="hidden"
              borderWidth={index == activeAgent ? "2px" : "1px"}
              borderRadius="12px"
              borderColor={index == activeAgent ? "#AFDC29" : "#5A7219"}
              background={
                index === activeAgent
                  ? "radial-gradient(circle at center, #A4F05C 0%, #56933B 100%)"
                  : "radial-gradient(circle at center, rgba(90, 114, 25, 0.3) 0%, rgba(29, 49, 20, 0.6) 80%)"
              }
              _hover={{
                borderColor: "#BDE546",
              }}
            >
              <Image asChild alt="agent icon">
                <NextImage
                  src={agent.image}
                  alt="agent icon"
                  fill={true}
                  objectFit="contain"
                  style={{
                    opacity: index === activeAgent ? 1 : 0.3,
                  }}
                />
              </Image>
            </Box>
            {index === activeAgent ? (
              <Box w="8px" h="8px" borderRadius="full" background="#92B624" />
            ) : null}
          </Flex>
        ))}
      </Flex>

      <Box px="3rem" py="1rem" height="55vh">
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
