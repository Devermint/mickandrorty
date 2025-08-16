import { Agent, AgentType, testAgents } from "@/app/types/agent";
import { Box, Flex } from "@chakra-ui/react";
import FullHeightLayout from "@/app/components/Layout/FullHeightLayout";
import { AgentView } from "@/app/components/Agents/AgentView";
import { MobileAgentView } from "@/app/components/Agents/MobileAgentView";

function resolveAgent(slug: string): Agent {
  const agent = testAgents.find((x) => x.id === slug);
  if (agent) return agent;

  return {
    id: "",
    image: "",
    name: "",
    tag: "",
    type: AgentType.AgentCreator,
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
      <Box as="main" flex="1" overflow="auto" position="relative">
        <Flex
          w="100%"
          h="100%"
          justify="center"
          display={{ base: "none", md: "flex" }}
        >
          <AgentView agent={agent} />
        </Flex>
        <MobileAgentView agent={agent} />
      </Box>
    </FullHeightLayout>
  );
}
