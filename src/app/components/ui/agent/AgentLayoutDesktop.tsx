"use client";

import AgentCard from "@/app/components/ui/agent/AgentCard";
import AgentGraph from "@/app/components/ui/agent/AgentGraph";
import { useAptosWallet } from "@/app/contexts/AptosWalletContext";
import { useAgentStats } from "@/app/hooks/useAgentStats";
import { Agent } from "@/app/lib/agent";
import { AgentDMChatAdapter } from "@/app/lib/chat";
import { db } from "@/app/lib/firebase";
import { Box, Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import AgentChatWithAdapter from "./AgentChatWithAdapter";
import AgentDirectChat from "./AgentDirectChat";
function GridBox({ children }: { children: React.ReactNode }) {
  return (
    <Box background="#1D3114" borderRadius="16px" width="100%" height="100%" padding="0.5rem">
      {children}
    </Box>
  );
}

function AgentLayoutDesktop({ activeAgent }: { activeAgent: Agent }) {
  const { subscriberCount, messageCount, messageHistory } = useAgentStats(activeAgent.id);
  const { account } = useAptosWallet();
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const getChatId = async () => {
    if (!account) return;
    setIsLoading(true);
    try {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("agentId", "==", activeAgent.id),
        where("type", "==", "private"),
        where("userWalletAddress", "==", account?.address)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setChatId(querySnapshot.docs[0].id);
      } else if (account?.address) {
        // Create new chat instance if none exists
        const chatDoc = await addDoc(chatsRef, {
          agentId: activeAgent.id,
          type: "private",
          userWalletAddress: account.address,
          createdAt: serverTimestamp(),
        });
        setChatId(chatDoc.id);
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (account?.address) {
      getChatId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.address]);
  return (
    <Flex paddingLeft="2rem" justifyContent="center" paddingRight="2rem" height="508px">
      <AgentCard {...activeAgent} />
      <Box marginLeft="2rem" marginRight="2rem" position="relative" alignItems="center">
        <Grid
          height="100%"
          width="100%"
          templateRows="repeat(5, 1fr)"
          templateColumns="repeat(5, 1fr)"
          gap="0.5rem"
        >
          <GridItem>
            <GridBox>
              <Box justifyItems="center" alignContent="center" height="100%">
                <Text fontWeight="400" fontSize="16px" lineHeight="24px">
                  Messages
                </Text>
              </Box>
            </GridBox>
          </GridItem>
          <GridItem colSpan={2}>
            <GridBox>
              <Text fontWeight="700" fontSize="32px" lineHeight="41px">
                {messageCount}
              </Text>
              <Text fontWeight="500" fontSize="16px" lineHeight="21px" color="#FFFFFF">
                Messages
              </Text>
            </GridBox>
          </GridItem>
          <GridItem colSpan={2}>
            <GridBox>
              <Text fontWeight="700" fontSize="32px" lineHeight="41px">
                {subscriberCount}
              </Text>
              <Text fontWeight="500" fontSize="16px" lineHeight="21px" color="#FFFFFF">
                Subscribers
              </Text>
            </GridBox>
          </GridItem>
          <GridItem colSpan={5} rowSpan={4}>
            <AgentGraph data={messageHistory} />
          </GridItem>
        </Grid>
      </Box>
      <Box width="30%">
        {isLoading ? (
          <GridBox>
            <Flex height="100%" alignItems="center" justifyContent="center">
              <Text>Loading chat...</Text>
            </Flex>
          </GridBox>
        ) : account?.address && chatId ? (
          <AgentDirectChat agent={activeAgent} chatIdProp={chatId} agentId={activeAgent.id} />
        ) : (
          <AgentChatWithAdapter
            adapter={new AgentDMChatAdapter(activeAgent)}
            onInputFocus={() => {}}
            onInputBlur={() => {}}
          />
        )}
      </Box>
    </Flex>
  );
}

export default AgentLayoutDesktop;
