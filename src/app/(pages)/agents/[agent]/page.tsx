"use client";

import { useMobileBreak } from "@/app/components/responsive";
import AgentMiniIcons from "@/app/components/ui/agent/AgenMiniIcons";
import AgentLayoutDesktop from "@/app/components/ui/agent/AgentLayoutDesktop";
import AgentLayoutMobile from "@/app/components/ui/agent/AgentLayoutMobile";
import { Agent } from "@/app/lib/agent";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { use } from "react";

const fetchAgents = async (): Promise<Agent[]> => {
  const response = await fetch("/api/agents");
  if (!response.ok) {
    throw new Error("Failed to fetch agents");
  }
  return response.json();
};

export default function AgentLayout({ params }: { params: Promise<{ agent: string }> }) {
  const router = useRouter();
  const args = use(params);
  const agentId = args.agent;
  const isMobile = useMobileBreak();

  const { data: agents, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
  });

  const activeAgent = agents?.find((a) => a.id == agentId);

  const agentMiniIconClick = (index: number) => {
    router.push(`/agents/${agents![index].id}`);
  };

  if (isLoading || activeAgent === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <AgentMiniIcons
        images={agents?.map((agent) => agent.image)}
        activeIndex={agents?.findIndex((agent) => {
          return agent.id === activeAgent.id;
        })}
        onClick={agentMiniIconClick}
      />
      {isMobile ? (
        <AgentLayoutMobile activeAgent={activeAgent} />
      ) : (
        <AgentLayoutDesktop activeAgent={activeAgent} />
      )}
    </div>
  );
}
