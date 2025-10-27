import { Flex, FlexProps } from "@chakra-ui/react";
import React, { forwardRef } from "react";
import { DefaultChatEntry, ChatEntry } from "./ChatEntry";
import {
  ChatEntryProps,
  ChatState,
  TelegramChannelDetectionResult,
} from "@/app/types/message";
import { TwitterKeys } from "@/app/lib/utils/agentCreation";

interface ChatMessageListProps extends FlexProps {
  messages: ChatEntryProps[];
  chatState: ChatState;
  onTokenImageUploaded?: ChatEntryProps["onTokenImageUploaded"];
  onChannelsDetected?: (
    payload: TelegramChannelDetectionResult
  ) => void | Promise<void>;
  onGenerateVideo: (prompt: string | undefined) => void | Promise<void>;
  onTelegramPostConfirm?: (payload: {
    post: string;
    videoUrl?: string;
    messageIndex: number;
  }) => void | Promise<void>;
  onTwitterPostConfirm?: (payload: {
    post: string;
    videoUrl?: string;
    messageIndex: number;
  }) => void | Promise<void>;
  telegramPostInProgressIndex?: number | null;
  twitterPostInProgressIndex?: number | null;
  emptyState?: React.ReactNode;
  showPredictionMarket?: boolean;
  agentOwnerAddress?: string;
  agentDisplayName: string;
  onSaveXAPI: (data?: TwitterKeys) => void;
  agentId?: string;
}

export const ChatMessageList = forwardRef<HTMLDivElement, ChatMessageListProps>(
  (
    {
      messages,
      chatState,
      onTokenImageUploaded,
      onGenerateVideo,
      onChannelsDetected,
      onTwitterPostConfirm,
      onTelegramPostConfirm,
      telegramPostInProgressIndex = null,
      twitterPostInProgressIndex = null,
      emptyState,
      showPredictionMarket = false,
      agentDisplayName,
      agentOwnerAddress,
      agentId,
      onSaveXAPI,
      ...rest
    },
    ref
  ) => {
    const hasMessages = messages.length > 0;
    const reversedMessages = [...messages].reverse();

    return (
      <Flex
        direction={hasMessages ? "column-reverse" : "column"}
        overflowY="auto"
        flex={1}
        px={4}
        pt={4}
        pb={4}
        mr="0.5rem"
        ref={ref}
        overscrollBehaviorY="contain"
        minH={0}
        maxH="100%"
        css={{
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-track": {
            width: "6px",
            marginTop: "4px",
            marginBottom: "4px",
          },
          "&::-webkit-scrollbar-thumb": { borderRadius: "24px" },
        }}
        {...rest}
      >
        {!hasMessages ? (
          emptyState ?? <DefaultChatEntry />
        ) : (
          <>
            {chatState === ChatState.PROCESSING && (
              <ChatEntry
                onSaveXAPI={onSaveXAPI}
                type="loader"
                role="assistant"
                content=""
              />
            )}
            {reversedMessages.map((message, index) => {
              const originalIndex = messages.length - 1 - index;
              const isTelegramPost = message.type === "telegram_post";
              const isTwitterPost = message.type === "twitter_post";
              // todo
              const isTwitterPosted =
                isTwitterPost && message.data?.posted === true;
              const isTwitterProcessing =
                isTwitterPost &&
                message.data?.posted === true &&
                twitterPostInProgressIndex !== null &&
                twitterPostInProgressIndex === originalIndex;

              const isBroadcasted =
                isTelegramPost && message.data?.broadcasted === true;
              const isProcessing =
                isTelegramPost &&
                telegramPostInProgressIndex !== null &&
                telegramPostInProgressIndex === originalIndex;

              return (
                <ChatEntry
                  onSaveXAPI={onSaveXAPI}
                  key={originalIndex}
                  role={message.role}
                  content={message.content}
                  type={message.type}
                  data={message.data}
                  job_id={message.data?.job_id || null}
                  onAgentCreate={message.onAgentCreate}
                  onTokenImageUploaded={
                    message.type === "image-upload"
                      ? onTokenImageUploaded
                      : undefined
                  }
                  onChannelsDetected={
                    message.type === "channel-detect"
                      ? onChannelsDetected
                      : undefined
                  }
                  onGenerateVideo={
                    message.type === "video_request"
                      ? (prompt) =>
                          onGenerateVideo(
                            prompt ?? message.data?.prompt ?? message.content
                          )
                      : undefined
                  }
                  onTelegramPostConfirm={
                    isTelegramPost &&
                    typeof message.content === "string" &&
                    !isBroadcasted &&
                    onTelegramPostConfirm
                      ? () =>
                          onTelegramPostConfirm({
                            post: message.content,
                            videoUrl:
                              typeof message.data?.videoUrl === "string"
                                ? message.data.videoUrl
                                : undefined,
                            messageIndex: originalIndex,
                          })
                      : undefined
                  }
                  isTelegramPostProcessing={isProcessing}
                  isTelegramPostBroadcasted={isBroadcasted}
                  isTwitterPostProcessing={isTwitterProcessing}
                  isTwitterPostPosted={isTwitterPosted}
                  agentOwnerAddress={agentOwnerAddress}
                  onTwitterPostConfirm={
                    isTwitterPost &&
                    typeof message.content === "string" &&
                    !isTwitterPosted &&
                    onTwitterPostConfirm
                      ? () => {
                          onTwitterPostConfirm({
                            post: message.content,
                            videoUrl:
                              typeof message.data?.videoUrl === "string"
                                ? message.data.videoUrl
                                : undefined,
                            messageIndex: originalIndex,
                          });
                        }
                      : undefined
                  }
                  showPredictionMarket={
                    showPredictionMarket && message.type === "video"
                  }
                  agentDisplayName={agentDisplayName}
                  agentId={agentId}
                />
              );
            })}
          </>
        )}
      </Flex>
    );
  }
);

ChatMessageList.displayName = "ChatMessageList";
