"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Box, Flex, Spinner, Text, Tabs } from "@chakra-ui/react";
import { colorTokens } from "@/app/components/theme/theme";
import { useAptosWallet } from "@/app/context/AptosWalletContext";
import { isLeaderboardResponse, type LeaderboardResponse } from "@/app/types/leaderboard";
import { Tasks } from "./components/Tasks";
import { Referrals } from "./components/Referrals";

export interface Task {
  task_id: string;
  title: string;
  points: number;
  status: "completed" | "available";
}

export default function TmaTasksPage() {
  const { user, jwt, isConnected, refreshUser } = useAptosWallet();
  const [tasks, setTasks] = useState<Task[]>();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!jwt) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const tasksResponse = await fetch("/api/tasks", {
        headers: { "x-access-token": jwt },
      });
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      } else {
        console.error("Failed to fetch tasks");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [jwt]);

  const fetchLeaderboard = useCallback(async () => {
    if (!jwt) {
      setLeaderboard(null);
      setLeaderboardError(null);
      setLeaderboardLoading(false);
      return;
    }

    setLeaderboardLoading(true);
    setLeaderboardError(null);

    try {
      const response = await fetch("/api/tasks/leaderboard", {
        headers: { "x-access-token": jwt },
      });

      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "message" in payload
            ? String((payload as { message?: unknown }).message ?? "Failed to fetch leaderboard")
            : "Failed to fetch leaderboard";
        throw new Error(message);
      }

      if (!isLeaderboardResponse(payload)) {
        throw new Error("Invalid leaderboard payload");
      }

      setLeaderboard(payload);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLeaderboardError(error instanceof Error ? error.message : "Unable to load leaderboard");
    } finally {
      setLeaderboardLoading(false);
    }
  }, [jwt]);

  useEffect(() => {
    fetchData();
    fetchLeaderboard();
  }, [fetchData, fetchLeaderboard]);

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks?.find((t) => t.task_id === taskId);
    if (!task) return;

    if (taskId === "CREATE_POST") {
      // Handle create post task if necessary in TMA
      return;
    }

    if (!jwt) {
      console.error("No JWT available for authenticated request.");
      return;
    }

    try {
      const response = await fetch("/api/tasks/complete", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": jwt,
        },
        body: JSON.stringify({ task_id: taskId }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();

      if (data.action === "redirect") {
        const targetUrl = data.authorization_url || data.url;
        if (targetUrl) {
          // In TMA, we might want to use openLink
          (window as any)?.Telegram?.WebApp?.openLink(targetUrl);
        }
      }

      await Promise.all([fetchData(), fetchLeaderboard(), refreshUser()]);
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh" bg={colorTokens.blackCustom.a1}>
        <Spinner color={colorTokens.green.erin} size="xl" />
      </Flex>
    );
  }

  if (!isConnected) {
    return (
      <Flex justify="center" align="center" h="100vh" bg={colorTokens.blackCustom.a1}>
        <Text color="white">Please connect your wallet.</Text>
      </Flex>
    );
  }

  return (
    <Box bg={colorTokens.blackCustom.a1} minH="100vh" color="white">
      <Tabs.Root fitted variant="enclosed" defaultValue="tasks">
        <Tabs.List borderBottomColor="gray.700">
          <Tabs.Trigger value="tasks" _selected={{ color: "white", bg: "green.500" }}>
            Tasks
          </Tabs.Trigger>
          <Tabs.Trigger value="frens" _selected={{ color: "white", bg: "green.500" }}>
            Frens
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tasks">
          <Tasks
            tasks={tasks}
            onCompleteTask={handleCompleteTask}
            leaderboard={leaderboard}
            leaderboardLoading={leaderboardLoading}
            leaderboardError={leaderboardError}
            onRetryLeaderboard={fetchLeaderboard}
            userScore={user?.points ?? 0}
          />
        </Tabs.Content>
        <Tabs.Content value="frens">
          <Referrals user={user} />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}
