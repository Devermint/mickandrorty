"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AvatarIcon, Flex, Text } from "@chakra-ui/react";
import {
  ChatEntryProps,
  DefaultChatEntry,
  ChatEntry,
  DemoVideoEntry,
  DefaultTransactionEntry,
} from "./ChatEntry";
import { AgentInput } from "../agent/AgentInput";
import { colorTokens } from "../theme";
import { useSearchParams, useRouter } from "next/navigation";
// import { useAptosWallet } from "@/app/context/AptosWalletContext";

enum ChatState {
  IDLE,
  PROCESSING,
  GENERATING_VIDEO,
}

const Chat = () => {
  // const account = useAptosWallet();

  const inputMessage = useRef<HTMLTextAreaElement>(null);
  const bottomScroll = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const msg = searchParams.get("message") ?? "";

  const [chatState, setChatState] = useState(ChatState.IDLE);
  const [messages, setMessages] = useState<ChatEntryProps[]>([]);
  const [progress, setProgress] = useState<string | null>(null);

  const didInitialize = useRef(false);

  useEffect(() => {
    bottomScroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onMessageSend = useCallback(async () => {
    const el = inputMessage.current;
    if (!el || chatState !== ChatState.IDLE) return;

    const text = el.value.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      { sender: "You", message: text, isMyMessage: true },
    ]);

    el.value = "";
    el.blur();

    // If the message starts with "generate video", do something (e.g., log or handle differently)
    if (text.toLowerCase().startsWith("generate video")) {
      setChatState(ChatState.GENERATING_VIDEO);

      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: text }),
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

        console.log(data);

        if (data.status === "IN_QUEUE") {
          setMessages((prev) => [
            ...prev,
            {
              sender: "Agent",
              message: "Video is in queue...",
              isMyMessage: false,
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
              sender: "Agent",
              videoUrl: data.videoUrl,
              isMyMessage: false,
            },
          ]);
          setProgress(null);
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
          sender: "Agent",
          message:
            "Video generation is in progress... (this may take ~5 minutes)",
          isMyMessage: false,
        },
      ]);

      el.value = "";
      el.focus();
    } else {
      setChatState(ChatState.PROCESSING);

      // Regular message handling
      setMessages((prev) => [
        ...prev,
        { sender: "You", message: text, isMyMessage: true },
        { sender: "Agent", message: "Hello", isMyMessage: false },
      ]);

      setChatState(ChatState.IDLE);
      el.value = "";
      el.focus();
    }
  }, [chatState]);

  useEffect(() => {
    const el = inputMessage.current;
    if (msg && el && !didInitialize.current) {
      didInitialize.current = true;
      el.value = msg;
      onMessageSend();
      router.replace("/chat");
    }
  }, [msg, onMessageSend, router]);

  //Čia transactiono funkcija iš dappso

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
  //     // Add the transaction hash to the chat
  //     await addDoc(messagesRef, {
  //       text: `Transaction successful! Hash: ${pendingTxn?.hash}`,
  //       senderType: "user",
  //       createdAt: serverTimestamp(),
  //       userId: account.isConnected
  //         ? account?.account?.address?.toString()
  //         : sessionId,
  //     });

  //     // Send the transaction message to the server and handle the response

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

  //     await addDoc(messagesRef, {
  //       text: serverResponse[0].text,
  //       senderType: "agent",
  //       createdAt: serverTimestamp(),
  //       userId: account.isConnected
  //         ? account?.account?.address?.toString()
  //         : sessionId,
  //     });
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

  return (
    <Flex
      bg={colorTokens.blackCustom.a1}
      borderRadius={20}
      maxW={800}
      w={800}
      flexDirection="column"
      justify="space-between"
      h="100%"
    >
      <Flex flexDir="column" maxH="85%" h="85%">
        <Flex h={50}>
          <AvatarIcon />
          <Text p={4} fontSize="lg">
            Chat
          </Text>
        </Flex>

        <Flex
          direction="column"
          overflowY="auto"
          p={4}
          mr="0.5rem"
          css={{
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { width: "6px" },
            "&::-webkit-scrollbar-thumb": { borderRadius: "24px" },
          }}
        >
          {messages.length === 0 ? (
            <>
              <DefaultChatEntry />
              <DemoVideoEntry />
              <DefaultTransactionEntry />
            </>
          ) : (
            <>
              {messages.map((m, i) => <ChatEntry key={i} {...m} />)}
              {progress && (
                <ChatEntry sender="Agent" message={progress} isMyMessage={false} />
              )}
            </>
          )}
          <div ref={bottomScroll} />
        </Flex>
      </Flex>

      <AgentInput
        maxH="15%"
        minH="15%"
        m={3}
        w="auto"
        p={0}
        inputRef={inputMessage}
        onButtonClick={onMessageSend}
      />
    </Flex>
  );
};

export default Chat;
