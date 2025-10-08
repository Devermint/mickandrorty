"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Flex, FlexProps, Text } from "@chakra-ui/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Agent } from "@/app/types/agent";
import { ChatEntryProps, ChatState } from "@/app/types/message";
import { useAgentCreation } from "@/app/lib/utils/agentCreation";
import { useMessageHandler } from "@/app/hooks/useMessageHandler";
import { useTokenImageUpload } from "@/app/hooks/useTokenImageUpload";
import { colorTokens } from "../theme/theme";
import { ChatHeader } from "./ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatHelperPanel } from "./ChatHelperPanel";
import { ChatInputBar } from "./ChatInputBar";
import { ChatErrorBanner } from "./ChatErrorBanner";
import { useVideoGeneration } from "./hooks/useVideoGeneration";
import { useChatGroupSync } from "./hooks/useChatGroupSync";

interface ChatProps extends FlexProps {
  agent: Agent;
  messages: ChatEntryProps[];
  setMessages: React.Dispatch<React.SetStateAction<ChatEntryProps[]>>;
  enableGroupChat?: boolean;
  socketUrl?: string;
  chatName?: string;
}

const Chat = ({
  agent,
  messages,
  setMessages,
  enableGroupChat = true,
  socketUrl,
  chatName,
  ...rest
}: ChatProps) => {
  const { wallet, account, isConnected, swapSDK } = useAgentCreation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"chat" | "media">("chat");
  const inputMessage = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chatState, setChatState] = useState(ChatState.IDLE);
  const didInitialize = useRef(false);

  const displayedMessages = useMemo(() => {
    if (activeTab === "media") {
      return messages.filter((message) => message.type === "video");
    }
    return messages;
  }, [activeTab, messages]);

  const mediaEmptyState = (
    <Text
      color={colorTokens.gray.timberwolf}
      fontSize="sm"
      textAlign="center"
      py={6}
    >
      No videos yet.
    </Text>
  );

  const { handleVideoGenerationRequest } = useVideoGeneration({
    wallet,
    account,
    isConnected,
    setMessages,
    setChatState,
  });

  const {
    isGroupConnected,
    groupError,
    sendUserMessage,
    sendAgentMessage,
    socket,
    clearGroupError,
  } = useChatGroupSync({
    agentId: agent.fa_id,
    enableGroupChat,
    socketUrl,
    messages,
    setMessages,
  });

  const { onMessageSend: originalOnMessageSend } = useMessageHandler({
    chatState,
    messages,
    agent,
    wallet,
    account,
    isConnected,
    swapSDK,
    inputMessage,
    setMessages,
    setChatState,
    socket,
    agentId: agent.fa_id,
    sendAgentMessage,
  });

  const onMessageSend = useCallback(() => {
    const messageElement = inputMessage.current;
    if (!messageElement || !messageElement.value.trim()) return;

    const messageContent = messageElement.value.trim();

    if (enableGroupChat && isGroupConnected) {
      sendUserMessage(messageContent);
    }

    originalOnMessageSend();
  }, [
    enableGroupChat,
    isGroupConnected,
    sendUserMessage,
    originalOnMessageSend,
  ]);

  const { handleTokenImageUploaded } = useTokenImageUpload({
    setMessages,
    inputMessage,
    onMessageSend,
  });

  const handleHelperButtonClick = useCallback(
    (chatMessage: string) => {
      if (inputMessage.current === null) return;
      inputMessage.current.value = chatMessage;
      onMessageSend();
    },
    [onMessageSend]
  );

  const count = displayedMessages.length;
  const msg = searchParams.get("message") ?? "";

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const timeoutId = setTimeout(() => {
      el.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [count, activeTab]);

  useEffect(() => {
    const el = inputMessage.current;
    if (msg && el && !didInitialize.current) {
      didInitialize.current = true;
      el.value = msg;
      onMessageSend();
      router.replace(window.location.pathname);
    }
  }, [msg, onMessageSend, router]);

  return (
    <Flex
      bg={colorTokens.blackCustom.a1}
      borderRadius={{ base: 0, md: 13 }}
      maxW={800}
      w={{ base: "100%", lg: 800 }}
      flexDirection="column"
      justify="space-between"
      overflow="hidden"
      maxH="100%"
      h="100%"
      {...rest}
    >
      <Flex flexDir="column" flex={1} overflowY="hidden">
        <ChatHeader
          chatName={chatName}
          agentDisplayName={agent.agent_name ?? "Agent"}
          enableGroupChat={enableGroupChat}
          isGroupConnected={isGroupConnected}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {enableGroupChat && groupError && (
          <ChatErrorBanner message={groupError} onDismiss={clearGroupError} />
        )}

        <ChatMessageList
          ref={containerRef}
          messages={displayedMessages}
          chatState={chatState}
          onTokenImageUploaded={handleTokenImageUploaded}
          onGenerateVideo={handleVideoGenerationRequest}
          emptyState={activeTab === "media" ? mediaEmptyState : undefined}
        />

        {activeTab === "chat" ? (
          <>
            <ChatHelperPanel onSelect={handleHelperButtonClick} />
            <ChatInputBar inputRef={inputMessage} onSend={onMessageSend} />
          </>
        ) : (
          <Flex h={6} />
        )}
      </Flex>
    </Flex>
  );
};

export default Chat;
