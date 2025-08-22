"use client";
import { Flex } from "@chakra-ui/react";

export default function MyAgentsPage() {
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      h={{
        base: "calc(100dvh - 88px)",
        md: "calc(100dvh - 275px)",
        lg: "calc(100dvh - 235px)",
      }}
      justify="center"
      my={{ base: 0, md: 5 }}
      w="100%"
    ></Flex>
  );
}
