"use client";

import WallOfFame from "@/app/components/Referrals/WallOfFame";
import { colorTokens } from "@/app/components/theme/theme";
import { isLeaderboardResponse, type LeaderboardResponse } from "@/app/types/leaderboard";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

export interface Task {
  task_id: string;
  title: string;
  description: string;
  points: number;
}

export default function TmaLeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    setLeaderboardError(null);

    try {
      const response = await fetch("/api/tasks/leaderboard/all");

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
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <Box>
      {leaderboardLoading ? (
        <Flex justify="center" align="center" h="calc(100vh - 150px)">
          <Spinner color={colorTokens.green.erin} size="xl" />
        </Flex>
      ) : (
        <WallOfFame leaderboard={leaderboard} />
      )}
    </Box>
  );
}
