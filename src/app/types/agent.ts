export type Agent = {
  id: string;
  image: string;

  name: string;
  tag: string;
  type: AgentType;

  linkX?: string;
  linkTelegram?: string;
};

export enum AgentType {
  AgentCreator = "agentCreator",
  Agent = "agent",
}

export const testAgents: Agent[] = [
  {
    id: "1",
    image: "/agents/agent3.png",
    name: "Agent Medusa",
    tag: "@AgentMedusa",
    type: AgentType.AgentCreator,
  },
  {
    id: "2",
    image: "/agents/agent1.png",
    name: "Rorty Rick",
    tag: "@RortyRick",
    type: AgentType.Agent,
  },
  {
    id: "3",
    image: "/agents/agent2.png",
    name: "Monica Rorty",
    tag: "@MonicaRorty",
    type: AgentType.Agent,
  },
];
