"use client";
import { AgentCarousel } from "@/app/components/Agents/AgentCarousel";
import { testAgents } from "@/app/types/agent";
import { Box, Flex, Spinner } from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import { AgentInput } from "@/app/components/Agents/AgentInput";
import { useRouter } from "next/navigation";
import type { Agent } from "@/app/types/agent"; // Adjust import path as needed

export default function AgentsPage() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const [agents, setAgents] = useState<Agent[]>(testAgents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeId, setActiveId] = useState<string | null | undefined>(
    testAgents[1].fa_id
  );

  const fetchAndCombineAgents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/agents");

      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.status}`);
      }

      const data = await response.json();
      const apiAgents: Agent[] = data.items;

      const combinedAgents = [...testAgents, ...apiAgents];

      const uniqueAgents = combinedAgents.filter(
        (agent, index, self) =>
          index === self.findIndex((a) => a.fa_id === agent.fa_id)
      );

      setAgents(uniqueAgents);
      console.log(uniqueAgents);
      if (!uniqueAgents.find((agent) => agent.fa_id === activeId)) {
        setActiveId(testAgents[1]?.fa_id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch agents");
      console.error("Error fetching agents:", err);
      setAgents(testAgents);
    } finally {
      setLoading(false);
    }
  };

  // Fetch agents on component mount
  useEffect(() => {
    fetchAndCombineAgents();
  }, []);

  const handleSend = () => {
    const text = textareaRef.current?.value.trim();
    if (!text) return;

    const selectedAgent = agents.find((x) => x.fa_id === activeId);
    if (!selectedAgent) return;

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
        {loading && (
          <Flex justify="center" mb={4}>
            <Spinner size="sm" />
          </Flex>
        )}

        <AgentCarousel
          agents={agents}
          activeId={activeId}
          setActiveId={setActiveId}
        />

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
