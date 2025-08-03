"use client";

import React from "react";
import { Box, Flex, Text, Button, DownloadTrigger } from "@chakra-ui/react";
import { colorTokens } from "../theme";

export type ChatEntryProps = {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "video";
};

export const ChatEntry = ({ role, content, type }: ChatEntryProps) => {
  const isMyMessage = role === "user";
  const align = isMyMessage ? "flex-end" : "flex-start";
  const bg = isMyMessage ? colorTokens.blackCustom.a3 : "transparent";
  const color = isMyMessage
    ? colorTokens.gray.platinum
    : colorTokens.gray.timberwolf;
  const name = role === "user" ? "You" : "Agent";

  return (
    <Flex direction="column" alignItems={align} mb="10px">
      {role && !isMyMessage && (
        <Text fontSize="12px" mb="2px">
          {name}
        </Text>
      )}

      <Box px={3} py={1} bgColor={bg} borderRadius={28} maxW="80%">
        {type === "text" && (
          <Text lineHeight={1.5} fontSize={14} color={color}>
            {content}
          </Text>
        )}
        {type === "video" && (
          <>
            <video
              src={content}
              controls
              aria-label="Generated video"
              style={{
                maxWidth: "100%",
                borderRadius: "0.375rem",
              }}
            />
            <DownloadTrigger
              data={async () => {
                const blob = await fetch(content).then((r) => r.blob());
                return blob;
              }}
              fileName={content.split("/").pop() || "video.mp4"}
              mimeType="video/mp4"
              asChild
            >
              <Button size="sm" mt={2} colorScheme="teal">
                Download Video
              </Button>
            </DownloadTrigger>
          </>
        )}
      </Box>
    </Flex>
  );
};

export const DemoVideoEntry = () => (
  <ChatEntry
    role="assistant"
    content="https://www.w3schools.com/html/mov_bbb.mp4"
    type="video"
  />
);

export const DefaultChatEntry = () => (
  <ChatEntry
    role="assistant"
    content="Here you will see your conversation with the agent... Go ahead and ask it something."
    type="text"
  />
);

// export const DefaultTransactionEntry = () => (
//   <ChatEntry
//     role="assistant"
//     content="I'm happy to generate something for you. Please send me APT token first."
//     action="WAIT_FOR_TOKEN"
//   />
// );
