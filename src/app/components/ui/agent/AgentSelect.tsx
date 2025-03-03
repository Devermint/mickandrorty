"use client";

import { Box, Flex, Text, Button } from "@chakra-ui/react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Agent {
  id: string;
  name: string;
  image: string;
}

const agents: Agent[] = [
  {
    id: "rick",
    name: "Rick",
    image: "/agents/rick.png",
  },
  {
    id: "pickle-rick",
    name: "Pickle Rick",
    image: "/agents/pickle-rick.png",
  },
  {
    id: "beth",
    name: "Beth",
    image: "/agents/beth.png",
  },
];

export default function AgentSelect() {
  const [selectedAgent, setSelectedAgent] = useState(0);
  const router = useRouter();

  const handleAgentSelect = (index: number) => {
    setSelectedAgent(index);
  };

  const handleContinue = () => {
    router.push(`/chat/${agents[selectedAgent].id}`);
  };

  return (
    <Box minH="100vh" bg="black" color="white" p={8}>
      <Text textAlign="center" fontSize="48px" fontFamily="monospace" mb={12} color="gray.400">
        SELECT AI AGENT
      </Text>

      <Flex direction="column" alignItems="center" gap={8}>
        <Flex gap={6} justifyContent="center">
          {agents.map((agent, index) => (
            <Box
              key={agent.id}
              position="relative"
              width="280px"
              height="280px"
              cursor="pointer"
              onClick={() => handleAgentSelect(index)}
              borderRadius="24px"
              overflow="hidden"
              border="2px solid"
              borderColor={selectedAgent === index ? "#AFDC29" : "#1D3114"}
              opacity={selectedAgent === index ? 1 : 0.3}
              transition="all 0.2s"
              _hover={{
                opacity: 0.8,
              }}
            >
              <Image
                src={agent.image}
                alt={agent.name}
                fill
                style={{
                  objectFit: "cover",
                }}
              />
              {selectedAgent === index && (
                <Box
                  position="absolute"
                  bottom={0}
                  left={0}
                  right={0}
                  height="4px"
                  bg="#AFDC29"
                  boxShadow="0 0 20px #AFDC29"
                />
              )}
            </Box>
          ))}
        </Flex>

        <Box position="relative" width="12px" height="12px">
          <Box
            position="absolute"
            width="12px"
            height="12px"
            borderRadius="50%"
            bg="#AFDC29"
            boxShadow="0 0 20px #AFDC29"
          />
        </Box>

        <Button
          onClick={handleContinue}
          bg="#AFDC29"
          color="#1D3114"
          size="lg"
          _hover={{
            bg: "#9DC521",
          }}
          fontWeight="bold"
          px={8}
        >
          Continue
        </Button>
      </Flex>
    </Box>
  );
}
