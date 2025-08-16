"use client";

import Chat from "@/app/components/Chat/Chat";
import type { Agent } from "@/app/types/agent";
import { useState } from "react";
import { ChatEntryProps } from "../Chat/ChatEntry";

export type TabKey = "info" | "chart" | "chat";

interface Props {
  agent: Agent;
}

export const AgentView = ({ agent }: Props) => {
  const [messages, setMessages] = useState<ChatEntryProps[]>([]);

  return (
    <Chat agent={agent} messages={messages ?? []} setMessages={setMessages} />
  );
};
