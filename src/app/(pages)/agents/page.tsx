"use client";

import { AgentCard } from "@/app/components/agent/AgentCard";
import { Flex } from "@chakra-ui/react";
import { useEffect } from "react";

export default function AgentsPage() {
  // Redirect to HTTPS in production
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
      <Flex
        flexDirection="column"
        display={{ base: "none", md: "flex" }}
        alignItems="center"
        mt={20}
      >
        <AgentCard />
      </Flex>
    </div>
  );
}
