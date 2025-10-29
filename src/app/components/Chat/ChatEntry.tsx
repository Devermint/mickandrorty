"use client";

import React, { useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  DownloadTrigger,
  Spinner,
  IconButton,
  Icon,
  Stack,
  useClipboard,
} from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";
import { AgentVideoLoader } from "../Agents/AgentVideoLoader";
import { MarkdownView } from "../MarkdownView/MarkdownView";
import { ImageUpload } from "../ImageUpload/ImageUpload";
import { AiOutlineSignature } from "react-icons/ai";
import { FiDownload, FiArrowRight } from "react-icons/fi";
import { X as TwitterIcon } from "../icons/x";
import { TelegramIcon } from "../icons/telegram";
import { LuCopy, LuCheck } from "react-icons/lu";
import { ChatEntryProps } from "@/app/types/message";
import type { UploadConstraints } from "@/app/types/file";
import { PredictionMarket } from "../Media/PredictionMarket";
import { TelegramChannelDetector } from "../TelegramChannelDetector/TelegramChannelDetector";
import { ConnectXApiInline } from "@/app/components/Chat/ConnectXApi";
import { TwitterKeys } from "@/app/lib/utils/agentCreation";
import { useAptosWallet } from "@/app/context/AptosWalletContext";

interface ChatEntryComponentProps extends ChatEntryProps {
  job_id?: string;
  onGenerateVideo?: (prompt: string) => void;
  showPredictionMarket?: boolean;
  agentDisplayName?: string;
  onTelegramPostConfirm?: () => void | Promise<void>;
  isTelegramPostProcessing?: boolean;
  isTelegramPostBroadcasted?: boolean;
  onSaveXAPI: (data?: TwitterKeys) => void;
  isTwitterPostProcessing?: boolean;
  isTwitterPostPosted?: boolean;
  onTwitterPostConfirm?: () => void | Promise<void>;
  agentOwnerAddress?: string;
  agentId?: string;
}

