"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Flex, FlexProps, Icon, Text } from "@chakra-ui/react";
import { ChatEntryProps, DefaultChatEntry, ChatEntry } from "./ChatEntry";
import { AgentInput } from "../Agents/AgentInput";
import { colorTokens } from "../theme/theme";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatHelperButton } from "./ChatHelperButton";
import { Agent, AgentType } from "@/app/types/agent";
import { StarsIcon } from "../icons/stars";
import { ClientRef, getClientFile } from "@/app/lib/clientImageStore";
import {
  AgentCreationData,
  createAgent,
  useAgentCreation,
} from "@/app/lib/utils/agentCreation";

enum ChatState {
  IDLE,
  PROCESSING,
  GENERATING_VIDEO,
}

interface ChatProps extends FlexProps {
  agent: Agent;
  messages: ChatEntryProps[];
  setMessages: React.Dispatch<React.SetStateAction<ChatEntryProps[]>>;
}

const Chat = ({ agent, messages, setMessages, ...rest }: ChatProps) => {
  const { wallet, account, isConnected, swapSDK } = useAgentCreation();

  const inputMessage = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const searchParams = useSearchParams();
  const msg = searchParams.get("message") ?? "";

  const [chatState, setChatState] = useState(ChatState.IDLE);
  const [progress, setProgress] = useState<string | null>(null);

  const didInitialize = useRef(false);
  const count = messages?.length ?? 0;

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [count]);

  const handleAgentCreation = useCallback(
    async (agentData: AgentCreationData) => {
      if (!wallet || !account?.address || !isConnected) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Wallet not connected. Please connect your wallet first.",
            type: "error",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          type: "loader",
        },
      ]);

      try {
        const result = await createAgent(
          agentData,
          swapSDK,
          wallet,
          account.address.toString()
        );

        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            content: `Agent created successfully!\n\n**Token Name:** ${
              agentData.tokenName
            }\n**Symbol:** ${agentData.tokenTicker}\n**Transaction Hash:** \`${
              result.agentHash
            }\`\n\n${
              result.poolHash
                ? `**Pool Created:** \`${result.poolHash}\`\n`
                : ""
            }${
              result.liquidityHash
                ? `**Liquidity Added:** \`${result.liquidityHash}\`\n`
                : ""
            }${
              result.swapHash
                ? `**Swap Executed:** \`${result.swapHash}\`\n`
                : ""
            }${
              result.removeLiquidityHash
                ? `**Liquidity Removed:** \`${result.removeLiquidityHash}\`\n`
                : ""
            }\nYour agent is now live on the Aptos blockchain!`,
            type: "text",
          },
        ]);

        try {
          await fetch("/api/agent/finalize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...agentData,
              txHash: result.agentHash,
              userAddress: account.address,
              agentMeta: result.agentMeta,
            }),
          });
        } catch (finalizeError) {
          console.warn("Failed to finalize on backend:", finalizeError);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Agent creation failed";

        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            content: `Agent creation failed\n\n**Error:** ${errorMessage}\n\nPlease try again or check your wallet connection. If the error persists, the agent may already exist for this wallet.`,
            type: "error",
          },
        ]);

        console.error("Agent creation failed:", error);
      }
    },
    [wallet, account, isConnected, swapSDK, setMessages]
  );

  const onMessageSend = useCallback(async () => {
    const el = inputMessage.current;
    if (!el || chatState !== ChatState.IDLE) return;

    const text = el.value.trim();
    if (!text) return;

    let holdStateForVideo = false;

    try {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text, type: "text" },
      ]);

      setChatState(ChatState.PROCESSING);
      el.value = "";
      el.blur();

      if (agent.agent_type === AgentType.AgentCreator) {
        const response = await fetch("/api/chat/create-agent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              ...messages,
              { role: "user", content: text, type: "text" },
            ],
          }),
        });
        const body = await response.json();
        const { markdown, notice, kind, data } = body;

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: markdown ?? notice,
            type: kind,
            data: data,
            onAgentCreate:
              kind === "signature-required" ? handleAgentCreation : undefined,
          },
        ]);
      } else {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              ...messages,
              { role: "user", content: text, type: "text" },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to chat");
        }

        if (!response.body) {
          throw new Error("No response body from chat");
        }

        const { message, action } = await response.json();

        if (action === "GENERATE_VIDEO") {
          holdStateForVideo = true;
          setChatState(ChatState.GENERATING_VIDEO);
          const response = await fetch("/api/generate-video", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: message }),
          });
          if (!response.ok) {
            throw new Error("Failed to generate video");
          }

          if (!response.body) {
            throw new Error("No response body for streaming");
          }

          const { jobId } = await response.json();

          const es = new EventSource(`/api/generate-video?id=${jobId}`);

          es.onmessage = (e) => {
            const data = JSON.parse(e.data);
            console.log("Hello");
            console.log(data.status);

            if (data.status === "IN_QUEUE") {
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: "Video is in queue...",
                  type: "text",
                },
              ]);
            }

            if (data.status === "IN_PROGRESS") {
              setProgress(data.progress);
            }

            if (data.status === "COMPLETED") {
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: data.videoUrl,
                  type: "video",
                },
              ]);
              setProgress(null);
              setChatState(ChatState.IDLE);
              es.close();
            }
          };

          es.onerror = (e) => {
            console.error("SSE error", e);
            es.close();
          };

          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "Video generation is in progress... (this may take ~5 minutes)",
              type: "text",
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: message, type: "text" },
          ]);
        }
      }
      el.value = "";
    } catch (error) {
      el.value = "";

      if (error instanceof Error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: error.message,
            type: "error",
          },
        ]);
      }
    } finally {
      if (!holdStateForVideo) {
        setChatState(ChatState.IDLE);
      }
    }
  }, [chatState, messages, agent.type, handleAgentCreation]);

  useEffect(() => {
    const el = inputMessage.current;
    if (msg && el && !didInitialize.current) {
      didInitialize.current = true;
      el.value = msg;
      onMessageSend();

      router.replace(window.location.pathname);
    }
  }, [msg, onMessageSend, router]);

  const handleTokenImageUploaded = useCallback(
    async (ref: ClientRef) => {
      try {
        const file = getClientFile(ref.id);
        if (!file) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Could not read the selected file. Please try again.",
              type: "error",
            },
          ]);
          return;
        }

        const okTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
        const maxBytes = 5_000_000;
        if (!okTypes.has(file.type)) throw new Error("Unsupported file type.");
        if (file.size === 0) throw new Error("Empty file.");
        if (file.size > maxBytes) throw new Error("File too large.");

        const fd = new FormData();
        fd.append("file", file, file.name || "upload");

        const res = await fetch("/api/upload-image", {
          method: "POST",
          body: fd,
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          throw new Error(errText || `Upload failed with ${res.status}`);
        }

        const json = (await res.json()) as { url?: string };
        if (!json?.url)
          throw new Error("Upload succeeded but no URL returned.");

        if (inputMessage.current) {
          inputMessage.current.value = `Here is my token image: ![Image](${json.url})`;
          await onMessageSend();
        }
      } catch (e: any) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: e?.message ?? "Upload failed",
            type: "error",
          },
        ]);
      }
    },
    [onMessageSend, setMessages]
  );

  const handleHelperButtonClick = (chatMessage: string) => {
    if (inputMessage.current === null) return;

    inputMessage.current.value = chatMessage;
    onMessageSend();
  };

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
          bg={{ base: colorTokens.blackCustom.a2, md: "unset" }}
          align="center"
          px={3}
          py={1}
          display={{ base: "none", md: "flex" }}
        >
          <Icon size="md" mb="2px">
            <StarsIcon color={colorTokens.green.erin} />
          </Icon>
          <Text px={{ base: 1, md: 2 }} py={{ base: 1, md: 2 }} fontSize="lg">
            Chat
          </Text>
        </Flex>

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
            <>
              <DefaultChatEntry />
            </>
          ) : (
            <>
              {messages.map((m, i) => (
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
              ))}
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
