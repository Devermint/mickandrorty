"use client";

import { HStack, Image, Text } from "@chakra-ui/react";

interface MessageProps {
  text: string;
  isAgent?: boolean;
}

const Message = ({ text, isAgent = false }: MessageProps) => (
  <HStack w="100%" bg="rgba(22, 36, 22, 0.8)" p={4} borderRadius="md" gap={3}>
    <Image
      src={isAgent ? "/agent.png" : "/rick.png"}
      alt={isAgent ? "Agent" : "User"}
      width={8}
      height={8}
      borderRadius="full"
    />
    <Text color="#A4D03F" fontSize="sm" fontFamily="JetBrains Mono">
      {text}
    </Text>
  </HStack>
);

export default Message;
