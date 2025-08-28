"use client";
import { AgentCarousel } from "@/app/components/Agents/AgentCarousel";
import { Box, Flex, Spacer, Spinner, Text } from "@chakra-ui/react";
import { useRef, useState, useEffect, SetStateAction } from "react";
import { AgentInput } from "@/app/components/Agents/AgentInput";
import { useRouter } from "next/navigation";
import { useAgents } from "@/app/hooks/useAgents";
import { colorTokens } from "../theme/theme";
import Chat from "../Chat/Chat";
import { ChatEntryProps } from "@/app/types/message";
import { AgentType } from "@/app/types/agent";

export default function Agents() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const { data: agents = [], isLoading, isError } = useAgents();
  const [messages, setMessages] = useState<ChatEntryProps[]>([]);

  const [activeId, setActiveId] = useState<string | null>(null);

  // set initial activeId once agents are loaded
  useEffect(() => {
    if (!agents.length) return;
    if (!activeId || !agents.some((a) => a.fa_id === activeId)) {
      const first = agents.find((a) => !!a.fa_id)?.fa_id ?? null;
      setActiveId(first);
    }
  }, [agents, activeId]);

  const handleSend = () => {
    const text = textareaRef.current?.value.trim();
    if (!text) return;

    const selectedAgent = agents.find((x) => x.fa_id === activeId);
    if (!selectedAgent?.fa_id) return;

    router.push(
      `/agent/${selectedAgent.fa_id}?message=${encodeURIComponent(
        text
      )}&defaultTab=chat`
    );
  };

  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      mt={{ base: 5, md: 5 }}
      pb={{ base: 2, md: 10 }}
      zIndex={1}
      overflow={{ base: "hidden", md: "visible" }}
      flex={1}
      minH={0}
    >
      {isLoading && (
        <Flex
          justify="center"
          mb={4}
          flex={1}
          direction="column"
          align="center"
          minH="70%"
        >
          <Spacer />
          <Spinner size="xl" color={colorTokens.green.erin} />
          <Spacer />
        </Flex>
      )}
      {/* <Box
        h="100%"
        alignItems="center"
        maxW={{ base: "100%", md: 750 }}
        overflow={{ base: "hidden", md: "visible" }}
        border="1px solid red"
      > */}
      {/* {isError && (
          <Text color="red.400" mb={2}>
            Failed to load agents.
          </Text>
        )} */}

      {/* {agents.length > 0 && (
          <>
            <AgentCarousel
              agents={agents}
              activeId={activeId}
              setActiveId={setActiveId}
            />
            <AgentInput
              mt={100}
              h={100}
              p={0}
              mx={2}
              inputRef={textareaRef}
              onButtonClick={handleSend}
            />
          </>
        )} */}
      {!isLoading && (
        <Flex direction="column" h="100%">
          <Text
            textAlign="center"
            fontFamily="Sora"
            fontSize={{ base: "3rem", md: "5rem" }}
            lineHeight={1}
            css={{
              background:
                "linear-gradient(to bottom, #FFFFFF 0%, #646363ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            CREATE AI AGENT
          </Text>
          <Text textAlign="center" fontSize={{ base: "0.6rem", md: "1rem" }}>
            Chat with Agent to proceed creation of your own Ai agent
          </Text>
          <Chat
            agent={{
              wallet: undefined,
              fa_id: undefined,
              agent_symbol: undefined,
              agent_name: undefined,
              agent_icon_url: undefined,
              decimals: undefined,
              tx_hash: undefined,
              status: undefined,
              created: undefined,
              updated: undefined,
              id: undefined,
              type: undefined,
              tag: undefined,
              liquidity_usd: undefined,
              mcap_usd: undefined,
              pair_address: undefined,
              price_apt: undefined,
              price_usd: undefined,
              reserves: {
                agent_decimals: undefined,
                agent_raw: undefined,
                apt_decimals: undefined,
                apt_raw: undefined,
              },
              agent_type: AgentType.AgentCreator,
            }}
            chatName="Aptos Agent"
            messages={messages}
            setMessages={setMessages}
            enableGroupChat={false}
            mt={{ base: 4, md: 10 }}
            overflow="hidden"
            pt={{ base: 5, md: 0 }}
          />
        </Flex>
      )}
    </Flex>
  );
}
