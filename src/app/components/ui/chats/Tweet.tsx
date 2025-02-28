"use client";

import { Box, HStack, Image, Text } from "@chakra-ui/react";

export default function Tweet({ text }: { text: string }) {
  return (
    <Box
      w="100%"
      bg="rgba(2, 9, 9, 0.9)"
      p={4}
      borderRadius="lg"
      border="1px solid rgba(164, 208, 63, 0.1)"
    >
      <HStack gap={3} mb={2}>
        <Image src="/rick.png" alt="Rick" width={10} height={10} borderRadius="full" />
        <Box>
          <HStack gap={2}>
            <Text color="#A4D03F" fontWeight="bold" fontSize="sm">
              Rorty Rick
            </Text>
            <Text color="#A4D03F" opacity={0.5} fontSize="sm">
              @Rortyrick
            </Text>
            <Text color="#A4D03F" opacity={0.5} fontSize="sm">
              · Feb 22
            </Text>
          </HStack>
        </Box>
      </HStack>
      <Text color="#A4D03F" fontSize="sm" fontFamily="JetBrains Mono" pl={12}>
        {text}
      </Text>
    </Box>
  );
}
