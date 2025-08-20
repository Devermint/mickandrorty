"use client";
import { AgentCarousel } from "@/app/components/Agents/AgentCarousel";
import { testAgents } from "@/app/types/agent";
import { Box, Flex } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { AgentInput } from "@/app/components/Agents/AgentInput";
import { useRouter } from "next/navigation";

export default function AgentsPage() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const [activeId, setActiveId] = useState<string | null | undefined>(
    testAgents[1].fa_id
  );

  const handleSend = () => {
    const text = textareaRef.current?.value.trim();
    if (!text) return;
    router.push(
      `/agent/${
        testAgents.find((x) => x.fa_id === activeId)?.fa_id
      }?message=${encodeURIComponent(text)}&defaultTab=chat`
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
        <AgentCarousel
          agents={testAgents}
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
