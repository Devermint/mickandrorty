"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Flex, FlexProps, Text } from "@chakra-ui/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Agent, AgentType } from "@/app/types/agent";
import { ChatEntryProps, ChatState } from "@/app/types/message";
import { useAgentCreation } from "@/app/lib/utils/agentCreation";
import { useMessageHandler } from "@/app/hooks/useMessageHandler";
import { useTokenImageUpload } from "@/app/hooks/useTokenImageUpload";
import { useTelegramChannelDetection } from "@/app/hooks/useTelegramChannelDetection";
import { colorTokens } from "../theme/theme";
import { ChatHeader } from "./ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatHelperPanel } from "./ChatHelperPanel";
import { ChatInputBar } from "./ChatInputBar";
import { ChatErrorBanner } from "./ChatErrorBanner";
import {
  useVideoGeneration,
  VIDEO_FEE_OCTAS,
  getAccountAddress,
} from "./hooks/useVideoGeneration";
import { useChatGroupSync } from "./hooks/useChatGroupSync";
import { useAptosWallet } from "../../context/AptosWalletContext";

interface ChatProps extends FlexProps {
  agent: Agent;
  messages: ChatEntryProps[];
  setMessages: React.Dispatch<React.SetStateAction<ChatEntryProps[]>>;
  enableGroupChat?: boolean;
  forceEnableAi?: boolean;
  socketUrl?: string;
  chatName?: string;
  showTabs?: boolean;
}

