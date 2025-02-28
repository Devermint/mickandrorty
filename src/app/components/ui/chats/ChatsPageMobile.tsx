"use client";

import AgentMiniIcons from "@/app/components/ui/agent/AgenMiniIcons";
import AgentChat from "@/app/components/ui/agent/AgentChat";
import { GroupChatAdapter, GroupChatEntry } from "@/app/lib/chat";
import { Box, Button, Container, Flex, Text } from "@chakra-ui/react";
import { useState } from "react";
import { FirebaseGroupChatAdapter } from "@/app/lib/firebase-chat";

export const ChatsPageMobile: React.FC<{
  groupChats: GroupChatEntry[];
  activeChat: number | undefined;
  selectChat: (chat: GroupChatEntry) => void;
}> = ({ groupChats, activeChat, selectChat }) => {
  const images = groupChats.map((groupChat) => {
    return groupChat.icon;
  });
  const [useFirebase, setUseFirebase] = useState<boolean>(true); // Toggle for Firebase

  const onMiniIconClick = (index: number) => {
    selectChat(groupChats[index]);
  };

  // Function to get the appropriate adapter
  const getAdapter = (groupChat: GroupChatEntry) => {
    return useFirebase ? new FirebaseGroupChatAdapter(groupChat) : new GroupChatAdapter(groupChat);
  };

  return (
    <Container justifyItems="center" marginBottom="3rem" height="70vh">
      <Flex height="100%" width="100%" direction="column">
        <Flex alignItems="center" justifyContent="space-between" mb={2}>
          <AgentMiniIcons images={images} activeIndex={activeChat} onClick={onMiniIconClick} />
          <Flex alignItems="center">
            <Text fontSize="xs" color="#A4D03F" mr={2}>
              {useFirebase ? "Firebase" : "Direct"}
            </Text>
            <Button size="sm" colorScheme="green" onChange={() => setUseFirebase(!useFirebase)}>
              {useFirebase ? "Firebase" : "Direct"}
            </Button>
          </Flex>
        </Flex>
        <Box height="80%" marginTop="0.5rem">
          {activeChat !== undefined ? (
            <AgentChat adapter={getAdapter(groupChats[activeChat])} />
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
