"use client";

import { Box, Flex, Image } from "@chakra-ui/react";
import NextImage from "next/image";
import DotsLoader from "../loader/DotsLoader";

interface ResponseWaiterProps {
  agentImage?: string;
}

function ResponseWaiter({ agentImage = "/default-agent.png" }: ResponseWaiterProps) {
  return (
    <Flex gap="1rem" overflowX="hidden" justifyContent="flex-start">
      <Box
        background="#1D3114"
        width="31px"
        height="31px"
        overflow="hidden"
        borderWidth="1px"
        borderRadius="50%"
        borderColor="#5A7219"
      >
        <Image asChild alt="agent icon">
          <NextImage src={agentImage} alt="agent icon" width="31" height="31" />
        </Image>
      </Box>
      <DotsLoader />
    </Flex>
  );
}

export default ResponseWaiter;
