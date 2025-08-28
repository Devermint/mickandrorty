"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Flex, FlexProps, Icon, Text, Badge, HStack } from "@chakra-ui/react";
import { DefaultChatEntry, ChatEntry } from "./ChatEntry";
import { AgentInput } from "../Agents/AgentInput";
import { colorTokens } from "../theme/theme";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatHelperButton } from "./ChatHelperButton";
import { Agent } from "@/app/types/agent";
import { StarsIcon } from "../icons/stars";
import { IoChatbubble } from "react-icons/io5";
import { useAgentCreation } from "@/app/lib/utils/agentCreation";
import { ChatEntryProps, ChatState } from "@/app/types/message";
import { useMessageHandler } from "@/app/hooks/useMessageHandler";
import { useTokenImageUpload } from "@/app/hooks/useTokenImageUpload";
import { useGroupChat } from "@/app/hooks/useGroupChat";

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

  // Existing AI chat state
  const inputMessage = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chatState, setChatState] = useState(ChatState.IDLE);
  const [progress, setProgress] = useState<string | null>(null);
  const didInitialize = useRef(false);

  // Track the last message count to detect new AI responses
  const lastMessageCountRef = useRef(messages.length);

  // Group chat integration with agent-specific room
  const handleGroupMessage = useCallback(
    (groupMessage: ChatEntryProps, isFromHistory = false) => {
      setMessages((prev) => [...prev, groupMessage]);
    },
    [setMessages]
  );

  const {
    isConnected: isGroupConnected,
    connectionStatus,
    error: groupError,
    sendUserMessage,
    sendAgentMessage,
    clearError,
  } = useGroupChat({
    socketUrl,
    enabled: enableGroupChat,
    agentId: agent.fa_id,
    hasExistingMessages: messages.length > 0, // Add this line
    onNewMessage: handleGroupMessage,
  });
  // Original message handler
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
    setProgress,
  });

  // Enhanced message send that sends to both AI and group chat
  const onMessageSend = useCallback(() => {
    const messageElement = inputMessage.current;
    if (!messageElement || !messageElement.value.trim()) return;

    const messageContent = messageElement.value.trim();

    // Send user message to group chat first
    if (enableGroupChat && isGroupConnected) {
      sendUserMessage(messageContent);
    }

    // Then process with AI agent (existing behavior)
    originalOnMessageSend();
  }, [
    enableGroupChat,
    isGroupConnected,
    sendUserMessage,
    originalOnMessageSend,
  ]);

  // Track messages that we've already broadcast to prevent loops
  const broadcastedMessagesRef = useRef(new Set<string>());

  // Monitor for new AI responses and broadcast them to group chat (with loop prevention)
  useEffect(() => {
    const currentMessageCount = messages.length;
    const lastCount = lastMessageCountRef.current;

    if (
      currentMessageCount > lastCount &&
      enableGroupChat &&
      isGroupConnected
    ) {
      // Check if the newest message is from the assistant and not from group chat
      const newestMessage = messages[currentMessageCount - 1];

      if (
        newestMessage?.role === "assistant" &&
        (newestMessage?.type === "text" || newestMessage?.type === "video") && // Include both text and video
        !newestMessage.data?.isGroupMessage
      ) {
        // Don't broadcast messages that came from group chat

        // Create a unique identifier for this message to prevent duplicate broadcasts
        const messageId = `${newestMessage.content}_${Date.now()}`;

        if (!broadcastedMessagesRef.current.has(messageId)) {
          broadcastedMessagesRef.current.add(messageId);

          sendAgentMessage(newestMessage.content);

          // Clean up old message IDs to prevent memory leaks (keep last 100)
          if (broadcastedMessagesRef.current.size > 100) {
            const entries = Array.from(broadcastedMessagesRef.current);
            broadcastedMessagesRef.current = new Set(entries.slice(-50));
          }
        }
      }
    }

    lastMessageCountRef.current = currentMessageCount;
  }, [messages, enableGroupChat, isGroupConnected, sendAgentMessage]);

  const { handleTokenImageUploaded } = useTokenImageUpload({
    setMessages,
    inputMessage,
    onMessageSend,
  });

  const handleHelperButtonClick = (chatMessage: string) => {
    if (inputMessage.current === null) return;
    inputMessage.current.value = chatMessage;
    onMessageSend();
  };

  const count = messages?.length ?? 0;
  const msg = searchParams.get("message") ?? "";

  // Auto-scroll
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [count]);

  // Handle initial message from URL
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
      <Flex flexDir="column" h="100%" maxH="100%" overflowY="hidden">
        <Flex
          bg={
            chatName
              ? colorTokens.blackCustom.a2
              : { base: colorTokens.blackCustom.a2, md: "unset" }
          }
          align="center"
          px={3}
          py={1}
          display={{ base: "none", md: "flex" }}
          justify="space-between"
        >
          <HStack>
            <Icon size="md" mb="2px">
              <StarsIcon color={colorTokens.green.erin} />
            </Icon>

            <Text px={{ base: 1, md: 2 }} py={{ base: 1, md: 2 }} fontSize="lg">
              {chatName ? chatName : `Chat with ${agent.agent_name || "Agent"}`}
            </Text>
          </HStack>

          {/* Group chat status indicator */}
          {enableGroupChat && (
            <HStack
              gap={2}
              color={
                isGroupConnected
                  ? colorTokens.green.erin
                  : colorTokens.gray.timberwolf
              }
            >
              <IoChatbubble size="16" />
              {/* <Badge
                colorPalette={isGroupConnected ? "green" : "red"}
                size="sm"
                variant="solid"
              >
                {isGroupConnected ? "Live" : "Offline"}
              </Badge> */}
            </HStack>
          )}
        </Flex>

        {/* Group chat error display */}
        {enableGroupChat && groupError && (
          <Flex
            bg="red.900"
            px={3}
            py={1}
            align="center"
            justify="space-between"
          >
            <Text fontSize="sm" color="red.200">
              {groupError}
            </Text>
            <Text
              fontSize="sm"
              color="red.300"
              cursor="pointer"
              onClick={clearError}
            >
              ✕
            </Text>
          </Flex>
        )}

        <Flex
          direction="column"
          overflowY="auto"
          flex={1}
          px={4}
          pt={4}
          pb={10}
          mr="0.5rem"
          ref={containerRef}
          overscrollBehaviorY="contain"
          minH={0}
          maxH="100%"
          css={{
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { width: "6px" },
            "&::-webkit-scrollbar-thumb": { borderRadius: "24px" },
          }}
        >
          {count === 0 ? (
            <DefaultChatEntry />
          ) : (
            <>
              {messages.map((m, i) => {
                return (
                  <ChatEntry
                    key={i}
                    role={m.role}
                    content={m.content}
                    type={m.type}
                    data={m.data}
                    onAgentCreate={m.onAgentCreate}
                    onTokenImageUploaded={
                      m.type === "image-upload"
                        ? handleTokenImageUploaded
                        : undefined
                    }
                  />
                );
              })}
              {chatState === ChatState.GENERATING_VIDEO && progress && (
                <ChatEntry
                  type="video-loader"
                  role="assistant"
                  content={progress}
                />
              )}
              {chatState === ChatState.PROCESSING && (
                <ChatEntry type="loader" role="assistant" content={""} />
              )}
            </>
          )}
        </Flex>

        <Flex
          w="100%"
          gap={2}
          flexWrap="wrap-reverse"
          mx="auto"
          align="flex-end"
          justify="center"
          flexShrink={0}
        >
          <ChatHelperButton
            label="Video generator"
            onButtonClick={handleHelperButtonClick}
            chatEntry="Can you generate a video for me?"
          />
          <ChatHelperButton
            label="Obtaining APTOS"
            onButtonClick={handleHelperButtonClick}
            chatEntry="How do I obtain APTOS?"
          />
          <ChatHelperButton
            label="Agent creation"
            onButtonClick={handleHelperButtonClick}
            chatEntry="How do I create an agent?"
          />
          <ChatHelperButton
            label="Token creation"
            onButtonClick={handleHelperButtonClick}
            chatEntry="How is my token created?"
          />
        </Flex>

        <AgentInput
          h="17%"
          flexShrink={0}
          m={3}
          w="auto"
          p={0}
          inputRef={inputMessage}
          disabled={chatState !== ChatState.IDLE}
          onButtonClick={onMessageSend}
        />
      </Flex>
    </Flex>
  );
};

export default Chat;
