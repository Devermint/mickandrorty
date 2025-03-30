"use client";

import AgentChat from "@/app/components/ui/agent/AgentChat";
import ActivityStats from "@/app/components/ui/chats/ActivityStats";
import GroupChatButton from "@/app/components/ui/chats/GroupChatButton";
import { useAptosWallet } from "@/app/contexts/AptosWalletContext";
import { ChatAdapter, GroupChatEntry } from "@/app/lib/chat";
import { db } from "@/app/lib/firebase";
import { getOrCreateSessionId } from "@/app/lib/sessionManager";
import { Box, Button, Container, Flex, Spinner, Text, VStack } from "@chakra-ui/react";
import { collection, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";

type IQueuedMessage = {
  id: string;
  agentId: string;
  agentName: string;
  createdAt: Timestamp;
  status: string;
  senderType: string;
  content: string;
};

export default function ChatsPageDesktop({
  groupChats,
  activeChat,
  selectChat,
}: {
  groupChats: GroupChatEntry[];
  activeChat: number | undefined;
  selectChat: (chat: GroupChatEntry) => void;
}) {
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [queuedMessages, setQueuedMessages] = useState<IQueuedMessage[]>([]);
  const [totalQueue, setTotalQueue] = useState<number>(0);
  const [isLoadingQueue, setIsLoadingQueue] = useState<boolean>(false);
  const [myMessageIds, setMyMessageIds] = useState<Set<string>>(new Set());
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const { account } = useAptosWallet(); // Reference to store the current unsubscribe function
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const sessionId = useMemo(() => getOrCreateSessionId(), []);
  // Create a cache for adapters to avoid recreating them
  const adaptersCache = useRef<Map<string, ChatAdapter>>(new Map());

  // When useFirebase changes, clear the adapter cache
  useEffect(() => {
    // Clean up existing adapters
    adaptersCache.current.forEach((adapter) => {
      if (adapter && "disconnect" in adapter && adapter.disconnect) {
        adapter.disconnect();
      }
    });

    // Clear the cache
    adaptersCache.current.clear();
  }, []);

  // Subscribe to the active agent's queue
  useEffect(() => {
    if (activeChat === undefined) {
      // Clear the queue if we're not using Firebase or no chat is selected
      setQueuedMessages([]);
      return;
    }

    // Clean up previous subscription if it exists
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const activeGroupChat = groupChats[activeChat];
    if (!activeGroupChat) return;

    const agentId = activeGroupChat.id.toString();

    setIsLoadingQueue(true);
    const agentQueueRef = collection(db, "agentQueues", agentId, "messages");
    const q = query(agentQueueRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setIsLoadingQueue(false);

        const agentMessages = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            agentId: agentId,
            agentName: activeGroupChat.name,
            createdAt: data.createdAt,
            status: data.status,
            content: data.content,
            senderType: data.senderType,
            userId: data.userId,
          };
        });

        // Update myMessageIds based on sessionId
        setMyMessageIds((prev) => {
          const newSet = new Set(prev);
          for (const msg of agentMessages) {
            if (msg.userId === account?.address?.toString() || msg.userId === sessionId) {
              newSet.add(msg.id);
            }
          }
          return newSet;
        });

        setQueuedMessages(agentMessages.toReversed());

        // Update total queue count - only count pending messages
        const pendingCount = agentMessages.filter((msg) => msg.status === "pending").length;
        setTotalQueue(pendingCount);
      },
      (error) => {
        console.error(`Error in agent ${agentId} queue listener:`, error);
        setIsLoadingQueue(false);
      }
    );

    // Store the unsubscribe function for cleanup
    unsubscribeRef.current = unsubscribe;

    // Clean up when component unmounts or when activeChat changes
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [activeChat, groupChats.length]);

  // Add a function to handle joining a public chat
  const joinPublicChat = async (groupChat: GroupChatEntry) => {
    selectChat(groupChat);
    // You could also add logic here to mark the user as "joined" to the chat
    // or perform other initialization for public chat participation
  };

  const trackNewMessage = (messageId: string) => {
    setMyMessageIds((prev) => new Set(prev).add(messageId));
  };
  // Add scroll function
  const scrollToMyMessage = () => {
    if (!messageContainerRef.current) return;

    const myMessage = queuedMessages.find((msg) => myMessageIds.has(msg.id));
    if (!myMessage) return;

    const messageElement = messageContainerRef.current.querySelector(
      `[data-message-id="${myMessage.id}"]`
    );
    messageElement?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <Container justifyItems="center" marginBottom="3rem" height="75vh">
      <Flex padding="2rem" height="100%" width="100%" gap="1rem">
        <Flex direction="column" gap={3} borderRadius="18px">
          <ActivityStats />
          <VStack
            alignItems="flex-start"
            background="#0C150A"
            borderRadius="18px"
            padding="1rem"
            gap="0.5rem"
          >
            <Text color="#FFFFFF" fontSize="16px" fontWeight="500" marginBottom="1rem">
              Agents
            </Text>
            {groupChats.map((groupChat, index) => (
              <GroupChatButton
                key={index}
                entry={groupChat}
                activeChat={activeChat}
                onClick={activeTab === "all" ? joinPublicChat : selectChat}
              />
            ))}
          </VStack>
        </Flex>

        {/* Middle Section - Chat */}
        <Box flex="1" minWidth="0" display="flex" flexDirection="column" gap="8px">
          <Flex>
            <Flex direction="row" gap="1rem" marginBottom="8px">
              <Button
                background={activeTab === "all" ? "#1D3114" : "transparent"}
                backdropFilter="blur(11.8px)"
                border="0"
                borderRadius="8px"
                color="#AFDC29"
                onClick={() => setActiveTab("all")}
              >
                All messages
              </Button>
              <Button
                background={activeTab === "my" ? "#1D3114" : "transparent"}
                backdropFilter="blur(11.8px)"
                border="0"
                borderRadius="8px"
                color="#AFDC29"
                onClick={() => setActiveTab("my")}
              >
                My messages
              </Button>
            </Flex>
            <Flex minW="300px" gap="0.5rem" marginLeft="auto">
              <Text color="textGray" fontSize="16px" fontWeight="500">
                Total queue:
              </Text>
              <Text color="#AFDC29" fontSize="16px" fontWeight="500">
                {totalQueue}
              </Text>
              {/* Toggle for Firebase */}
              {/* <Button
                size="xs"
                background={useFirebase ? "#1D3114" : "transparent"}
                color="#AFDC29"
                onClick={() => setUseFirebase(!useFirebase)}
                ml={4}
              >
                {useFirebase ? "Firebase" : "Direct"}
              </Button> */}
            </Flex>
          </Flex>
          <Flex gap="1rem" height="100%">
            <Box flex="1" background="#0C150A" borderRadius="18px">
              {activeChat !== undefined ? (
                <AgentChat
                  groupId={groupChats[activeChat].id.toString()}
                  groupName={groupChats[activeChat].name}
                  showMyMessages={activeTab === "my"}
                  onMessageSent={trackNewMessage}
                />
              ) : (
                <Box
                  borderRadius="18px"
                  height="100%"
                  background="linear-gradient(184.07deg, rgba(84, 203, 104, 0) 50.89%, rgba(175, 220, 41, 0.09) 97.9%)"
                  padding="1rem"
                >
                  <Text
                    position="relative"
                    right="0"
                    left="0"
                    marginInline="auto"
                    width="fit-content"
                    top="50%"
                  >
                    Select a chat to begin...
                  </Text>
                </Box>
              )}
            </Box>
            {/* Queue section - Updated to show message queue with loading indicator */}
            <Box
              ref={messageContainerRef}
              background="#0C150A"
              overflowY="auto"
              borderRadius="18px"
              padding="1rem"
              width="300px"
            >
              <Flex alignItems="center" justifyContent="space-between" mb={3}>
                <Text color="#FFFFFF" fontSize="16px" fontWeight="500">
                  Message Queue
                </Text>
                <Flex gap={2} alignItems="center">
                  {isLoadingQueue && <Spinner size="sm" color="#AFDC29" />}
                  <Text
                    color="#AFDC29"
                    fontSize="12px"
                    cursor="pointer"
                    onClick={scrollToMyMessage}
                    textDecoration="underline"
                  >
                    Scroll to your message
                  </Text>
                </Flex>
              </Flex>

              <VStack pr={2} gap="0.5rem" maxHeight="calc(100vh - 200px)" alignItems="stretch">
                {isLoadingQueue && queuedMessages.length === 0 ? (
                  <Flex justifyContent="center" alignItems="center" height="100px">
                    <Text color="#FFFFFF" fontSize="14px" textAlign="center">
                      Loading queue...
                    </Text>
                  </Flex>
                ) : queuedMessages.length > 0 ? (
                  queuedMessages.map((message) => (
                    <Box
                      key={message.id}
                      data-message-id={message.id}
                      width="100%"
                      background={
                        message.status === "pending"
                          ? "#1D3114"
                          : message.status === "processing"
                          ? "#2D2D11"
                          : message.status === "completed"
                          ? "#112D21"
                          : message.status === "error"
                          ? "#2D1111"
                          : "#1D3114"
                      }
                      borderRadius="12px"
                      padding="1rem"
                      display="flex"
                      flexDirection="column"
                      gap="0.5rem"
                      borderWidth="1px"
                      borderColor={myMessageIds.has(message.id) ? "#DCAF29" : "transparent"}
                    >
                      <Flex alignItems="center" gap="0.75rem">
                        <Box width="32px" height="32px" borderRadius="full" background="#030B0A" />
                        <Text
                          color="#FFFFFF"
                          fontSize="14px"
                          fontWeight="500"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                          mr="auto"
                        >
                          {message.senderType === "user" ? "User" : "User"}
                        </Text>
                        {myMessageIds.has(message.id) && message.status === "pending" && (
                          <Text
                            color="#DCAF29"
                            fontSize="12px"
                            background="#2D2D11"
                            padding="2px 8px"
                            borderRadius="4px"
                          >
                            Position:{" "}
                            {queuedMessages
                              .filter((msg) => msg.status === "pending")
                              .findIndex((msg) => msg.id === message.id) + 1}
                          </Text>
                        )}
                      </Flex>
                      <Text
                        color="#AFDC29"
                        fontSize="12px"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {message.content?.substring(0, 50)}
                        {message.content?.length > 50 ? "..." : ""}
                      </Text>
                      <Flex justifyContent="space-between" alignItems="center">
                        <Text color="#FFFFFF" fontSize="10px" opacity={0.6}>
                          {message.createdAt?.toDate
                            ? new Date(message.createdAt.toDate()).toLocaleTimeString()
                            : "Pending"}
                        </Text>
                        <Text
                          color={
                            message.status === "pending"
                              ? "#AFDC29"
                              : message.status === "processing"
                              ? "#DCAF29"
                              : message.status === "completed"
                              ? "#29DCAF"
                              : message.status === "error"
                              ? "#DC2929"
                              : "#FFFFFF"
                          }
                          fontSize="10px"
                          background="#2D4121"
                          borderRadius="4px"
                          padding="2px 6px"
                        >
                          {message.status}
                        </Text>
                      </Flex>
                    </Box>
                  ))
                ) : (
                  <Text color="#FFFFFF" fontSize="14px" textAlign="center" mt={4}>
                    No messages in queue
                  </Text>
                )}
              </VStack>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Container>
  );
}
