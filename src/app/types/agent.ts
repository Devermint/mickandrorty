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
    id: "3c51104c-65d4-4e5d-9736-28fe55f8bcd1",
    image: "/agents/agent3.png",
    name: "Agent Creator",
    tag: "@AgentCreator",
    type: AgentType.AgentCreator,
  },
  {
    id: "0f268864-9777-4a0b-bc66-66a386d14778",
    image: "/agents/agent1.png",
    name: "Video Rick",
    tag: "@VideoRick",
    type: AgentType.Agent,
  },
  {
    id: "662ea2ee-1e4f-4a00-9130-a771f4b84cc2",
    image: "/agents/agent2.png",
    name: "Monica Rorty",
    tag: "@MonicaRorty",
    type: AgentType.Agent,
  },
];
