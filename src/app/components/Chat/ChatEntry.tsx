"use client";

import React from "react";
import { Box, Flex, Text, Button, DownloadTrigger } from "@chakra-ui/react";
import { colorTokens } from "../theme";
import { ArrowUp } from "../Icons/arrowUp";

export type ChatEntryProps = {
  sender: string;
  message?: string;
  videoUrl?: string;
  isMyMessage: boolean;
  action?: string;
};

export const ChatEntry = ({
  sender,
  action,
  message,
  videoUrl,
  isMyMessage,
}: ChatEntryProps) => {
  const align = isMyMessage ? "flex-end" : "flex-start";
  const bg = isMyMessage ? colorTokens.blackCustom.a3 : "transparent";
  const color = isMyMessage
    ? colorTokens.gray.platinum
    : colorTokens.gray.timberwolf;

  const proxyUrl = videoUrl
    ? `/api/video?url=${encodeURIComponent(videoUrl)}`
    : undefined;

  return (
    <Flex direction="column" alignItems={align} mb="10px">
      {sender && !isMyMessage && (
        <Text fontSize="12px" mb="2px">
          {sender}
        </Text>
      )}

      <Box px={3} py={1} bgColor={bg} borderRadius={28} maxW="80%">
        {videoUrl ? (
          <>
            <video
              src={videoUrl}
              controls
              aria-label="Generated video"
              style={{
                maxWidth: "100%",
                borderRadius: "0.375rem",
              }}
            />

            {proxyUrl && (
              <DownloadTrigger
                data={async () => {
                  const blob = await fetch(proxyUrl).then((r) => r.blob());
                  return blob;
                }}
                fileName={videoUrl.split("/").pop() || "video.mp4"}
                mimeType="video/mp4"
                asChild
              >
                <Button size="sm" mt={2} colorScheme="teal">
                  Download Video
                </Button>
              </DownloadTrigger>
            )}
          </>
        ) : (
          <Text lineHeight={1.5} fontSize={14} color={color}>
            {action === "WAIT_FOR_TOKEN" ? (
              <>
                <p>{message}</p>
                <Button
                  mt={2}
                  onClick={() => {}}
                  borderWidth={1}
                  borderColor={colorTokens.blackCustom.a3}
                  bg="transparent"
                  fontSize={12}
                  color={colorTokens.green.erin}
                  p="5px"
                  pr={3}
                  h="auto"
                  borderRadius={25}
                >
                  <ArrowUp h={25} w={25} transform="rotate(90deg)" />
                  Send Transaction
                </Button>
              </>
            ) : (
              message
            )}
          </Text>
        )}
      </Box>
    </Flex>
  );
};

export const DemoVideoEntry = () => (
  <ChatEntry
    sender="Agent"
    videoUrl="https://www.w3schools.com/html/mov_bbb.mp4"
    isMyMessage={false}
  />
);

export const DefaultChatEntry = () => (
  <ChatEntry
    sender="Info"
    message="Here you will see your conversation with the agent... Go ahead and ask it something."
    isMyMessage={false}
  />
);

export const DefaultTransactionEntry = () => (
  <ChatEntry
    sender="Agent"
    message="I'm happy to generate something for you. Please send me APT token first."
    isMyMessage={false}
    action="WAIT_FOR_TOKEN"
  />
);
