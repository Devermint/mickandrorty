"use client";

import { GroupChatEntry } from "@/app/lib/chat";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import NextImage from "next/image";
import { useAgentStats } from "@/app/hooks/useAgentStats";
export const testingAgentGroupMap: Record<number, string> = {
  0: "mick.zanches",
  1: "pickle.mick",
  2: "rorty.zmith",
};
export default function GroupChatButton({
  entry,
  activeChat,
  onClick,
}: {
  entry: GroupChatEntry;
  activeChat?: number;
  onClick: (entry: GroupChatEntry) => void;
}) {
  const isActive = activeChat == entry.id;
  const { subscriberCount } = useAgentStats(testingAgentGroupMap[entry.id]);

  return (
    <Box
      width="100%"
      background={isActive ? "#0F281B" : "#030B0A"}
      _hover={{
        background: "#0F281B",
      }}
      onClick={() => onClick(entry)}
      cursor="pointer"
      padding="0.75rem"
      borderRadius="12px"
      transition="all"
    >
      <Flex width="100%" alignItems="center" position="relative">
        {/* Agent Icon */}
        <Box position="relative" marginRight="1rem">
          <Box width="46px" height="46px" rounded="full" overflow="hidden" background="#1D3114">
            <Image asChild alt="agent icon">
              <NextImage src={entry.icon} alt="agent icon" width={40} height={40} />
            </Image>
          </Box>
          {/* Online indicator */}
          <Box
            position="absolute"
            bottom="-2px"
            right="-2px"
            width="14px"
            height="14px"
            borderRadius="50%"
            background="#AFDC29"
            border="2px solid #030B0A"
          />
        </Box>

        {/* Name and Chatters */}
        <Flex direction="column" gap="0.25rem">
          <Text color="#FFFFFF" fontSize="16px" fontWeight="500">
            {entry.name}
          </Text>
          <Text color="#AFDC29" fontSize="14px" opacity="0.8">
            {subscriberCount} chatters
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}
