"use client";

import { ChatEntry } from "@/app/lib/chat";
import { Box, Flex, Text } from "@chakra-ui/react";

function ErrorMessage({ entry }: { entry: ChatEntry }) {
  return (
    <Flex
      justify="flex-end"
      gap="0.25rem"
      overflowX="hidden"
      direction="column"
      alignItems="center"
    >
      <Box
        borderRadius="11px"
        opacity="30%"
        width="90%"
        background="#DC2929"
        padding="0.5rem"
        borderWidth="3px"
        borderColor="#DC2929"
      >
        <Text fontWeight="400" fontSize="14px" lineHeight="21px" color="#040E0B">
          {entry.message}
        </Text>
      </Box>
    </Flex>
  );
}

export default ErrorMessage;
