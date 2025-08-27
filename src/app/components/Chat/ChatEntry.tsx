// ChatEntry.tsx (Clean version without timestamps/usernames)
"use client";

import React from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  DownloadTrigger,
  Spinner,
} from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";
import { AgentVideoLoader } from "../Agents/AgentVideoLoader";
import { MarkdownView } from "../MarkdownView/MarkdownView";
import { ImageUpload } from "../ImageUpload/ImageUpload";
import { AiOutlineSignature } from "react-icons/ai";
import { ChatEntryProps } from "@/app/types/message";

export const ChatEntry = ({
  role,
  content,
  type,
  data,
  onAgentCreate,
  onTokenImageUploaded,
}: ChatEntryProps) => {
  const isMyMessage = role === "user" && !data?.isGroupMessage;
  const isAgent = role === "assistant";

  console.log("role", role);
  console.log("content", content);
  console.log("type", type);
  console.log("data", data);
  const align = isAgent ? "flex-start" : "flex-end";

  // Background colors
  const bg = isMyMessage
    ? colorTokens.blackCustom.a3
    : isAgent
    ? "transparent"
    : colorTokens.blackCustom.a1; // Different bg for other users' messages

  // Text colors
  const color = isMyMessage
    ? colorTokens.gray.platinum
    : isAgent
    ? colorTokens.gray.timberwolf
    : colorTokens.gray.platinum;

  return (
    <Flex direction="column" alignItems={align} mb="10px">
      {role && isAgent && (
        <Text fontSize="12px" mb="2px">
          Agent
        </Text>
      )}
      <Box
        px={3}
        py={1}
        bgColor={bg}
        borderRadius={{ base: 16, md: 28 }}
        maxW="80%"
        w={isAgent ? "80%" : "auto"}
        textAlign={isAgent ? "left" : "right"}
        overflow="hidden"
        borderLeft={isAgent ? `3px solid ${colorTokens.green.erin}` : "none"}
        borderRight={
          !isAgent ? `3px solid ${colorTokens.gray.timberwolf}` : "none"
        }
      >
        {type === "text" && (
          <MarkdownView
            color={color}
            lineHeight={1.5}
            fontSize={14}
            p={1}
            isMyMessage={!isAgent}
          >
            {content}
          </MarkdownView>
        )}
        {type === "image-upload" && (
          <>
            <MarkdownView color={color} lineHeight={1.5} fontSize={14} p={1}>
              {content}
            </MarkdownView>
            <ImageUpload
              onUploaded={(ref) => {
                void onTokenImageUploaded?.(ref);
              }}
            />
          </>
        )}
        {type === "error" && (
          <Text lineHeight={1.5} fontSize={14} color="red">
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
        {type === "video-loader" && <AgentVideoLoader progress={content} />}
        {type === "loader" && (
          <Box mt={{ base: 1, md: 2 }}>
            <Spinner
              color={colorTokens.gray.timberwolf}
              size={{ base: "md", md: "lg" }}
            />
          </Box>
        )}
        {type === "signature-required" && (
          <>
            <MarkdownView
              color={color}
              lineHeight={1.5}
              fontSize={14}
              p={1}
              isMyMessage={isMyMessage}
            >
              {content}
            </MarkdownView>
            <Button
              size="sm"
              borderWidth={1}
              borderColor={colorTokens.gray.platinum}
              onClick={() => {
                if (onAgentCreate && data) {
                  onAgentCreate(data);
                }
              }}
              disabled={!onAgentCreate || !data}
              mt={2}
            >
              <AiOutlineSignature /> Confirm the transaction
            </Button>
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
    content="Chat with this AI agent and other users. Your messages and the agent's responses will be visible to everyone in this agent's chat room."
    type="text"
  />
);
