import { Agent, AgentType, testAgents } from "@/app/types/agent";
import { Box, Flex } from "@chakra-ui/react";
import FullHeightLayout from "@/app/components/Layout/FullHeightLayout";
import { AgentView } from "@/app/components/Agents/AgentView";
import { MobileAgentView } from "@/app/components/Agents/MobileAgentView";

function resolveAgent(slug: string): Agent {
  const agent = testAgents.find((x) => x.fa_id === slug);
  if (agent) return agent;

  return {
    fa_id: "0xcfdbb0b406add9f3a729d3011bcc1385f6450d864fb9b3f00e64ee6fd2fff23c",
    wallet:
      "0x42856603bb9e2dfdbda264cab66ed7f9fa5096b953c201bce8fed9068bf24c20",
    agent_symbol: "AGCR",
    agent_name: "Agent Creator",
    agent_icon_url: "/agents/agent3.png",
    tag: "@AgentCreator",
    type: AgentType.AgentCreator,
    decimals: 8,
    tx_hash:
      "0xa4dac3c4363d8b957c4d79e712860b6900ea86957c8cb1eeb3e13a05713cdf2d",
    status: "success",
    created: "2025-08-17T21:18:36.431Z",
    updated: "2025-08-17T21:18:36.431Z",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ agent: string }>;
}) {
  const { agent: slug } = await params;
  const agent = resolveAgent(slug);

  return (
    <FullHeightLayout>
      <Box as="main" flex="1" overflow="hidden" position="relative" minH={0}>
        <Flex
          w="full"
          h="full"
          maxH="100%"
          minH={0}
          justify="center"
          display={{ base: "none", md: "flex" }}
          px={4}
        >
          <AgentView agent={agent} />
        </Flex>
        <MobileAgentView agent={agent} />
      </Box>
    </FullHeightLayout>
  );
}
