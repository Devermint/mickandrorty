"use client";

import { useMobileBreak } from "@/app/components/responsive";
import AgentMiniIcons from "@/app/components/ui/agent/AgenMiniIcons";
import AgentLayoutDesktop from "@/app/components/ui/agent/AgentLayoutDesktop";
import AgentLayoutMobile from "@/app/components/ui/agent/AgentLayoutMobile";
import { Agent } from "@/app/lib/agent";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function AgentLayout({ params }: { params: Promise<{ agent: string }> }) {
  const router = useRouter();
  const args = use(params);
  const agentId = args.agent;
  const isMobile = useMobileBreak();

  const [agents, setAgents] = useState<Agent[]>();
  const [activeAgent, setActiveAgent] = useState<Agent>();

  useEffect(() => {
    fetch("/api/agents")
      .then((response) => {
        response.json().then((data) => {
          setAgents(data);
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    const agent = agents?.find((a) => a.id == agentId);
    setActiveAgent(agent);
  }, [agentId, agents]);

  const agentMiniIconClick = (index: number) => {
    setActiveAgent(agents![index]);
    router.push(`/agents/${agents![index].id}`);
  };

  if (activeAgent === undefined) {
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
