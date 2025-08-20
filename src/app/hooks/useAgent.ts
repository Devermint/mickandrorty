import { useQuery } from "@tanstack/react-query";
import { Agent } from "@/app/types/agent";

export const useAgent = (faId?: string) =>
    useQuery<Agent>({
        queryKey: ["agent", faId],
        enabled: !!faId,
        queryFn: async () => {
            // GET single agent (prefer efficient endpoint)
            const res = await fetch(`/api/agent/${faId}`);
            if (!res.ok) {
                // fallback to searching list if you don't have /agents/:id
                const list = await fetch(`/api/agents`).then(r => r.json());
                const found = (list?.items as Agent[] | undefined)?.find(a => a.fa_id === faId);
                if (!found) throw new Error(`Agent ${faId} not found`);
                return found;
            }
            return res.json();
        },
        refetchOnMount: "always",
        staleTime: 0,
        retry: 1,
    });
