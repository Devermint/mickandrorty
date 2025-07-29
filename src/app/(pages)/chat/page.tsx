"use client";
import Chat from "@/app/components/Chat/Chat";
import { Flex } from "@chakra-ui/react";

export default function ChatPage() {
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      h="80vh"
      justify="center"
      my={5}
    >
      <Chat />
    </Flex>
  );
}