const Chat = ({
  agent,
  messages,
  setMessages,
  enableGroupChat = true,
  socketUrl,
  chatName,
  showTabs = true,
  forceEnableAi = false,
  ...rest
}: ChatProps) => {
  const { wallet, account, isConnected, swapSDK } = useAgentCreation();
  const { user } = useAptosWallet();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"chat" | "media">("chat");
  const inputMessage = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chatState, setChatState] = useState(ChatState.IDLE);
  const didInitialize = useRef(false);

  const displayedMessages = useMemo(() => {
    if (showTabs && activeTab === "media") {
      return messages.filter((message) => message.type === "video");
    }
    return messages;
  }, [activeTab, messages, showTabs]);

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

  const [askAiEnabled, setAskAiEnabled] = useState(forceEnableAi);
  const [telegramPostInProgressIndex, setTelegramPostInProgressIndex] =
    useState<number | null>(null);
  const isWalletConnected = Boolean(isConnected && account?.address);
  const aiToggleDisabled = !isWalletConnected;
  const aiToggleTooltip = aiToggleDisabled
    ? "Connect your wallet to use Ask AI"
    : undefined;

  useEffect(() => {
    if (aiToggleDisabled && askAiEnabled) {
      setAskAiEnabled(false);
    }
  }, [aiToggleDisabled, askAiEnabled]);

  const userId = useMemo(() => {
    const username = user?.username?.trim();
    if (username) return username;

    const walletAddress = user?.wallet_address?.trim();
    if (walletAddress) return walletAddress;

    const accountAddressValue =
      typeof account?.address === "string"
        ? account.address
        : account?.address?.toString?.();
    const normalizedAccountAddress =
      typeof accountAddressValue === "string" ? accountAddressValue.trim() : "";

    return normalizedAccountAddress.length > 0
      ? normalizedAccountAddress
      : null;
  }, [user?.username, user?.wallet_address, account?.address]);

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
    userId,
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
    userId,
    sendAgentMessage,
  });

  const handleAiToggleChange = useCallback(
    (checked: boolean) => {
      if (aiToggleDisabled) return;
      setAskAiEnabled(checked);
    },
    [aiToggleDisabled, setAskAiEnabled]
  );

  const onMessageSend = useCallback(() => {
    const messageElement = inputMessage.current;
    if (!messageElement) return;

    const messageContent = messageElement.value.trim();
    if (!messageContent) return;

    if (enableGroupChat && isGroupConnected) {
      sendUserMessage(messageContent);
    }

    if (askAiEnabled || forceEnableAi) {
      originalOnMessageSend();
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "user",
          content: messageContent,
          type: "text",
          data: userId && userId.length > 0 ? { user_id: userId } : undefined,
        },
      ]);
      messageElement.value = "";
      messageElement.blur();
    }
  }, [
    askAiEnabled,
    enableGroupChat,
    isGroupConnected,
    setMessages,
    userId,
    originalOnMessageSend,
    sendUserMessage,
  ]);

  const { handleTokenImageUploaded } = useTokenImageUpload({
    setMessages,
    inputMessage,
    onMessageSend,
  });

  const appendErrorMessage = useCallback(
    (content: string) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content, type: "error" },
      ]);
    },
    [setMessages]
  );

  const handleTelegramPostConfirm = useCallback(
    async ({
      post,
      videoUrl,
      messageIndex,
    }: {
      post: string;
      videoUrl?: string;
      messageIndex: number;
    }) => {
      const postContent = (post ?? "").trim();
      if (!postContent) {
        appendErrorMessage("Telegram post content is empty.");
        return;
      }

      if (telegramPostInProgressIndex !== null) {
        return;
      }

      const transactionsWallet = process.env.NEXT_PUBLIC_TRANSACTIONS_WALLET;
      if (!transactionsWallet) {
        appendErrorMessage(
          "Transactions wallet is not configured. Please try again later."
        );
        return;
      }

      if (!wallet || !isConnected) {
        appendErrorMessage(
          "Wallet not connected. Please connect your wallet to pay 0.1 APT before broadcasting."
        );
        return;
      }

      const senderAddress = getAccountAddress(account);
      if (!senderAddress) {
        appendErrorMessage(
          "Wallet not connected. Please connect your wallet to pay 0.1 APT before broadcasting."
        );
        return;
      }

      setTelegramPostInProgressIndex(messageIndex);
      setChatState(ChatState.PROCESSING);

      try {
        const paymentResult = await wallet
          .signAndSubmitTransaction({
            data: {
              function: "0x1::coin::transfer",
              typeArguments: ["0x1::aptos_coin::AptosCoin"],
              functionArguments: [
                transactionsWallet,
                VIDEO_FEE_OCTAS.toString(),
              ],
            },
          })
          .catch((paymentError: unknown) => {
            const paymentMessage =
              paymentError instanceof Error
                ? `Payment failed: ${paymentError.message}`
                : "Payment failed or was rejected.";
            throw new Error(paymentMessage);
          });

        const paymentHash =
          paymentResult?.hash ?? paymentResult?.transactionHash;

        if (!paymentHash) {
          throw new Error("Payment completed but transaction hash is missing.");
        }

        const payload: Record<string, unknown> = {
          tx_hash: paymentHash,
          agent_id: agent.fa_id,
          post: postContent,
        };

        if (videoUrl) {
          payload.video_url = videoUrl;
        }

        const broadcastResponse = await fetch("/api/telegram/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const rawBody = await broadcastResponse.text();
        let parsedBody: { error?: string; message?: string } | null = null;
        if (rawBody) {
          try {
            parsedBody = JSON.parse(rawBody);
          } catch {
            parsedBody = null;
          }
        }

        if (!broadcastResponse.ok) {
          const message =
            parsedBody?.error ??
            parsedBody?.message ??
            "Failed to broadcast Telegram post.";
          throw new Error(message);
        }

        setMessages((prev) =>
          prev.map((msg, idx) => {
            if (idx !== messageIndex) {
              return msg;
            }
            const baseData =
              msg.data && typeof msg.data === "object" && msg.data !== null
                ? msg.data
                : {};
            return {
              ...msg,
              data: {
                ...baseData,
                post: postContent,
                broadcasted: true,
                transactionHash: paymentHash,
              },
            };
          })
        );

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            type: "text",
            content: `Telegram post broadcast scheduled! Transaction hash: ${paymentHash}`,
          },
        ]);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to broadcast Telegram post.";
        appendErrorMessage(message);
      } finally {
        setChatState(ChatState.IDLE);
        setTelegramPostInProgressIndex(null);
      }
    },
    [
      account,
      agent.fa_id,
      appendErrorMessage,
      isConnected,
      setMessages,
      setChatState,
      telegramPostInProgressIndex,
      wallet,
    ]
  );

  const { handleChannelsDetected } = useTelegramChannelDetection({
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
    if (!showTabs && activeTab !== "chat") {
      setActiveTab("chat");
    }
  }, [showTabs, activeTab]);

  const handleTabSelection = useCallback(
    (tab: "chat" | "media") => {
      if (!showTabs) return;
      setActiveTab(tab);
    },
    [showTabs]
  );

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
          onTabChange={handleTabSelection}
          showTabs={showTabs}
        />

        {enableGroupChat && groupError && (
          <ChatErrorBanner message={groupError} onDismiss={clearGroupError} />
        )}

        <ChatMessageList
          ref={containerRef}
          messages={displayedMessages}
          chatState={chatState}
          onTokenImageUploaded={handleTokenImageUploaded}
          onChannelsDetected={handleChannelsDetected}
          onGenerateVideo={handleVideoGenerationRequest}
          onTelegramPostConfirm={handleTelegramPostConfirm}
          telegramPostInProgressIndex={telegramPostInProgressIndex}
          emptyState={
            showTabs && activeTab === "media" ? mediaEmptyState : undefined
          }
          showPredictionMarket={showTabs && activeTab === "media"}
          agentDisplayName={agent.agent_name ?? "Agent"}
        />

        {!showTabs || activeTab === "chat" ? (
          <>
            <ChatHelperPanel onSelect={handleHelperButtonClick} />
            <ChatInputBar
              inputRef={inputMessage}
              onSend={onMessageSend}
              showAiToggle={
                agent.agent_type !== AgentType.AgentCreator && enableGroupChat
              }
              aiToggleChecked={askAiEnabled}
              onAiToggleChange={handleAiToggleChange}
              aiToggleDisabled={aiToggleDisabled}
              aiToggleTooltip={aiToggleTooltip}
            />
          </>
        ) : (
          <Flex h={6} />
        )}
      </Flex>
    </Flex>
  );
};

export default Chat;
