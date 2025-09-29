"use client";

import { LeaderboardResponse } from "@/app/types/leaderboard";
import { toaster } from "@/components/ui/toaster";
import { Box, Text, Flex } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { Tasks } from "../components/Tasks";
import { Task } from "../leaderboard/page";

export default function TmaTasksPage() {
  const [tasks, setTasks] = useState<Task[]>();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const tasksResponse = await fetch("/api/tasks/all");
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
  }, []);
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
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <Box>
      <Flex
        justify="center"
        align="center"
        py={12}
        style={{
          backgroundImage: "radial-gradient(ellipse at bottom, #2d5016, transparent 70%)",
        }}
        position="relative"
      >
        <Text fontSize="2xl" fontWeight="bold" textAlign="center" color="white">
          Tasks
        </Text>
      </Flex>
      <Box p={4}>
        <Tasks
          tasks={tasks}
          onCompleteTask={handleCompleteTask}
          leaderboardLoading={leaderboardLoading}
          leaderboardError={leaderboardError}
          onRetryLeaderboard={() => {}}
        />
      </Box>
    </Box>
  );
}
