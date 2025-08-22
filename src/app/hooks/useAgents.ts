// src/hooks/useAgents.ts
import { useQuery } from "@tanstack/react-query";
import { Agent } from "@/app/types/agent";

export const useAgents = () =>
  useQuery<Agent[]>({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/all-agents`);
      if (!res.ok) throw new Error(`Failed to fetch agents: ${res.status}`);
      const data = await res.json();
      const apiAgents: Agent[] = data?.items ?? [];
      return apiAgents;
    },

    refetchOnMount: "always",
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  });
