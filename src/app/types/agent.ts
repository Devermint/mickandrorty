export type Agent = {
  wallet?: string
  fa_id?: string
  agent_symbol?: string
  agent_name?: string
  agent_icon_url?: string
  decimals?: number
  tx_hash?: string
  status?: string
  created?: string
  updated?: string
  type?: AgentType
  tag?: string
};

export enum AgentType {
  AgentCreator = "agentCreator",
  Agent = "agent",
}

export const testAgents: Agent[] = [
  {
    fa_id: "3c51104c-65d4-4e5d-9736-28fe55f8bcd1",
    wallet: "0x42856603bb9e2dfdbda264cab66ed7f9fa5096b953c201bce8fed9068bf24c20",
    agent_symbol: "AGCR",
    agent_name: "Agent Creator",
    agent_icon_url: "/agents/agent3.png",
    tag: "@AgentCreator",
    type: AgentType.AgentCreator,
    decimals: 8,
    tx_hash: "0xa4dac3c4363d8b957c4d79e712860b6900ea86957c8cb1eeb3e13a05713cdf2d",
    status: "success",
    created: "2025-08-17T21:18:36.431Z",
    updated: "2025-08-17T21:18:36.431Z"
  },
  {
    fa_id: "0f268864-9777-4a0b-bc66-66a386d14778",
    wallet: "0x4b826df94ff5d4ba87117e38beb5a0c40f2e2a0fbd8ef2d73d8c9049bcf03a5f",
    agent_symbol: "VDRK",
    agent_name: "Video Rick",
    agent_icon_url: "/agents/agent1.png",
    tag: "@VideoRick",
    type: AgentType.Agent,
    decimals: 8,
    tx_hash: "0xb7e1ccf66787e2962803bdfd4328547ac0d840615e4fe98dab97a2c369acddf8",
    status: "success",
    created: "2025-08-17T21:18:36.431Z",
    updated: "2025-08-17T21:18:36.431Z"
  },
  {
    fa_id: "662ea2ee-1e4f-4a00-9130-a771f4b84cc2",
    wallet: "0x5a9b04baf7b3318005bb150808c607f2b9651026dbedff71b3c15daa66f36b2b",
    agent_symbol: "MNRT",
    agent_name: "Monica Rorty",
    agent_icon_url: "/agents/agent2.png",
    tag: "@MonicaRorty",
    type: AgentType.Agent,
    decimals: 8,
    tx_hash: "0x12eaffc763874749ec9b8893ea3e7777c8cbbc939d0157e5f633a765f29bb6b8",
    status: "success",
    created: "2025-08-17T21:18:36.431Z",
    updated: "2025-08-17T21:18:36.431Z"
  }
];

