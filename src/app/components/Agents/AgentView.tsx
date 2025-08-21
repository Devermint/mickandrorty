"use client";

import Chat from "@/app/components/Chat/Chat";
import type { Agent } from "@/app/types/agent";
import { useState } from "react";
import { ChatEntryProps } from "../Chat/ChatEntry";
import { Grid, GridItem } from "@chakra-ui/react";
import { Chart } from "../Chart/Chart";
import { colorTokens } from "../theme/theme";
import { AgentInfoView } from "./AgentInfoView";
import TradingViewWidget from "../Chart/trading-view-widget";

export type TabKey = "info" | "chart" | "chat";

interface Props {
  agent: Agent;
}
//todo will need to have data for OHLC pricing integrated from backend
// also will need to wire
export const AgentView = ({ agent }: Props) => {
  const [messages, setMessages] = useState<ChatEntryProps[]>([]);

  return (
    <Grid
      templateColumns="repeat(4, 1fr)"
      w="full"
      h="full"
      gap={4}
      pb={4}
      minH={0}
    >
      <GridItem colSpan={1} h="full" minH={0} overflow="hidden">
        <Chat
          agent={agent}
          messages={messages ?? []}
          setMessages={setMessages}
          maxW={800}
          w="100%"
          minH="0"
          bg={colorTokens.blackCustom.a2}
        />
      </GridItem>
      <GridItem colSpan={2}>
        <TradingViewWidget token={agent}></TradingViewWidget>
      </GridItem>
      <GridItem colSpan={1} h="full" minH={0}>
        <AgentInfoView agent={agent}/>
      </GridItem>
    </Grid>
  );
};
