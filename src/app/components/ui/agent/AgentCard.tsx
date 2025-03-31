"use client";

import { useRouter } from "next/navigation";
import { Agent } from "@/app/lib/agent";
import { useMobileBreak } from "../../responsive";
import { AgentCardDesktop } from "./AgentCardDesktop";
import { AgentCardMobile } from "./AgentCardMobile";

export default function AgentCard(agent: Agent) {
  const isMobile = useMobileBreak();
  const router = useRouter();

  const handleTelegram = (e: React.MouseEvent) => {
    router.push(`https://t.me/aptoslayerai`);
    e.stopPropagation();
  };

  const handleX = (e: React.MouseEvent) => {
    switch (agent.id) {
      case "mick.zanches":
        router.push(`https://x.com/MickAiAgent`);
        break;
      case "pickle.mick":
        router.push(`https://x.com/RortyAiAgent`);
        break;
      case "rorty.zmith":
        router.push(`https://x.com/PickleMickAi`);
        break;
      default:
        break;
    }
    e.stopPropagation();
  };

  return (
    <div>
      {isMobile ? (
        <AgentCardMobile agent={agent} handleTelegram={handleTelegram} handleX={handleX} />
      ) : (
        <AgentCardDesktop agent={agent} handleTelegram={handleTelegram} handleX={handleX} />
      )}
    </div>
  );
}
