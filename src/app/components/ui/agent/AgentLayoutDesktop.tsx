"use client";

import AgentCard from "@/app/components/ui/agent/AgentCard";
import AgentGraph from "@/app/components/ui/agent/AgentGraph";
import { useAgentStats } from "@/app/hooks/useAgentStats";
import { Agent } from "@/app/lib/agent";
import { AgentDMChatAdapter } from "@/app/lib/chat";
import { db } from "@/app/lib/firebase";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Box, Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import { addDoc, collection, getDocs, serverTimestamp, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import AgentChat from "./AgentChat";
import AgentChatWithAdapter from "./AgentChatWithAdapter";
function GridBox({ children }: { children: React.ReactNode }) {
  return (
    <Box background="#1D3114" borderRadius="16px" width="100%" height="100%" padding="0.5rem">
      {children}
    </Box>
  );
}

function AgentLayoutDesktop({ activeAgent }: { activeAgent: Agent }) {
  const { subscriberCount, messageCount, messageHistory } = useAgentStats(activeAgent.id);
  const account = useWallet();
  const [chatId, setChatId] = useState<string | null>(null);
  const getChatId = async () => {
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("agentId", "==", activeAgent.id),
      where("type", "==", "private"),
      where("userWalletAddress", "==", account.account?.address)
    );
    console.log("before query");
    const querySnapshot = await getDocs(q);
    console.log(querySnapshot.docs, "ha");
    if (!querySnapshot.empty) {
      setChatId(querySnapshot.docs[0].id);
    } else if (account.account?.address) {
      // Create new chat instance if none exists
      const chatDoc = await addDoc(chatsRef, {
        agentId: activeAgent.id,
        type: "private",
        userWalletAddress: account.account.address,
        createdAt: serverTimestamp(),
      });
      setChatId(chatDoc.id);
    }
  };

  useEffect(() => {
    if (account.connected) {
      getChatId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.connected]);
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
        {account.connected && chatId ? (
          <AgentChat chatIdProp={chatId} />
        ) : (
          <AgentChatWithAdapter adapter={new AgentDMChatAdapter(activeAgent)} />
        )}
      </Box>
    </Flex>
  );
}

export default AgentLayoutDesktop;
