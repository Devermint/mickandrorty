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
import {TwitterKeys, useAgentCreation} from "@/app/lib/utils/agentCreation";
import { useMessageHandler } from "@/app/hooks/useMessageHandler";
import { useTokenImageUpload } from "@/app/hooks/useTokenImageUpload";
import { useTelegramChannelDetection } from "@/app/hooks/useTelegramChannelDetection";
import { colorTokens } from "../theme/theme";
import { ChatHeader } from "./ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatHelperPanel } from "./ChatHelperPanel";
import { ChatInputBar } from "./ChatInputBar";
import { ChatErrorBanner } from "./ChatErrorBanner";
import { useVideoGeneration } from "./hooks/useVideoGeneration";
import { useTelegramPostBroadcast } from "./hooks/useTelegramPostBroadcast";
import { useChatGroupSync } from "./hooks/useChatGroupSync";
import { useAptosWallet } from "../../context/AptosWalletContext";
import {useTwitterPostPoster} from "@/app/components/Chat/hooks/useTwitterPostBroadcast";

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
  const [xApiData, setXApiData] = useState<TwitterKeys>({});

  const handleXApiSaved = useCallback((data?: TwitterKeys) => {
    if(data) setXApiData(data);
    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
        type: "text",
        content: data?.isConnectAPISuccess
            ? "X API connected successfully."
            : "X API linking skipped.",
      },
    ]);
    if (inputMessage.current) {
      inputMessage.current.value = data?.isConnectAPISuccess
          ? "x_api_done"
          : "x_api_skip";
      onMessageSend(); // this calls your MessageHandler → /api/chat/create-agent again
    }
  }, [setMessages]);

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
    xApiData
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

  const { handleTelegramPostConfirm, telegramPostInProgressIndex } =
    useTelegramPostBroadcast({
      wallet,
      account,
      isConnected,
      setMessages,
      setChatState,
      agentId: agent.fa_id,
    });

  const { handleTwitterPostConfirm, twitterPostInProgressIndex } =
      useTwitterPostPoster({
        wallet,
        account,
        isConnected,
        setMessages,
        setChatState,
        agentId: agent.fa_id,
      });

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
          onTwitterPostConfirm={handleTwitterPostConfirm}
          telegramPostInProgressIndex={telegramPostInProgressIndex}
          twitterPostInProgressIndex={twitterPostInProgressIndex}
          emptyState={
            showTabs && activeTab === "media" ? mediaEmptyState : undefined
          }
          showPredictionMarket={showTabs && activeTab === "media"}
          agentDisplayName={agent.agent_name ?? "Agent"}
          agentOwnerAddress={agent.wallet}
          agentId={agent.id}
          onSaveXAPI={handleXApiSaved}
        />

        {!showTabs || activeTab === "chat" ? (
          <>
            <ChatHelperPanel onSelect={handleHelperButtonClick} agent={agent}/>
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
