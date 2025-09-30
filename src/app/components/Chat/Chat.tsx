"use client";

const VIDEO_TREASURY_ADDRESS =
  "0x24cc3a079fcecd1ec7d71bfc71639765a60cab04514b950728fb83285c271596";
const VIDEO_FEE_OCTAS = 10_000_000n; // 0.1 APT
const VIDEO_PAYMENT_VERIFY_ENDPOINT = "/api/video/payments/verify";

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
  const spacerRef = useRef<HTMLDivElement>(null);
  const [chatState, setChatState] = useState(ChatState.IDLE);
  const didInitialize = useRef(false);

  // Track the last message count to detect new AI responses
  const lastMessageCountRef = useRef(messages.length);

  // Group chat integration with agent-specific room
  const handleGroupMessage = useCallback(
    (groupMessage: ChatEntryProps, isFromHistory = false) => {
      setMessages((prev) => {
        if (
          groupMessage.type === "video_request" &&
          groupMessage.data?.isGroupMessage &&
          prev.some(
            (msg) =>
              msg.type === "video_request" &&
              !msg.data?.isGroupMessage &&
              (msg.data?.prompt ?? msg.content) ===
                (groupMessage.data?.prompt ?? groupMessage.content)
          )
        ) {
          return prev;
        }

        return [...prev, groupMessage];
      });
    },
    [setMessages]
  );

  const handleMessageUpdate = useCallback(
    (updatedMessage: ChatEntryProps) => {
      setMessages((prev) =>
        prev.map((msg) => {
          // Match by message ID
          const messageId =
            updatedMessage.data?.messageId || updatedMessage.data?._id;
          const currentMessageId = msg.data?.messageId || msg.data?._id;
          if (messageId && currentMessageId === messageId) {
            return { ...msg, ...updatedMessage };
          }
          // Fallback: match by job_id for video messages
          if (
            updatedMessage.data?.job_id &&
            msg.data?.job_id === updatedMessage.data.job_id
          ) {
            return { ...msg, ...updatedMessage };
          }
          return msg;
        })
      );
    },
    [setMessages]
  );

  const handleVideoGenerationRequest = useCallback(
    async (prompt: string | undefined) => {
      const promptToUse = (prompt ?? "").trim();
      if (!promptToUse) {
        return;
      }

      const senderAddress =
        typeof account?.address === "string"
          ? account.address
          : account?.address?.toString?.() ?? "";

      if (!wallet || !senderAddress || !isConnected) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Wallet not connected. Please connect your wallet to pay 0.1 APT before generating a video.",
            type: "error",
          },
        ]);
        return;
      }

      setChatState(ChatState.PROCESSING);

      let paymentResult:
        | { hash?: string; transactionHash?: string }
        | undefined;
      try {
        paymentResult = await wallet.signAndSubmitTransaction({

          data: {
            function: "0x1::coin::transfer",
            typeArguments: ["0x1::aptos_coin::AptosCoin"],
            functionArguments: [
              VIDEO_TREASURY_ADDRESS,
              VIDEO_FEE_OCTAS.toString(),
            ],
          },
        } as any);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Payment failed or was rejected.";
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Payment failed: ${message}`,
            type: "error",
          },
        ]);
        setChatState(ChatState.IDLE);
        return;
      }

      const paymentHash = paymentResult?.hash || paymentResult?.transactionHash;
      if (!paymentHash) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Payment completed but transaction hash is missing.",
            type: "error",
          },
        ]);
        setChatState(ChatState.IDLE);
        return;
      }

      try {
        const verifyResponse = await fetch(VIDEO_PAYMENT_VERIFY_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tx_hash: paymentHash }),
        } as any);

        let verifyBody: any = null;
        try {
          verifyBody = await verifyResponse.json();
        } catch (_) {
          verifyBody = null;
        }

        if (!verifyResponse.ok) {
          const message =
            (verifyBody?.error as string) ||
            (verifyBody?.message as string) ||
            "Payment verification failed.";
          throw new Error(message);
        }

        if (verifyBody?.inserted === false) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "This transaction has already been used for video generation.",
              type: "error",
            },
          ]);
          setChatState(ChatState.IDLE);
          return;
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Payment verification failed.";
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: message,
            type: "error",
          },
        ]);
        setChatState(ChatState.IDLE);
        return;
      }

      try {
        const response = await fetch("/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: promptToUse }),
        } as any);
        if (!response.ok) {
          throw new Error("Failed to generate video");
        }
        const { jobId } = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "",
            type: "video",
            data: { job_id: jobId, prompt: promptToUse },
          },
        ]);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to generate video";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: message, type: "error" },
        ]);
      } finally {
        setChatState(ChatState.IDLE);
      }
    },
    [account?.address, isConnected, setChatState, setMessages, wallet]
  );
  const {
    isConnected: isGroupConnected,
    error: groupError,
    sendUserMessage,
    sendAgentMessage,
    socket,
    clearError,
  } = useGroupChat({
    socketUrl,
    enabled: enableGroupChat,
    agentId: agent.fa_id,
    hasExistingMessages: messages.length > 0,
    onNewMessage: handleGroupMessage,
    onMessageUpdate: handleMessageUpdate,
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
    socket,
    agentId: agent.fa_id,
    sendAgentMessage,
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
        const messageId = `${newestMessage.content}_${
          newestMessage.data?.job_id || ""
        }_${Date.now()}`;

        if (!broadcastedMessagesRef.current.has(messageId)) {
          broadcastedMessagesRef.current.add(messageId);

          // For video messages with job_id, send the job_id along with the message
          if (newestMessage.type === "video" && newestMessage.data?.job_id) {
            // Send video message with job_id to Socket.IO backend
            if (socket) {
              socket.emit("send_agent_message", {
                content: newestMessage.content || "", // Empty content for initial video generation
                agent_id: agent.fa_id,
                user_type: "agent",
                type: "video",
                job_id: newestMessage.data.job_id,
              });
            }
          } else {
            sendAgentMessage(
              newestMessage.content,
              newestMessage.type,
              newestMessage.data
            );
          }

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

  // Auto-scroll to bottom (top of reversed container) on new messages
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const timeoutId = setTimeout(() => {
      el.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);

    return () => clearTimeout(timeoutId);
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
      <Flex flexDir="column" flex={1} overflowY="hidden">
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
          direction="column-reverse"
          overflowY="auto"
          flex={1}
          px={4}
          pt={4}
          pb={4}
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
              {chatState === ChatState.PROCESSING && (
                <ChatEntry type="loader" role="assistant" content={""} />
              )}
              {[...messages].reverse().map((m, i) => {
                return (
                  <ChatEntry
                    key={messages.length - 1 - i}
                    role={m.role}
                    content={m.content}
                    type={m.type}
                    data={m.data}
                    job_id={m.data?.job_id || null}
                    onAgentCreate={m.onAgentCreate}
                    onTokenImageUploaded={
                      m.type === "image-upload"
                        ? handleTokenImageUploaded
                        : undefined
                    }
                    onGenerateVideo={
                      m.type === "video_request"
                        ? (prompt) =>
                            handleVideoGenerationRequest(
                              prompt ?? m.data?.prompt ?? m.content
                            )
                        : undefined
                    }
                  />
                );
              })}
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
            label="Agent creation"
            onButtonClick={handleHelperButtonClick}
            chatEntry="How do I create an agent on Aptos AI Layer?"
          />
          <ChatHelperButton
            label="Token creation"
            onButtonClick={handleHelperButtonClick}
            chatEntry="How is my token created on Aptos AI Layer?"
          />
        </Flex>

        <AgentInput
          h="17%"
          flexShrink={0}
          m={3}
          w="auto"
          p={0}
          inputRef={inputMessage}
          // disabled={chatState !== ChatState.IDLE}
          onButtonClick={onMessageSend}
        />
      </Flex>
    </Flex>
  );
};

export default Chat;

