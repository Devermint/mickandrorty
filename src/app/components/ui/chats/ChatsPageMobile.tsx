"use client";

import AgentMiniIcons from "@/app/components/ui/agent/AgenMiniIcons";
import AgentChat from "@/app/components/ui/agent/AgentChat";
import { ChatAdapter, GroupChatEntry } from "@/app/lib/chat";
import { db } from "@/app/lib/firebase";
import { Box, Container, Flex, Spinner, Text, VStack } from "@chakra-ui/react";
import { collection, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

type IQueuedMessage = {
  id: string;
  agentId: string;
  agentName: string;
  createdAt: Timestamp;
  status: string;
  senderType: string;
  content: string;
};

export const ChatsPageMobile: React.FC<{
  groupChats: GroupChatEntry[];
  activeChat: number | undefined;
  selectChat: (chat: GroupChatEntry) => void;
}> = ({ groupChats, activeChat, selectChat }) => {
  const [queuedMessages, setQueuedMessages] = useState<IQueuedMessage[]>([]);
  const [totalQueue, setTotalQueue] = useState<number>(0);
  const [isLoadingQueue, setIsLoadingQueue] = useState<boolean>(false);
  const [showQueue, setShowQueue] = useState<boolean>(false);

  const unsubscribeRef = useRef<(() => void) | null>(null);
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

  const images = groupChats.map((groupChat) => {
    return groupChat.icon;
  });

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
          };
        });

        setQueuedMessages(agentMessages.toReversed());
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
        console.log(`Unsubscribing from agent ${agentId} queue`);
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [activeChat, groupChats.length]);

  return (
    <Container justifyItems="center" marginBottom="3rem" height="70vh">
      <Flex height="100%" width="100%" direction="column">
        <Flex alignItems="center" justifyContent="space-between">
          <AgentMiniIcons images={images} activeIndex={activeChat} onClick={onMiniIconClick} />
          {activeChat !== undefined && (
            <Text
              color="#AFDC29"
              fontSize="14px"
              onClick={() => setShowQueue(!showQueue)}
              cursor="pointer"
            >
              Queue: {totalQueue}
            </Text>
          )}
        </Flex>
        <Box height="80%" marginTop="0.5rem">
          {activeChat !== undefined ? (
            showQueue ? (
              <Box
                background="#0C150A"
                overflowY="auto"
                borderRadius="18px"
                padding="1rem"
                height="100%"
              >
                <Flex alignItems="center" justifyContent="space-between" mb={3}>
                  <Text color="#FFFFFF" fontSize="16px" fontWeight="500">
                    Message Queue
                  </Text>
                  {isLoadingQueue && <Spinner size="sm" color="#AFDC29" />}
                </Flex>

                <VStack gap="0.5rem" alignItems="stretch">
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
                      >
                        <Flex alignItems="center" gap="0.75rem">
                          <Box
                            width="32px"
                            height="32px"
                            borderRadius="full"
                            background="#030B0A"
                          />
                          <Text
                            color="#FFFFFF"
                            fontSize="14px"
                            fontWeight="500"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            whiteSpace="nowrap"
                          >
                            {message.senderType === "user" ? "User" : message.agentName}
                          </Text>
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
            ) : (
              <AgentChat
                groupId={groupChats[activeChat].id.toString()}
                groupName={groupChats[activeChat].name}
              />
            )
          ) : (
            <Box width="100%" height="100%" background="#0C150A" borderRadius="18px">
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
            </Box>
          )}
        </Box>
      </Flex>
    </Container>
  );
};