export const ChatEntry = ({
  role,
  content,
  type,
  data,
  job_id,
  onAgentCreate,
  onTokenImageUploaded,
  onChannelsDetected,
  onGenerateVideo,
  onSaveXAPI,
  showPredictionMarket = false,
  agentDisplayName = "Agent",
  onTelegramPostConfirm,
  isTelegramPostProcessing = false,
  isTelegramPostBroadcasted = false,
  onTwitterPostConfirm,
  isTwitterPostProcessing = false,
  isTwitterPostPosted = false,
  agentOwnerAddress,
  agentId,
}: ChatEntryComponentProps) => {
  const { wallet, account, isConnected } = useAptosWallet();

  const isMyMessage = role === "user" && !data?.isGroupMessage;
  const isAgent = role === "assistant" || role == "info";
  const align = isAgent ? "flex-start" : "flex-end";
  const videoId = data?.job_id ?? job_id ?? undefined;
  const rawUserId = useMemo(() => {
    if (typeof data?.user_id === "string" && data.user_id.length > 0) {
      return data.user_id;
    }
    if (
      data &&
      typeof (data as Record<string, unknown>).userId === "string" &&
      ((data as Record<string, unknown>).userId as string).length > 0
    ) {
      return (data as Record<string, unknown>).userId as string;
    }
    return undefined;
  }, [data]);

  const shortUserId = useMemo(() => {
    if (!rawUserId) return undefined;
    return rawUserId.length > 12
      ? `${rawUserId.slice(0, 6)}…${rawUserId.slice(-4)}`
      : rawUserId;
  }, [rawUserId]);

  const userIdClipboard = useClipboard({
    value: rawUserId ?? "",
    timeout: 2000,
  });

  const handlePredictionSelection = (
    direction: "for" | "against",
    videoIdentifier?: string,
    stake?: number
  ) => {
    console.log(
      `[prediction-market] User selected ${direction} for video ${
        videoIdentifier ?? videoId ?? "unknown"
      } with stake ${stake ?? 0}`
    );
  };

  // Background colors
  const bg = isMyMessage ? "#212121" : isAgent ? "transparent" : "#212121"; // Different bg for other users' messages

  // Text colors
  const color = isMyMessage
    ? colorTokens.gray.platinum
    : isAgent
    ? colorTokens.gray.timberwolf
    : colorTokens.gray.platinum;

  const mediaWidth = showPredictionMarket ? "100%" : undefined;
  const messageMaxWidth = showPredictionMarket ? "100%" : "80%";
  const messageWidth = showPredictionMarket ? "100%" : isAgent ? "80%" : "auto";
  const handleShare = (platform: "twitter" | "telegram") => {
    if (!content) return;
    const encodedUrl = encodeURIComponent(content);
    const shareText = encodeURIComponent(
      `🤖 ${agentDisplayName} just dropped a new clip!\n✨ Check out this video and let me know what you think.`
    );
    let shareUrl = "";

    if (platform === "twitter") {
      shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareText}&hashtags=AptosAI,AITrading`;
    } else {
      shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${shareText}`;
    }

    if (typeof window !== "undefined") {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  const uploadConstraints: Partial<UploadConstraints> | undefined =
    type === "image-upload" && data
      ? {
          accept: Array.isArray(data.accept) ? data.accept : undefined,
          maxSizeBytes:
            typeof data.maxSizeBytes === "number"
              ? data.maxSizeBytes
              : undefined,
          minWidth:
            typeof data.minWidth === "number" ? data.minWidth : undefined,
          minHeight:
            typeof data.minHeight === "number" ? data.minHeight : undefined,
        }
      : undefined;
console.log(                  onTwitterPostConfirm,
    isTwitterPostProcessing,
    isTwitterPostPosted)
  return (
    <Flex
      direction="column"
      alignItems={showPredictionMarket ? "stretch" : align}
      mb="10px"
      w={mediaWidth}
    >
      {role === "assistant" && (
        <Text fontSize="12px" mb="2px">
          Agent
        </Text>
      )}
      {role === "user" && (
        <Flex
          align="center"
          gap={2}
          mb="2px"
          alignSelf={align === "flex-end" ? "flex-end" : "flex-start"}
        >
          <Text fontSize="11px" color={colorTokens.gray.platinum}>
            {shortUserId ?? "unknown"}
          </Text>
          {rawUserId ? (
            <IconButton
              aria-label={
                userIdClipboard.copied
                  ? "Copied user address"
                  : "Copy user address"
              }
              variant="ghost"
              border="none"
              size="2xs"
              color={
                userIdClipboard.copied
                  ? colorTokens.green.erin
                  : colorTokens.gray.platinum
              }
              onClick={(event) => {
                event.stopPropagation();
                if (!rawUserId) return;
                try {
                  userIdClipboard.copy();
                } catch (error) {
                  console.warn("Failed to copy user id:", error);
                }
              }}
              _hover={{ color: colorTokens.green.erin, bg: "transparent" }}
              _active={{ color: colorTokens.green.darkErin, bg: "transparent" }}
              fontSize={1}
            >
              {userIdClipboard.copied ? <LuCheck /> : <LuCopy />}
            </IconButton>
          ) : null}
        </Flex>
      )}
      <Box
        px={3}
        py={1}
        bgColor={bg}
        borderRadius={{ base: 10, md: 22 }}
        maxW={messageMaxWidth}
        w={messageWidth}
        // textAlign={isAgent ? "left" : "right"}
        overflow="hidden"
      >
        {type === "text" && (
          <MarkdownView
            color={color}
            fontSize={14}
            p={1}
            isMyMessage={!isAgent}
          >
            {content}
          </MarkdownView>
        )}
        {type === "video_request" && (
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
                onGenerateVideo?.(data?.prompt ?? content);
              }}
              mt={2}
            >
              Generate video
            </Button>
          </>
        )}
        {type === "image-upload" && (
          <>
            <MarkdownView color={color} lineHeight={1.5} fontSize={14} p={1}>
              {content}
            </MarkdownView>
            <ImageUpload
              constraints={uploadConstraints}
              onUploaded={(ref) => {
                void onTokenImageUploaded?.(ref, uploadConstraints);
              }}
            />
          </>
        )}
        {type === "channel-detect" && (
          <Stack gap={3} align="stretch">
            {content && (
              <MarkdownView color={color} lineHeight={1.5} fontSize={14} p={1}>
                {content}
              </MarkdownView>
            )}
            <TelegramChannelDetector
              botToken={data?.botToken ?? ""}
              onComplete={(result) => {
                void onChannelsDetected?.(result);
              }}
            />
          </Stack>
        )}
        {type === "telegram_post" && (
          <Stack gap={3} align="stretch">
            {content && (
              <MarkdownView
                color={color}
                lineHeight={1.5}
                fontSize={14}
                p={1}
                isMyMessage={isMyMessage}
              >
                {content}
              </MarkdownView>
            )}
            <Flex gap={2} justify="flex-start">
              <Button
                size="sm"
                borderWidth={1}
                borderColor={colorTokens.gray.platinum}
                onClick={() => {
                  if (
                    !isTelegramPostProcessing &&
                    !isTelegramPostBroadcasted &&
                    onTelegramPostConfirm
                  ) {
                    void onTelegramPostConfirm();
                  }
                }}
                disabled={
                  !onTelegramPostConfirm ||
                  isTelegramPostProcessing ||
                  isTelegramPostBroadcasted
                }
                loading={isTelegramPostProcessing}
              >
                {isTelegramPostBroadcasted ? "Broadcasted" : "Pay and post"}
              </Button>
            </Flex>
          </Stack>
        )}
        {type === "twitter_post" && (
          <Stack gap={3} align="stretch">
            {content && (
              <MarkdownView
                color={color}
                lineHeight={1.5}
                fontSize={14}
                p={1}
                isMyMessage={isMyMessage}
              >
                {content}
              </MarkdownView>
            )}
            <Flex gap={2} justify="flex-start">
              <Button
                // size="sm"
                // borderWidth={1}
                // borderColor={colorTokens.gray.platinum}
                // onClick={() => {
                //   onGenerateVideo?.(data?.prompt ?? content);
                // }}
                // mt={2}
                size="sm"
                borderWidth={1}
                borderColor={colorTokens.gray.platinum}
                onClick={() => {
                  if (
                    !isTwitterPostProcessing &&
                    !isTwitterPostPosted &&
                    onTwitterPostConfirm
                  ) {
                    void onTwitterPostConfirm();
                  }
                }}
                disabled={
                  !onTwitterPostConfirm ||
                  isTwitterPostProcessing ||
                  isTwitterPostPosted
                }
                loading={isTwitterPostProcessing}
              >
                {isTwitterPostPosted ? "Posted" : "Pay and post"}
              </Button>
            </Flex>
          </Stack>
        )}
        {type === "error" && (
          <Text lineHeight={1.5} fontSize={14} color="red">
            {content}
          </Text>
        )}
        {type === "video" && content && (
          <>
            <Box position="relative" mb={4}>
              <video
                src={content}
                controls
                aria-label="Generated video"
                style={{
                  maxWidth: "100%",
                  borderRadius: "0.375rem",
                }}
              />
              <Flex justify="flex-end" mt={2} gap={1.5}>
                <DownloadTrigger
                  data={async () => {
                    const blob = await fetch(content).then((r) => r.blob());
                    return blob;
                  }}
                  fileName={content.split("/").pop() || "video.mp4"}
                  mimeType="video/mp4"
                  asChild
                >
                  <IconButton
                    aria-label="Download video"
                    size="sm"
                    variant="ghost"
                    color={colorTokens.gray.timberwolf}
                    borderWidth="1px"
                    borderColor={colorTokens.blackCustom.a3}
                    borderRadius="lg"
                    minW={7}
                    h={7}
                    px={0}
                    _hover={{
                      color: colorTokens.green.erin,
                      borderColor: colorTokens.green.erin,
                      backgroundColor: "transparent",
                    }}
                    _active={{
                      color: colorTokens.green.erin,
                      borderColor: colorTokens.green.erin,
                      backgroundColor: "transparent",
                    }}
                    _focusVisible={{
                      boxShadow: "none",
                      color: colorTokens.green.erin,
                    }}
                  >
                    <Icon as={FiDownload} boxSize={3} m={0} p={0} />
                  </IconButton>
                </DownloadTrigger>
                <IconButton
                  aria-label="Share to X"
                  size="sm"
                  variant="ghost"
                  color={colorTokens.gray.timberwolf}
                  borderWidth="1px"
                  borderColor={colorTokens.blackCustom.a3}
                  borderRadius="lg"
                  minW={7}
                  h={7}
                  px={0}
                  _hover={{
                    color: colorTokens.green.erin,
                    borderColor: colorTokens.green.erin,
                    backgroundColor: "transparent",
                  }}
                  _active={{
                    color: colorTokens.green.erin,
                    borderColor: colorTokens.green.erin,
                    backgroundColor: "transparent",
                  }}
                  _focusVisible={{
                    boxShadow: "none",
                    color: colorTokens.green.erin,
                  }}
                  onClick={() => handleShare("twitter")}
                >
                  <TwitterIcon boxSize={3} m={0} p={0} />
                </IconButton>
                <IconButton
                  aria-label="Share to Telegram"
                  size="sm"
                  variant="ghost"
                  color={colorTokens.gray.timberwolf}
                  borderWidth="1px"
                  borderColor={colorTokens.blackCustom.a3}
                  borderRadius="lg"
                  minW={7}
                  h={7}
                  px={0}
                  _hover={{
                    color: colorTokens.green.erin,
                    borderColor: colorTokens.green.erin,
                    backgroundColor: "transparent",
                  }}
                  _active={{
                    color: colorTokens.green.erin,
                    borderColor: colorTokens.green.erin,
                    backgroundColor: "transparent",
                  }}
                  _focusVisible={{
                    boxShadow: "none",
                    color: colorTokens.green.erin,
                  }}
                  onClick={() => handleShare("telegram")}
                >
                  <TelegramIcon boxSize={3} m={0} p={0} />
                </IconButton>
              </Flex>
            </Box>
            {showPredictionMarket && (
              <PredictionMarket
                videoId={videoId}
                onPredict={handlePredictionSelection}
              />
            )}
          </>
        )}
        {type === "video" && !content && job_id && (
          <AgentVideoLoader progress={data.message ?? "Generating video..."} />
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
        {type === "x_api_prompt" && (
          <Stack gap={3} align="stretch">
            {content && (
              <MarkdownView color={color} lineHeight={1.5} fontSize={14} p={1}>
                {content}
              </MarkdownView>
            )}
            {(!agentId || account?.address === agentOwnerAddress) && (
              <ConnectXApiInline onSaved={onSaveXAPI} />
            )}
          </Stack>
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
                  console.log(data);
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
    onSaveXAPI={() => {}}
  />
);

export const DefaultChatEntry = () => (
  <ChatEntry
    role="info"
    content="Chat with this AI agent and other users."
    type="text"
    onSaveXAPI={() => {}}
  />
);
