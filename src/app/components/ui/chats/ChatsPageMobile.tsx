"use client";

import AgentMiniIcons from "@/app/components/ui/agent/AgenMiniIcons";
import AgentChat from "@/app/components/ui/agent/AgentChat";
import { ChatAdapter, GroupChatEntry } from "@/app/lib/chat";
import { db } from "@/app/lib/firebase";
import { Box, Flex, Text, Button } from "@chakra-ui/react";
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
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");

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
          };
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
  }, [activeChat, groupChats.length]);

  // Filter messages based on active tab
  // const filteredMessages =
  //   activeTab === "all"
  //     ? queuedMessages
  //     : queuedMessages.filter((msg) => msg.senderType === "user");
  console.log(queuedMessages, "queuedMessages");
  return (
    <Flex px={4} overflowY="auto" justifyItems="center" height="76dvh">
      <Flex height="100%" width="100%" direction="column">
        <AgentMiniIcons images={images} activeIndex={activeChat} onClick={onMiniIconClick} />

        <Box height="80%" marginTop="0.5rem">
          <Box borderRadius="18px" height="100%">
            {/* Queue Messages Section */}
            <Box
              border="1px solid #11331D"
              background="#0C150A"
              borderRadius="18px"
              position="relative"
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
                  right="2"
                  top="2"
                  color="#AFDC29"
                  backdropFilter="blur(11.8px)"
                  border="1px solid #AFDC29"
                  borderRadius="8px"
                  background="#11331D"
                  padding="0.5rem"
                  fontSize="14px"
                  textAlign="right"
                >
                  Total queue {totalQueue}
                </Text>
              </Box>

              {/* Scrollable Content */}
              <Box overflowY="auto" maxHeight="20dvh" padding="4" paddingTop="0">
                {queuedMessages.map((message) => (
                  <Box
                    key={message.id}
                    width="100%"
                    background="#1D3114"
                    borderRadius="12px"
                    padding="0.75rem"
                    marginBottom="0.5rem"
                  >
                    <Text color="#FFFFFF" fontSize="14px">
                      {message.content?.substring(0, 50)}
                      {message.content?.length > 50 ? "..." : ""}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Tabs Section */}
            <Flex gap="1rem" marginTop="1rem" marginBottom="1rem">
              <Button
                flex="1"
                background={activeTab === "all" ? "#1D3114" : "transparent"}
                color="#AFDC29"
                onClick={() => setActiveTab("all")}
                _hover={{ background: "#1D3114" }}
                border="none"
                borderRadius="8px"
                height="40px"
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
                height="40px"
              >
                My messages
              </Button>
            </Flex>

            {/* Chat Section */}
            {activeChat !== undefined ? (
              <Flex flex="1" maxHeight="35dvh" borderRadius="18px" overflowY="auto">
                <AgentChat
                  groupId={groupChats[activeChat].id.toString()}
                  groupName={groupChats[activeChat].name}
                />
              </Flex>
            ) : (
              <Box flex="1">
                <Text>Select a chat to begin...</Text>
              </Box>
            )}
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};
