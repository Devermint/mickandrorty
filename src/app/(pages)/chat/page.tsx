"use client";
import { Flex, Text } from "@chakra-ui/react";
import { useEffect } from "react";

export default function ChatPage() {
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
        <Text
          fontSize="20px"
          textAlign="center"
          lineHeight="26px"
          fontWeight="700"
          marginBottom="0.5rem"
        >
          Select AI agent
        </Text>
      </Flex>
    </div>
  );
}
