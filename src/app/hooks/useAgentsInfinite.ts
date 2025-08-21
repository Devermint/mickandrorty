// src/app/hooks/useAgentsInfinite.ts
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { Agent } from "@/app/types/agent";

export type AgentsPage = {
    items: Agent[];
    page: number;
    pages: number;
    total: number;
};

type Params = {
    search?: string;
    sort?: "newest" | "oldest";
    limit?: number;
};

export function useAgentsInfinite({
    search = "",
    sort = "newest",
    limit = 24,
}: Params) {
    return useInfiniteQuery<AgentsPage>({
        queryKey: ["agents-infinite", { search, sort, limit }],
        initialPageParam: 1,
        queryFn: async ({ pageParam }) => {
            const page = (pageParam as number) ?? 1;

            const url = new URL("/api/agents", window.location.origin);
            url.searchParams.set("page", String(page));
            url.searchParams.set("limit", String(limit));
            if (search) url.searchParams.set("search", search);
            if (sort) url.searchParams.set("sort", sort);

            const res = await fetch(url.toString(), { cache: "no-store" });
            if (!res.ok) throw new Error(`Failed to fetch agents page ${page}`);

          
            const data = (await res.json()) as AgentsPage;
            return data;
        },
        getNextPageParam: (last) =>
            last.page < last.pages ? last.page + 1 : undefined,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });
}
