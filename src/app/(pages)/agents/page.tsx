"use client";

import { AgentCarousel } from "@/app/components/agent/AgentCarousel";
import { testAgents } from "@/app/types/agent";

import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { AgentInput } from "@/app/components/agent/AgentInput";
import { useRouter } from "next/navigation";

export default function AgentsPage() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const handleSend = () => {
    const text = textareaRef.current?.value.trim();
    if (!text) return;
    router.push(`/chat?message=${encodeURIComponent(text)}`);
  };

  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      window.location.protocol === "http:"
    ) {
      window.location.href = window.location.href.replace("http:", "https:");
    }
  }, []);

  return (
    <div>
      <Flex flexDirection="column" alignItems="center" mt={20} zIndex={1}>
        <Box maxW={760}>
          <AgentCarousel agents={testAgents} />
          <AgentInput
            mt={100}
            h={100}
            p={0}
            inputRef={textareaRef}
            onButtonClick={handleSend}
          />
        </Box>
      </Flex>
    </div>
  );
}
