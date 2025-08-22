import { useQuery } from "@tanstack/react-query";
import { Agent } from "@/app/types/agent";

export const useAgent = (faId?: string) =>
  useQuery<Agent>({
    queryKey: ["agent", faId],
    enabled: !!faId,
    queryFn: async () => {
      // GET single agent (prefer efficient endpoint)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agent?fa_id=${faId}`
      );
      if (!res.ok) {
        throw new Error(`Agent ${faId} not found`);
      }
      return res.json();
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    staleTime: 0,
    retry: 1,
  });
