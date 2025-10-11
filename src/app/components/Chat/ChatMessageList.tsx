import { Flex } from "@chakra-ui/react";
import React, { forwardRef } from "react";
import { DefaultChatEntry, ChatEntry } from "./ChatEntry";
import { ChatEntryProps, ChatState } from "@/app/types/message";

interface ChatMessageListProps {
  messages: ChatEntryProps[];
  chatState: ChatState;
  onTokenImageUploaded?: ChatEntryProps["onTokenImageUploaded"];
  onGenerateVideo: (prompt: string | undefined) => void | Promise<void>;
  emptyState?: React.ReactNode;
  showPredictionMarket?: boolean;
  agentDisplayName: string;
}

export const ChatMessageList = forwardRef<HTMLDivElement, ChatMessageListProps>(
  (
    {
      messages,
      chatState,
      onTokenImageUploaded,
      onGenerateVideo,
      emptyState,
      showPredictionMarket = false,
      agentDisplayName,
    },
    ref
  ) => {
    const hasMessages = messages.length > 0;
    const reversedMessages = [...messages].reverse();

    return (
      <Flex
        direction="column-reverse"
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
          "&::-webkit-scrollbar-track": { width: "6px" },
          "&::-webkit-scrollbar-thumb": { borderRadius: "24px" },
        }}
      >
        {!hasMessages ? (
          emptyState ?? <DefaultChatEntry />
        ) : (
          <>
            {chatState === ChatState.PROCESSING && (
              <ChatEntry type="loader" role="assistant" content="" />
            )}
            {reversedMessages.map((message, index) => (
              <ChatEntry
                key={messages.length - 1 - index}
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
                onGenerateVideo={
                  message.type === "video_request"
                    ? (prompt) =>
                        onGenerateVideo(
                          prompt ?? message.data?.prompt ?? message.content
                        )
                    : undefined
                }
                showPredictionMarket={
                  showPredictionMarket && message.type === "video"
                }
                agentDisplayName={agentDisplayName}
              />
            ))}
          </>
        )}
      </Flex>
    );
  }
);

ChatMessageList.displayName = "ChatMessageList";
