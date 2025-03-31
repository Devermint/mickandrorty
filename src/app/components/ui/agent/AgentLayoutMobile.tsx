"use client";

// import AgentGraph from "@/app/components/ui/agent/AgentGraph";
import { useAgentStats } from "@/app/hooks/useAgentStats";
import { Agent } from "@/app/lib/agent";
import { AgentDMChatAdapter } from "@/app/lib/chat";
import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAptosWallet } from "@/app/contexts/AptosWalletContext";
import AgentDirectChat from "./AgentDirectChat";
import AgentChatWithAdapter from "./AgentChatWithAdapter";
import AgentGraph from "./AgentGraph";

// function GridBox({ children }: { children: React.ReactNode }) {
//   return (
//     <Box background="#1D3114" borderRadius="16px" width="100%" height="100%" padding="0.5rem">
//       {children}
//     </Box>
//   );
// }

function AgentLayoutMobile({ activeAgent }: { activeAgent: Agent }) {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { subscriberCount, messageCount, messageHistory } = useAgentStats(activeAgent.id);
  const { account } = useAptosWallet();
  const [showMessages, setShowMessages] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getChatId = async () => {
    if (!account?.address) return;
    setIsLoading(true);
    try {
      // Log the query parameters for debugging
      console.log("Query params:", {
        agentId: activeAgent.id,
        userWalletAddress: account.address,
      });

      const chatsRef = collection(db, "chats");
      // Ensure the address is a string
      const userAddress = String(account.address);

      const q = query(
        chatsRef,
        where("agentId", "==", activeAgent.id),
        where("type", "==", "private"),
        where("userWalletAddress", "==", userAddress)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setChatId(querySnapshot.docs[0].id);
      } else {
        const chatDoc = await addDoc(chatsRef, {
          agentId: activeAgent.id,
          type: "private",
          userWalletAddress: userAddress,
          createdAt: serverTimestamp(),
        });
        setChatId(chatDoc.id);
      }
    } catch (error) {
      console.error("Error fetching chat details:", {
        error,
        agentId: activeAgent.id,
        userAddress: account.address,
      });
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (account?.address) {
      getChatId();
    }
  }, [account?.address]);

  return (
    <Flex height="68dvh" direction="column">
      {!isInputFocused && (
        <>
          {!showMessages && (
            <Flex height="30dvh" width="100%">
              <AgentGraph data={messageHistory} />
            </Flex>
          )}
          <Flex gap="1rem" px="1rem" justifyContent="center">
            <Button
              alignItems="center"
              justifyContent="center"
              background="#0A1C12"
              borderRadius="16px"
              padding="0.5rem"
              height="100%"
              onClick={() => setShowMessages((e) => !e)}
            >
              <Text
                textDecoration="underline"
                fontWeight="500"
                fontSize="14px"
                lineHeight="21px"
                color="#FFFFFF"
              >
                Messages
              </Text>
            </Button>
            <Text background="#1D3114" borderRadius="16px" padding="0.5rem" width="50%">
              <Text fontWeight="700" fontSize="24px" lineHeight="41px">
                {messageCount}
              </Text>
              <Text fontWeight="500" fontSize="14px" lineHeight="21px" color="#FFFFFF">
                Messages
              </Text>
            </Text>
            <Box background="#1D3114" borderRadius="16px" padding="0.5rem" width="50%">
              <Text fontWeight="700" fontSize="24px" lineHeight="41px">
                {subscriberCount}
              </Text>
              <Text fontWeight="500" fontSize="14px" lineHeight="21px" color="#FFFFFF">
                Subscribers
              </Text>
            </Box>
          </Flex>
        </>
      )}
      {showMessages && (
        <Box
          height={isInputFocused ? "70dvh" : "50dvh"}
          maxHeight={isInputFocused ? "60dvh" : "60dvh"}
          padding="0.5rem"
          pb="1rem"
        >
          {isLoading ? (
            <Flex height="100%" alignItems="center" justifyContent="center">
              <Text>Loading chat...</Text>
            </Flex>
          ) : account?.address && chatId ? (
            <AgentDirectChat
              agent={activeAgent}
              chatIdProp={chatId}
              agentId={activeAgent.id}
              onInputFocus={() => setIsInputFocused(true)}
              onInputBlur={() => setIsInputFocused(false)}
            />
          ) : (
            <AgentChatWithAdapter
              adapter={new AgentDMChatAdapter(activeAgent)}
              onInputFocus={() => setIsInputFocused(true)}
              onInputBlur={() => setIsInputFocused(false)}
            />
          )}
        </Box>
      )}
    </Flex>
  );
}

export default AgentLayoutMobile;
