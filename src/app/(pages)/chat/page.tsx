"use client";
import Chat from "@/app/components/Chat/Chat";
import { Flex } from "@chakra-ui/react";

export default function ChatPage() {
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      h={{
        base: "calc(100vh - 88px)",
        md: "calc(100vh - 190px)",
        lg: "calc(100vh - 150px)",
      }}
      justify="center"
      my={{ base: 0, md: 5 }}
      w="100%"
    >
      <Chat />
    </Flex>
  );
}
