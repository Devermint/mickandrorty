"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button,
  Flex,
  FlexProps,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Agent, AgentType } from "@/app/types/agent";
import { ChatEntryProps, ChatState } from "@/app/types/message";
import { TwitterKeys, useAgentCreation } from "@/app/lib/utils/agentCreation";
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
import { useTwitterPostPoster } from "@/app/components/Chat/hooks/useTwitterPostBroadcast";
import { useAuthToken } from "@/app/hooks/useAuth";
import { PredictionMarket } from "@/app/components/Media/PredictionMarket";
import {
  extractMarkets,
  marketToDefinition,
} from "@/app/lib/utils/predictionMarkets";
import type { MarketDocument, MarketsResponse } from "@/app/types/market";

const parseJson = (text: string): unknown => {
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

interface ChatProps extends FlexProps {
  agent: Agent;
  messages: ChatEntryProps[];
  setMessages: React.Dispatch<React.SetStateAction<ChatEntryProps[]>>;
  enableGroupChat?: boolean;
  forceEnableAi?: boolean;
  socketUrl?: string;
  chatName?: string;
  showTabs?: boolean;
  showHeader?: boolean;
  showMessages?: boolean;
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
  showHeader = true,
  showMessages = true,
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
  const { signIn, authHeader } = useAuthToken();
  const predictionsMountedRef = useRef(true);
  const [agentMarkets, setAgentMarkets] = useState<MarketDocument[]>([]);
  const [marketsLoading, setMarketsLoading] = useState(false);
  const [marketsError, setMarketsError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [placingMarketId, setPlacingMarketId] = useState<string | null>(null);

  useEffect(() => {
    predictionsMountedRef.current = true;
    return () => {
      predictionsMountedRef.current = false;
    };
  }, []);

  const isPredictionsTab = showTabs && activeTab === "media";

  const handleXApiSaved = useCallback(
    (data?: TwitterKeys) => {
      if (data) setXApiData(data);
      setMessages((prev) => [
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
    },
    [setMessages]
  );

  const displayedMessages = useMemo(() => {
    if (isPredictionsTab) {
      return [];
    }
    return messages;
  }, [isPredictionsTab, messages]);

  const agentMarketsWithDefinitions = useMemo(
    () =>
      agentMarkets.map((market) => ({
        market,
        definition: marketToDefinition(market),
      })),
    [agentMarkets]
  );

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

  const ensureAuthHeader = useCallback(async () => {
    const header = authHeader();
    if (header.Auth) {
      return header;
    }
    await signIn();
    const refreshed = authHeader();
    if (!refreshed.Auth) {
      throw new Error("Wallet authentication required to place a bet");
    }
    return refreshed;
  }, [authHeader, signIn]);

  const loadAgentMarkets = useCallback(async () => {
    const faId = agent.fa_id?.trim();
    if (!faId) {
      if (predictionsMountedRef.current) {
        setAgentMarkets([]);
        setMarketsError(null);
        setMarketsLoading(false);
      }
      return;
    }

    if (predictionsMountedRef.current) {
      setMarketsLoading(true);
      setMarketsError(null);
    }

    try {
      const response = await fetch(
        `/api/markets/fa/${encodeURIComponent(faId)}`,
        { cache: "no-store" }
      );
      const rawBody = await response.text();
      const parsedBody = parseJson(rawBody);

      if (!response.ok) {
        const message =
          (parsedBody &&
            typeof parsedBody === "object" &&
            parsedBody !== null &&
            typeof (parsedBody as { message?: string }).message === "string" &&
            (parsedBody as { message?: string }).message) ||
          `Request failed with status ${response.status}`;
        throw new Error(message as any);
      }

      const items = extractMarkets(
        (parsedBody ?? []) as MarketsResponse
      ) as MarketDocument[];

      if (predictionsMountedRef.current) {
        setAgentMarkets(items);
        setMarketsError(null);
      }
    } catch (error) {
      if (!predictionsMountedRef.current) return;
      setAgentMarkets([]);
      setMarketsError(
        error instanceof Error ? error.message : "Failed to load markets"
      );
    } finally {
      if (predictionsMountedRef.current) {
        setMarketsLoading(false);
      }
    }
  }, [agent.fa_id]);

  const handleRefreshPredictions = useCallback(() => {
    setActionError(null);
    void loadAgentMarkets();
  }, [loadAgentMarkets]);

  const handlePredict = useCallback(
    async (direction: "for" | "against", marketId?: string, stake?: number) => {
      if (!marketId) {
        if (predictionsMountedRef.current) {
          setActionError("Market identifier missing");
        }
        return;
      }

      const normalizedStake = Math.max(1, Math.round(Number(stake ?? 0)));
      if (!Number.isFinite(normalizedStake) || normalizedStake <= 0) {
        if (predictionsMountedRef.current) {
          setActionError("Enter a stake greater than zero.");
        }
        return;
      }

      if (predictionsMountedRef.current) {
        setPlacingMarketId(marketId);
        setActionError(null);
      }

      const side = direction === "against" ? "no" : "yes";

      try {
        const headers = await ensureAuthHeader();
        const response = await fetch("/api/bets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            market_id: marketId,
            side,
            amount: normalizedStake,
          }),
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok || body?.ok === false) {
          const message =
            typeof body?.error === "string"
              ? body.error
              : typeof body?.message === "string"
              ? body.message
              : "Bet placement failed";
          throw new Error(message);
        }

        if (predictionsMountedRef.current) {
          setActionError(null);
        }

        await loadAgentMarkets();
      } catch (error) {
        if (!predictionsMountedRef.current) return;
        setActionError(
          error instanceof Error ? error.message : "Failed to place bet"
        );
      } finally {
        if (predictionsMountedRef.current) {
          setPlacingMarketId(null);
        }
      }
    },
    [ensureAuthHeader, loadAgentMarkets]
  );

  const predictionsContent = (
    <Flex direction="column" flex={1} overflow="hidden">
      <Flex
        direction="column"
        flex={1}
        px={4}
        py={4}
        gap={4}
        overflowY="auto"
        css={{
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": { borderRadius: "24px" },
        }}
      >
        <Stack gap={3}>
          {marketsLoading ? (
            <Flex
              align="center"
              justify="center"
              gap={3}
              py={3}
              color={colorTokens.gray.timberwolf}
            >
              <Spinner size="sm" />
              <Text>Loading markets…</Text>
            </Flex>
          ) : marketsError ? (
            <Stack
              gap={3}
              align="center"
              justify="center"
              py={6}
              textAlign="center"
            >
              <Text color="red.300">{marketsError}</Text>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshPredictions}
              >
                Retry
              </Button>
            </Stack>
          ) : agentMarketsWithDefinitions.length === 0 ? (
            <Text
              color={colorTokens.gray.timberwolf}
              fontSize="sm"
              textAlign="center"
            >
              No predictions for this agent yet.
            </Text>
          ) : (
            <Stack gap={4}>
              {agentMarketsWithDefinitions.map(({ market, definition }) => (
                <PredictionMarket
                  key={market.id}
                  videoId={market.post_id ?? market.id}
                  marketId={market.id}
                  onPredict={(direction, _videoId, stake) =>
                    handlePredict(direction, market.id, stake)
                  }
                  definition={definition}
                  isSubmitting={placingMarketId === market.id}
                />
              ))}
            </Stack>
          )}
          {actionError ? (
            <Text color="red.300" fontSize="sm">
              {actionError}
            </Text>
          ) : null}
        </Stack>
      </Flex>
    </Flex>
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
    xApiData,
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

  useEffect(() => {
    if (!isPredictionsTab) {
      return;
    }
    setActionError(null);
    void loadAgentMarkets();
  }, [isPredictionsTab, loadAgentMarkets]);

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
    <>
      {showMessages ? (
        <Flex
          bg={colorTokens.gray.tertiaryDark}
          borderRadius={{ base: 0, md: 21 }}
          maxW={800}
          w={{ base: "100%", lg: 725 }}
          flexDirection="column"
          overflow="hidden"
          maxH="100%"
          h={agent.agent_name ? "100%" : "50%"}
          {...rest}
        >
          <Flex flexDir="column" flex={1} overflowY="hidden">
            {showHeader && (
              <ChatHeader
                chatName={chatName}
                agentDisplayName={agent.agent_name ?? "Agent"}
                enableGroupChat={enableGroupChat}
                isGroupConnected={isGroupConnected}
                activeTab={activeTab}
                onTabChange={handleTabSelection}
                showTabs={showTabs}
              />
            )}

            {isPredictionsTab ? (
              predictionsContent
            ) : (
              <>
                {enableGroupChat && groupError && (
                  <ChatErrorBanner
                    message={groupError}
                    onDismiss={clearGroupError}
                  />
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
                  onTwitterPostConfirm={handleTwitterPostConfirm}
                  twitterPostInProgressIndex={twitterPostInProgressIndex}
                  emptyState={
                    showTabs && activeTab === "media"
                      ? mediaEmptyState
                      : undefined
                  }
                  agentOwnerAddress={agent.wallet}
                  agentId={agent.id}
                  showPredictionMarket={false}
                  agentDisplayName={agent.agent_name ?? "Agent"}
                  onSaveXAPI={handleXApiSaved}
                />

                {!showTabs || activeTab === "chat" ? (
                  <>
                    {/* <ChatHelperPanel onSelect={handleHelperButtonClick} /> */}
                    <ChatInputBar
                      inputRef={inputMessage}
                      onSend={onMessageSend}
                      showAiToggle={
                        agent.agent_type !== AgentType.AgentCreator &&
                        enableGroupChat
                      }
                      aiToggleChecked={askAiEnabled}
                      onAiToggleChange={handleAiToggleChange}
                      aiToggleDisabled={aiToggleDisabled}
                      aiToggleTooltip={aiToggleTooltip}
                    />
                  </>
                ) : null}
              </>
            )}
          </Flex>
        </Flex>
      ) : (
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
          w="100%"
          maxH={100}
          borderRadius={21}
        />
      )}
    </>
  );
};

export default Chat;
