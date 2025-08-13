"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { ChatEntryProps, DefaultChatEntry, ChatEntry } from "./ChatEntry";
import { AgentInput } from "../Agents/AgentInput";
import { colorTokens } from "../theme/theme";
import { useSearchParams, useRouter } from "next/navigation";
// import { useAptosWallet } from "@/app/context/AptosWalletContext";
import { RxAvatar } from "react-icons/rx";
import { ChatHelperButton } from "./ChatHelperButton";
import { Agent, AgentType } from "@/app/types/agent";

enum ChatState {
  IDLE,
  PROCESSING,
  GENERATING_VIDEO,
}
type ChatProps = {
  agent: Agent;
  messages: ChatEntryProps[];
  setMessages: React.Dispatch<React.SetStateAction<ChatEntryProps[]>>;
};

const Chat = ({ agent, messages, setMessages }: ChatProps) => {
  // const account = useAptosWallet();

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

  const onMessageSend = useCallback(async () => {
    const el = inputMessage.current;
    if (!el || chatState !== ChatState.IDLE) return;

    const text = el.value.trim();
    if (!text) return;

    try {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text, type: "text" },
      ]);

      setChatState(ChatState.PROCESSING);
      el.value = "";
      el.blur();

      if (agent.type === AgentType.AgentCreator) {
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
        const { markdown, notice } = await response.json();

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: markdown ?? notice, type: "text" },
        ]);
        setChatState(ChatState.IDLE);
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

            setChatState(ChatState.IDLE);
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

          el.value = "";
          // el.focus();
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: message, type: "text" },
          ]);
          setChatState(ChatState.IDLE);
        }
      }
      el.value = "";
      // el.focus();
      setChatState(ChatState.IDLE);
    } catch (error) {
      el.value = "";
      // el.focus();
      setChatState(ChatState.IDLE);
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
    }
  }, [chatState, messages]);

  useEffect(() => {
    const el = inputMessage.current;
    if (msg && el && !didInitialize.current) {
      didInitialize.current = true;
      el.value = msg;
      onMessageSend();

      router.replace(window.location.pathname);
    }
  }, [msg, onMessageSend, router]);

  // const handleSendTransaction = async () => {
  //   if (!account || !account.wallet) {
  //     alert("Please connect your Petra wallet first.");
  //     return;
  //   }
  //   // TODO: AAAAAAAA KNX
  //   // const recipient = process.env.NEXT_PUBLIC_RECIPIENT; // Import from .env
  //   const recipient =
  //     "0xc867d5c746677025807a9ce394dc095d0aac08e4e126472c10b02bbebf6bfa1f";
  //   console.log(recipient);
  //   if (!recipient) {
  //     alert("Recipient address is not configured.");
  //     return;
  //   }
  //   const amountOctas = (0.05 * 10 ** 8).toString(); // 0.05 APT in octas
  //   const payload = {
  //     type: "entry_function_payload",
  //     function: "0x1::coin::transfer",
  //     type_arguments: ["0x1::aptos_coin::AptosCoin"],
  //     arguments: [recipient, amountOctas],
  //   };

  //   try {
  //     // console.log("Custom Context Account:", account.wallet.);
  //     const pendingTxn = await account.wallet?.signAndSubmitTransaction(
  //       payload
  //     );
  //     //alert(`Transaction submitted! Hash: ${pendingTxn.hash}`);
  //     console.log("Pending transaction:", pendingTxn);

  //     const apiUrl = `https://sandbox.sui-cluster.xyz/aptos.sandbox/message`;

  //     const response = await fetch(apiUrl, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         text: `Transaction successful! Hash: ${pendingTxn.hash}`,
  //         userId: "userl",
  //         roomId: `default-room-${"randomstringrealia"}`,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to send transaction message to the server.");
  //     }
  //     const serverResponse = await response.json();
  //     console.log("Server response:", serverResponse);
  //   } catch (error: unknown) {
  //     if (
  //       error instanceof Error &&
  //       error.message.includes("Account not found")
  //     ) {
  //       alert(
  //         "The account is not active on the blockchain. Please fund it first."
  //       );
  //     } else {
  //       console.error("Transaction failed", error);
  //       alert(
  //         `Transaction failed: ${
  //           error instanceof Error ? error.message : "Unknown error"
  //         }`
  //       );
  //     }
  //   }
  // };

  const handleHelperButtonClick = (chatMessage: string) => {
    if (inputMessage.current === null) return;

    inputMessage.current.value = chatMessage;
    onMessageSend();
  };

  return (
    <Flex
      bg={colorTokens.blackCustom.a1}
      borderRadius={{ base: 0, md: 20 }}
      maxW={800}
      w={{ base: "100%", lg: 800 }}
      flexDirection="column"
      justify="space-between"
      overflow="hidden"
      maxH="100%"
      h="100%"
    >
      <Flex flexDir="column" h="100%" maxH="100%" overflowY="hidden">
        <Flex
          bg={{ base: colorTokens.blackCustom.a2, md: "unset" }}
          align="center"
          px={3}
          py={1}
          display={{ base: "none", md: "flex" }}
        >
          <Icon size="lg">
            <RxAvatar color="#C7CAC8" />
          </Icon>
          <Text p={{ base: 1, md: 4 }} fontSize="lg">
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
                <ChatEntry key={i} {...m} />
              ))}
              {chatState === ChatState.GENERATING_VIDEO && progress && (
                <ChatEntry
                  type="video-loader"
                  role="assistant"
                  content={progress}
                />
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
          h={{ base: "17%", md: "17%" }}
          m={3}
          w="auto"
          p={0}
          inputRef={inputMessage}
          disabled={chatState !== ChatState.IDLE}
          onButtonClick={onMessageSend}
          flexShrink={0}
        />
      </Flex>
    </Flex>
  );
};

export default Chat;
