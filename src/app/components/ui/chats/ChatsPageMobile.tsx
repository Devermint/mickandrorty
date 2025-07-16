"use client";

import AgentMiniIcons from "@/app/components/ui/agent/AgenMiniIcons";
import AgentChat from "@/app/components/ui/agent/AgentChat";
import { ChatAdapter, GroupChatEntry } from "@/app/lib/chat";
import { db } from "@/app/lib/firebase";
import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { collection, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { useEffect, useRef, useState, useMemo } from "react";
import { getOrCreateSessionId } from "@/app/lib/sessionManager";
import { useAptosWallet } from "@/app/contexts/AptosWalletContext";

type IQueuedMessage = {
  id: string;
  agentId: string;
  agentName: string;
  createdAt: Timestamp;
  status: string;
  senderType: string;
  content: string;
  sessionId?: string;
};

export const ChatsPageMobile: React.FC<{
  groupChats: GroupChatEntry[];
  activeChat: number | undefined;
  selectChat: (chat: GroupChatEntry) => void;
}> = ({ groupChats, activeChat, selectChat }) => {
  const { account } = useAptosWallet();
  const [queuedMessages, setQueuedMessages] = useState<IQueuedMessage[]>([]);
  const [totalQueue, setTotalQueue] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [myMessageIds, setMyMessageIds] = useState<Set<string>>(new Set());
  const sessionId = useMemo(() => getOrCreateSessionId(), []);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const adaptersCache = useRef<Map<string, ChatAdapter>>(new Map());

  // Add messageContainerRef
  const messageContainerRef = useRef<HTMLDivElement>(null);

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

  // Memoize the images array to prevent unnecessary re-renders
  const images = useMemo(() => groupChats.map((groupChat) => groupChat.icon), [groupChats]);

  const onMiniIconClick = (index: number) => {
    selectChat(groupChats[index]);
  };

  // Function to get the appropriate adapter
  // const getAdapter = (groupChat: GroupChatEntry) => {
  //   return new FirebaseGroupChatAdapter(groupChat);
  // };

  // Subscribe to the active agent's queue
  useEffect(() => {
    if (activeChat === undefined) {
      setQueuedMessages([]);
      return;
    }

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const activeGroupChat = groupChats[activeChat];
    if (!activeGroupChat) return;

    const agentId = activeGroupChat.id.toString();

    const agentQueueRef = collection(db, "agentQueues", agentId, "messages");
    const q = query(agentQueueRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
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
        const pendingCount = agentMessages.filter((msg) => msg.status === "pending").length;
        setTotalQueue(pendingCount);
      },
      (error) => {
        console.error(`Error in agent ${agentId} queue listener:`, error);
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
  }, [activeChat, groupChats.length, sessionId]);

  // Add function to track new messages
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

  // Filter messages based on active tab
  // const filteredMessages =
  //   activeTab === "all"
  //     ? queuedMessages
  //     : queuedMessages.filter((msg) => msg.senderType === "user");
  return (
    <Flex px={4} height="81dvh" direction="column">
      <AgentMiniIcons images={images} activeIndex={activeChat} onClick={onMiniIconClick} />

      <Box flex="1" marginTop="0.5rem" display="flex" flexDirection="column" overflow="hidden">
        {/* Queue Messages Section */}
        <Box
          border="1px solid #11331D"
          background="#0C150A"
          borderRadius="18px"
          position="relative"
          mb="0.5rem"
          maxHeight="23dvh"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          {/* Sticky Header */}
          <Box
            position="sticky"
            top="0"
            zIndex="1"
            padding="0.5rem"
            background="#0C150A"
            borderTopRadius="18px"
          >
            <Text
              position="absolute"
              right="1"
              top="1"
              color="#AFDC29"
              backdropFilter="blur(11.8px)"
              border="1px solid #AFDC29"
              borderRadius="8px"
              background="#11331D"
              padding="0.5rem"
              fontSize="12px"
              textAlign="right"
            >
              Total queue {totalQueue}
            </Text>
            <Text
              right="4"
              top="2"
              pl="0.5rem"
              fontSize="12px"
              borderRadius="8px"
              textDecoration="underline"
              cursor="pointer"
              onClick={scrollToMyMessage}
            >
              Scroll to your message
            </Text>
          </Box>

          {/* Scrollable Content */}
          <Box ref={messageContainerRef} overflowY="auto" flex="1" padding="4" paddingTop="0">
            {queuedMessages.map((message) => {
              const isMyMessage = myMessageIds.has(message.id);
              const queuePosition =
                queuedMessages
                  .filter((msg) => msg.status === "pending")
                  .findIndex((msg) => msg.id === message.id) + 1;

              return (
                <Box
                  key={message.id}
                  data-message-id={message.id}
                  width="100%"
                  background={isMyMessage ? "#1D2614" : "#1D3114"}
                  borderRadius="12px"
                  padding="0.75rem"
                  marginBottom="0.5rem"
                  borderWidth="1px"
                  borderColor={isMyMessage ? "#DCAF29" : "transparent"}
                >
                  <Flex direction="column" gap="0.5rem">
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text
                        color={isMyMessage ? "#DCAF29" : "#AFDC29"}
                        fontSize="12px"
                        fontWeight="500"
                      >
                        {isMyMessage ? "Your message" : "Queued message"}
                      </Text>

                      <Text
                        color={
                          message.status === "pending"
                            ? "#DCAF29"
                            : message.status === "processing"
                            ? "#DCAF29"
                            : message.status === "completed"
                            ? "#29DCAF"
                            : message.status === "error"
                            ? "#DC2929"
                            : "#FFFFFF"
                        }
                        fontSize="12px"
                        background="#2D4121"
                        borderRadius="4px"
                        padding="2px 8px"
                      >
                        {message.status}
                      </Text>
                    </Flex>
                  </Flex>
                  <Flex direction="row" pt="1" gap="0.5rem">
                    <Text color="#FFFFFF" fontSize="14px" mr="auto">
                      {message.content?.substring(0, 50)}
                      {message.content?.length > 50 ? "..." : ""}
                    </Text>
                    {isMyMessage && message.status === "pending" && (
                      <Text
                        color="#DCAF29"
                        fontSize="12px"
                        background="#2D2D11"
                        padding="2px 8px"
                        borderRadius="4px"
                      >
                        Queue position: {queuePosition}
                      </Text>
                    )}
                  </Flex>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Tabs Section */}
        <Flex gap="1rem" py="1">
          <Button
            flex="1"
            background={activeTab === "all" ? "#1D3114" : "transparent"}
            color="#AFDC29"
            onClick={() => setActiveTab("all")}
            _hover={{ background: "#1D3114" }}
            border="none"
            borderRadius="8px"
            height="30px"
          >
            All messages
          </Button>
          <Button
            flex="1"
            background={activeTab === "my" ? "#1D3114" : "transparent"}
            color="#AFDC29"
            onClick={() => setActiveTab("my")}
            _hover={{ background: "#1D3114" }}
            border="none"
            borderRadius="8px"
            height="30px"
          >
            My messages
          </Button>
        </Flex>

        {/* Chat Section */}
        <Box flex="1" borderRadius="18px" overflow="hidden" display="flex" flexDirection="column">
          {activeChat !== undefined ? (
            <AgentChat
              groupId={groupChats[activeChat].id.toString()}
              groupName={groupChats[activeChat].name}
              onMessageSent={trackNewMessage}
              showMyMessages={activeTab === "my"}
            />
          ) : (
            <Box flex="1" display="flex" alignItems="center" justifyContent="center">
              <Text>Select a chat to begin...</Text>
            </Box>
          )}
        </Box>
      </Box>
    </Flex>
  );
};
