"use client";
import { AgentCarousel } from "@/app/components/Agents/AgentCarousel";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import { AgentInput } from "@/app/components/Agents/AgentInput";
import { useRouter } from "next/navigation";
import { useAgents } from "@/app/hooks/useAgents";

export default function AgentsPage() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const { data: agents = [], isLoading, isError } = useAgents();

  const [activeId, setActiveId] = useState<string | null>(null);

  // set initial activeId once agents are loaded
  useEffect(() => {
    if (!agents.length) return;
    if (!activeId || !agents.some((a) => a.fa_id === activeId)) {
      const first = agents.find((a) => !!a.fa_id)?.fa_id ?? null;
      setActiveId(first);
    }
  }, [agents, activeId]);

  const handleSend = () => {
    const text = textareaRef.current?.value.trim();
    if (!text) return;

    const selectedAgent = agents.find((x) => x.fa_id === activeId);
    if (!selectedAgent?.fa_id) return;

    router.push(
      `/agent/${selectedAgent.fa_id}?message=${encodeURIComponent(
        text
      )}&defaultTab=chat`
    );
  };

  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      mt={{ base: 5, md: 20 }}
      pb={{ base: 10, md: 20 }}
      zIndex={1}
      overflow={{ base: "hidden", md: "visible" }}
    >
      <Box
        h="100%"
        alignItems="center"
        maxW={{ base: "100%", md: 750 }}
        overflow={{ base: "hidden", md: "visible" }}
      >
        {isLoading && (
          <Flex justify="center" mb={4}>
            <Spinner size="sm" />
          </Flex>
        )}
        {isError && (
          <Text color="red.400" mb={2}>
            Failed to load agents.
          </Text>
        )}

        {agents.length > 0 && (
          <AgentCarousel
            agents={agents}
            activeId={activeId}
            setActiveId={setActiveId}
          />
        )}

        <AgentInput
          mt={100}
          h={100}
          p={0}
          mx={2}
          inputRef={textareaRef}
          onButtonClick={handleSend}
        />
      </Box>
    </Flex>
  );
}
