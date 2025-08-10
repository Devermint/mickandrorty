"use client";

import { Box, Icon, Tabs, Flex } from "@chakra-ui/react";
import Chat from "@/app/components/Chat/Chat";
import type { Agent } from "@/app/types/agent";
import { InfoIcon } from "../../icons/info";
import { ChartIcon } from "../../icons/chart";
import { ChatIcon } from "../../icons/chat";
import { colorTokens } from "../../theme/theme";
import TokenSwapForm from "../../Token/TokenSwapForm";

type TabKey = "info" | "chart" | "chat";

export default function MobileAgentView({ agent }: { agent: Agent }) {
  return (
    <Tabs.Root
      defaultValue="info"
      lazyMount
      unmountOnExit
      variant="plain"
      display={{ base: "block", md: "none" }}
    >
      <Flex minH="100dvh" maxW="100dvw" w="100%" flexDirection="column">
        <Flex flex="1 1 0%" w="100%" mt={16}>
          <Tabs.Content value="info" p={0}>
            <InfoPane agent={agent} />
          </Tabs.Content>

          <Tabs.Content value="chart" p={0}>
            <ChartPane agent={agent} />
          </Tabs.Content>

          <Tabs.Content value="chat" p={0}>
            <Chat agent={agent} />
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
}

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

const InfoPane = ({ agent }: { agent: Agent }) => {
  return (
    <Box p={4} bg={colorTokens.blackCustom.a1} h="100%">
      <Box
        borderRadius={13}
        bg="linear-gradient(rgba(81, 254, 83, 0.09), rgba(81, 254, 83, 0))"
        h="50%"
      ></Box>
      <TokenSwapForm agent={agent} />
    </Box>
  );
};

function ChartPane({ agent }: { agent: Agent }) {
  console.log(agent);
  return (
    <Box
      overflowX="hidden"
      bgImage="url(/img/chart.png)"
      minH="100%"
      minW="100%"
      bgSize="cover"
      bgPos="center"
      bgRepeat="no-repeat"
    ></Box>
  );
}
