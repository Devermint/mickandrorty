"use client";

import { Box, Icon, Tabs, Flex } from "@chakra-ui/react";
import Chat from "@/app/components/Chat/Chat";
import type { Agent } from "@/app/types/agent";
import { InfoIcon } from "../icons/info";
import { ChartIcon } from "../icons/chart";
import { ChatIcon } from "../icons/chat";
import { colorTokens } from "../theme/theme";
import { AgentInfoView } from "./AgentInfoView";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChatEntryProps } from "../Chat/ChatEntry";
import { Chart } from "../Chart/Chart";

export type TabKey = "info" | "chart" | "chat";

interface Props {
  agent: Agent;
}

export const MobileAgentView = ({ agent }: Props) => {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("defaultTab") ?? null;

  const [messages, setMessages] = useState<ChatEntryProps[]>([]);

  return (
    <Tabs.Root
      defaultValue={defaultTab ?? "info"}
      lazyMount
      unmountOnExit
      variant="plain"
      display={{ base: "block", md: "none" }}
      h="100%"
    >
      <Flex h="100%" maxW="100dvw" w="100%" flexDirection="column">
        <Flex flex="1 1 0%" w="100%" overflow="hidden" maxH="100%">
          <Tabs.Content value="info" p={0}>
            <AgentInfoView agent={agent} />
          </Tabs.Content>

          <Tabs.Content value="chart" p={0}>
            <Chart />
          </Tabs.Content>

          <Tabs.Content value="chat" p={0}>
            <Chat
              agent={agent}
              messages={messages ?? []}
              setMessages={setMessages}
            />
          </Tabs.Content>
        </Flex>

        <Box
          position="sticky"
          bottom={0}
          zIndex={20}
          bg={colorTokens.blackCustom.a1}
          borderTopWidth="1px"
          borderColor={colorTokens.green.dark}
        >
          <Tabs.List gap={2} border="none" as={Flex}>
            <TabTrigger value="info" label="Info" icon={InfoIcon} />
            <TabTrigger value="chart" label="Chart" icon={ChartIcon} />
            <TabTrigger value="chat" label="Chat" icon={ChatIcon} />
          </Tabs.List>
        </Box>
      </Flex>
    </Tabs.Root>
  );
};

function TabTrigger({
  value,
  label,
  icon,
}: {
  value: TabKey;
  label: string;
  icon: (p: React.ComponentProps<typeof Icon>) => JSX.Element;
}) {
  return (
    <Tabs.Trigger
      value={value}
      display="flex"
      flexDirection="column"
      alignContent="center"
      justifyContent="center"
      gap="2px"
      h="56px"
      w="100%"
      bg="transparent"
      color="gray.300"
      pb={1}
      _selected={{ color: colorTokens.green.erin }}
    >
      <Icon as={icon} boxSize={4} />
      <Box fontSize="xs">{label}</Box>
    </Tabs.Trigger>
  );
}
