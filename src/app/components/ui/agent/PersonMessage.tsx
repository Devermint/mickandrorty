"use client";

import { ChatEntry } from "@/app/lib/chat";
import { Box, Flex, Text } from "@chakra-ui/react";

function PersonMessage({ entry }: { entry: ChatEntry }) {
  return (
    <Flex
      justify="flex-end"
      gap="0.25rem"
      overflowX="hidden"
      direction="column"
      alignItems="flex-end"
    >
      <Box>
        <Text fontWeight="400" fontSize="12px" lineHeight="18px">
          You
        </Text>
      </Box>
      <Box borderRadius="11px" opacity="30%" width="90%" background="#AFDC29" padding="0.5rem">
        <Text fontWeight="400" fontSize="14px" lineHeight="21px" color="#040E0B">
          {entry.message}
        </Text>
      </Box>
    </Flex>
  );
}

export default PersonMessage;
