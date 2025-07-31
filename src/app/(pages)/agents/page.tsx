"use client";

import { AgentCarousel } from "@/app/components/agent/AgentCarousel";
import { testAgents } from "@/app/types/agent";

import { Box, Flex } from "@chakra-ui/react";
import { useRef } from "react";
import { AgentInput } from "@/app/components/agent/AgentInput";
import { useRouter } from "next/navigation";
import { useMobileBreak } from "@/app/components/responsive";

export default function AgentsPage() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const isMobile = useMobileBreak();

  const handleSend = () => {
    const text = textareaRef.current?.value.trim();
    if (!text) return;
    router.push(`/chat?message=${encodeURIComponent(text)}`);
  };

  return (
    <div>
      <Flex
        flexDirection="column"
        alignItems="center"
        mt={isMobile ? 5 : 20}
        pb={20}
        zIndex={1}
      >
        <Box maxW={{ base: 380, md: 760 }} px={2}>
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
