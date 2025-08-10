import MobileAgentView from "@/app/components/Agent/mobile/MobileAgentView";
import Chat from "@/app/components/Chat/Chat";
import { Agent, AgentType } from "@/app/types/agent";
import { Box } from "@chakra-ui/react";

const RESERVED_AGENTS: Record<AgentType, Agent> = {
  [AgentType.AgentCreator]: {
    id: "agentCreator",
    name: "Agent Creator",
    image: "/",
    tag: "",
    type: AgentType.AgentCreator,
  },
  [AgentType.Agent]: {
    id: "agent",
    name: "Agent",
    image: "/",
    tag: "",
    type: AgentType.Agent,
  },
};

function resolveAgent(slug: string): Agent {
  return (
    (RESERVED_AGENTS as Record<string, Agent>)[slug] ??
    RESERVED_AGENTS[AgentType.Agent]
  );
}

export default function Page({ params }: { params: { agent: string } }) {
  const agent = resolveAgent(params.agent);

  return (
    <>
      <Box style={{ display: "none" }}>
        <Chat agent={agent} />
      </Box>

      <MobileAgentView agent={agent} />
    </>
  );
}
