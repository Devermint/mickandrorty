import { Flex, IconButton, Text } from "@chakra-ui/react";
import NextImage from "next/image";
import { AgentSocialsProps } from "./types";

export function AgentSocials({ name, handleTelegram, handleX }: AgentSocialsProps) {
  return (
    <Flex marginTop="0.5rem" justify="space-between">
      <Flex alignItems="center">
        <Text fontWeight="700" fontSize="20px" lineHeight="26px" color="#AFDC29">
          {name.split(" ")[0]}
        </Text>
        <Text
          marginLeft="0.5rem"
          fontWeight="700"
          fontSize="20px"
          lineHeight="26px"
          color="#FFFFFF"
        >
          {name.split(" ")[1]}
        </Text>
      </Flex>
      <Flex gap="0.5rem">
        <IconButton background="#042911" _hover={{ background: "#0a2f17" }}>
          <NextImage
            src="/socials/telegram.svg"
            alt="telegram"
            width="24"
            height="24"
            onClick={handleTelegram}
          />
        </IconButton>
        <IconButton background="#042911" _hover={{ background: "#0a2f17" }}>
          <NextImage src="/socials/x.svg" alt="X" width="24" height="24" onClick={handleX} />
        </IconButton>
      </Flex>
    </Flex>
  );
}
