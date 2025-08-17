"use client";

import Chat from "@/app/components/Chat/Chat";
import type { Agent } from "@/app/types/agent";
import { useState } from "react";
import { ChatEntryProps } from "../Chat/ChatEntry";
import { Grid, GridItem } from "@chakra-ui/react";
import { Chart } from "../Chart/Chart";
import { MobileAgentInfoView } from "./AgentInfoView";
import { colorTokens } from "../theme/theme";

export type TabKey = "info" | "chart" | "chat";

interface Props {
  agent: Agent;
}

export const AgentView = ({ agent }: Props) => {
  const [messages, setMessages] = useState<ChatEntryProps[]>([]);

  return (
    <Grid templateColumns="repeat(4, 1fr)" w="100%" gap={4} pb={4} px={4}>
      <GridItem colSpan={1}>
        <Chat
          agent={agent}
          messages={messages ?? []}
          setMessages={setMessages}
          maxW={800}
          w="100%"
          bg={colorTokens.blackCustom.a2}
        />
      </GridItem>
      <GridItem colSpan={2}>
        <Chart borderRadius={22} bg={colorTokens.blackCustom.a2} />
      </GridItem>
      <GridItem colSpan={1}>
        <MobileAgentInfoView agent={agent} />
      </GridItem>
    </Grid>
  );
};
