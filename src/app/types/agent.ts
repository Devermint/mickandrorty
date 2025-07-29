export type Agent = {
  id: string;
  image: string;

  name: string;
  tag: string;

  linkX?: string;
  linkTelegram?: string;
};

export const testAgents: Agent[] = [
  {
    id: "1",
    image: "/agents/agent3.png",
    name: "Agent Medusa",
    tag: "@AgentMedusa",
  },
  {
    id: "2",
    image: "/agents/agent1.png",
    name: "Rorty Rick",
    tag: "@RortyRick",
  },
  {
    id: "3",
    image: "/agents/agent2.png",
    name: "Monica Rorty",
    tag: "@MonicaRorty",
  },
];
