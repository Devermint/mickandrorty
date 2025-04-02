"use client";

import { ChatAdapter, ChatEntry } from "@/app/lib/chat";
import { db } from "@/app/lib/firebase";
import { Box, Flex, Input } from "@chakra-ui/react";
import { collection, query, orderBy, addDoc, serverTimestamp, limit } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import React, { useState, useRef, useEffect, useMemo } from "react";
import ArrowIcon from "../../icons/arrow";
import ResponseWaiter from "./ResponseWaiter";
import ChatMessage from "./ChatMessage";
import { Agent } from "@/app/lib/agent";
import { useAptosWallet } from "@/app/contexts/AptosWalletContext";
import { getOrCreateSessionId } from "@/app/lib/sessionManager";
// import { getOrCreateSessionId } from "@/app/lib/sessionManager";

interface AgentChatProps {
  groupId?: string;
  groupName?: string;
  userId?: string;
  adapter?: ChatAdapter;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
  chatIdProp?: string;
  agentId: string;
  agent: Agent;
}

export default function AgentDirectChat({
  groupId,
  groupName,
  agent,
  chatIdProp,
  agentId,
  userId,
  onInputFocus,
  onInputBlur,
}: AgentChatProps) {
  // Local state for UI purposes
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputMessage = useRef<HTMLInputElement>(null);
  const bottomScroll = useRef<HTMLDivElement>(null);
  const [processingMessage, setProcessingMessage] = useState(false);
  const account = useAptosWallet();
  const sessionId = useMemo(() => getOrCreateSessionId(), []);
  // const sessionId = useMemo(() => getOrCreateSessionId(), []);
  // For react-firebase-hooks approach
  const chatId = useMemo(() => chatIdProp ?? `public_${groupId}`, [groupId, chatIdProp]);
  // Use react-firebase-hooks to get messages
  const messagesRef = useMemo(() => {
    return collection(db, "chats", chatId, "messages");
  }, [chatId]);

  const messagesQuery = useMemo(() => {
    return query(messagesRef, orderBy("createdAt", "desc"), limit(300));
  }, [messagesRef]);

  const [messagesData, loading, error] = useCollectionData(messagesQuery);
  const messages: ChatEntry[] = useMemo(() => {
    if (!messagesData) return [];

    return messagesData.map((data) => {
      if (data.senderType === "user") {
        return {
          sender: "User",
          message: data.text,
          alignment: "right",
          messageId: data.id,
          responseToMessageId: data.responseToMessageId,
          isResponseTo: data.isResponseTo,
          userId: data.userId,
        };
      } else {
        return {
          sender: agentId,
          message: data.text,
          alignment: "left",
          messageId: data.id,
          responseToMessageId: data.responseToMessageId,
          isResponseTo: data.isResponseTo,
          userId: data.userId,
        };
      }
    });
  }, [messagesData, agentId]);
  // Set error message if there's an error from the hook
  useEffect(() => {
    if (error) {
      console.error("Error loading messages:", error);
      setErrorMessage("Failed to load messages. Please try again.");
    } else {
      setErrorMessage(null);
    }
  }, [error]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    bottomScroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Default agent image
  const agentImage = agent.image;

  const sendMessage = async () => {
    if (processingMessage || !inputMessage.current) {
      return;
    }

    const message = inputMessage.current.value.trim();
    if (message === "") {
      return;
    }

    inputMessage.current.value = "";
    setProcessingMessage(true);
    setErrorMessage(null);

    // Scroll to bottom
    bottomScroll.current?.scrollIntoView({ behavior: "smooth" });

    try {
      // Add a message to the agent's queue
      const messagesRef = collection(db, "chats", chatId, "messages");

      await addDoc(messagesRef, {
        chatId: chatId,
        text: message,
        roomId: chatId,
        status: "pending",
        senderType: "user",
        attempts: 0,
        originalMessageId: null,
        createdAt: serverTimestamp(),
        userId: account.isConnected ? account?.account?.address?.toString() : sessionId,
        sessionId: sessionId,
      });
      const apiUrl = `https://sui-cluster.xyz/agents/${agentId}/message`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: message,
          userId: userId,
          roomId: chatId,
          userName: "User",
        }),
      });
      const data = await response.json();
      const parsedData = data[0];
      await addDoc(messagesRef, {
        chatId: chatId,
        text: parsedData.text,
        userId: account.isConnected ? account?.account?.address?.toString() : sessionId,
        roomId: chatId,
        status: "processed",
        createdAt: serverTimestamp(),
        senderType: "agent",
        agentId: parsedData.user,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setErrorMessage(
        "An error occurred while processing your request. Please try again shortly..."
      );
    } finally {
      setProcessingMessage(false);
    }
  };

  const reactToEnterKey = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await sendMessage();
    }
  };
  // Get the display name for the placeholder
  const displayName = (groupName ?? "").split(" ")[0] || "Agent";
  return (
    <Box width="100%" height={"100%"} background="#0C150A" borderRadius="18px">
      <Box
        borderRadius="18px"
        height="100%"
        background="linear-gradient(184.07deg, rgba(84, 203, 104, 0) 50.89%, rgba(175, 220, 41, 0.09) 97.9%)"
        padding="1rem"
      >
        <Flex direction="column" gap="1rem" justify="space-between" height="100%">
          <Flex direction="column" height="90%" overflowY="auto" gap="0.75rem" padding="0.25rem">
            {loading ? (
              <Box textAlign="center" color="#AFDC29" padding="1rem">
                Loading messages...
              </Box>
            ) : messages.length === 0 ? (
              <></>
            ) : (
              messages
                .toReversed()
                .map((entry, index) => (
                  <ChatMessage
                    agentImage={agent.image}
                    key={`${index}-${entry.messageId || ""}`}
                    entry={entry}
                  />
                ))
            )}

            {errorMessage && (
              <Box
                textAlign="center"
                color="#FF6B6B"
                padding="0.5rem"
                background="rgba(255,107,107,0.1)"
                borderRadius="8px"
              >
                {errorMessage}
              </Box>
            )}

            <div ref={bottomScroll}></div>
          </Flex>
          <Box borderRadius="13px" background="#1D3114" padding="0.5rem">
            {processingMessage && <ResponseWaiter agentImage={agentImage} />}
            <Flex justify="space-between">
              <Input
                disabled={processingMessage || loading}
                borderWidth="0px"
                color="#AFDC29"
                css={{ "--focus-color": "transparent", "--focus-ring-color": "transparent" }}
                placeholder={`Message ${displayName}`}
                ref={inputMessage}
                onKeyDown={reactToEnterKey}
                onFocus={onInputFocus}
                onBlur={onInputBlur}
              />
              <Box
                cursor={processingMessage || loading ? "not-allowed" : "pointer"}
                onClick={sendMessage}
                justifyItems="center"
                alignContent="center"
                opacity={processingMessage || loading ? 0.5 : 1}
              >
                <ArrowIcon strokeColor="#AFDC29" />
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}
