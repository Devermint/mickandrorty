"use client";

import React from "react";
import { Box } from "@chakra-ui/react";
import { Tasks } from "../components/Tasks";
import { useAptosWallet } from "@/app/context/AptosWalletContext";
import { isLeaderboardResponse, type LeaderboardResponse } from "@/app/types/leaderboard";
import { useState, useCallback, useEffect } from "react";
import { Flex, Spinner, Text } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { colorTokens } from "@/app/components/theme/theme";

export interface Task {
  task_id: string;
  title: string;
  points: number;
  status: "completed" | "available";
}

export default function TmaLeaderboardPage() {
  const { user, jwt, isConnected, refreshUser } = useAptosWallet();
  const [tasks, setTasks] = useState<Task[]>();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
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
    toaster.create({
      title: "Switching to Web App",
      description: "Please complete tasks on the main web application.",
      type: "info",
      duration: 5000,
      closable: true,
    });

    const webAppUrl = "https://dapp.aptoslayer.ai/referrals";
    if ((window as any)?.Telegram?.WebApp) {
      (window as any).Telegram.WebApp.openLink(webAppUrl);
    } else {
      window.open(webAppUrl, "_blank");
    }
  };

  if (!isConnected) {
    return (
      <Flex justify="center" align="center" h="100%">
        <Text color="white">Please connect your wallet.</Text>
      </Flex>
    );
  }

  return (
    <Box p={4}>
      <Text fontSize="2xl" fontWeight="bold" color="white" mb={4}>
        Leaderboard
      </Text>
      {loading || leaderboardLoading ? (
        <Flex justify="center" align="center" h="calc(100vh - 150px)">
          <Spinner color={colorTokens.green.erin} size="xl" />
        </Flex>
      ) : (
        <Tasks
          tasks={tasks}
          onCompleteTask={handleCompleteTask}
          leaderboard={leaderboard}
          leaderboardLoading={leaderboardLoading}
          leaderboardError={leaderboardError}
          onRetryLeaderboard={fetchLeaderboard}
          userScore={user?.points ?? 0}
        />
      )}
    </Box>
  );
}
