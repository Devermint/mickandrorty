import { Agent } from "@/app/lib/agent";

export interface AgentCardProps {
  agent: Agent;
  handleTelegram: (e: React.MouseEvent) => void;
  handleX: (e: React.MouseEvent) => void;
}

export interface AgentImageProps {
  image: string;
}

export interface AgentSocialsProps {
  name: string;
  handleTelegram: (e: React.MouseEvent) => void;
  handleX: (e: React.MouseEvent) => void;
}

export interface AgentTraitsProps {
  stats: Agent['stats'];
} 