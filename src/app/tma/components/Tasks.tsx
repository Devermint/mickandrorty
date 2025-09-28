"use client";

import React from "react";
import { Box, Text, Flex, Button, Spinner } from "@chakra-ui/react";
import Image from "next/image";
import WallOfFame from "@/app/components/Referrals/WallOfFame";
import { colorTokens } from "@/app/components/theme/theme";
import { LeaderboardResponse } from "@/app/types/leaderboard";

interface Task {
  task_id: string;
  title: string;
  points: number;
  status: "completed" | "available";
}

interface TasksProps {
  tasks?: Task[];
  onCompleteTask: (taskId: string) => void;
  leaderboard: LeaderboardResponse | null;
  leaderboardLoading: boolean;
  leaderboardError: string | null;
  onRetryLeaderboard: () => void;
  userScore: number;
}

export const Tasks: React.FC<TasksProps> = ({
  tasks,
  onCompleteTask,
  leaderboard,
  leaderboardLoading,
  leaderboardError,
  onRetryLeaderboard,
  userScore,
}) => {
  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Tasks
      </Text>
      {leaderboardLoading && (
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" color="primary" />
        </Flex>
      )}
      {leaderboardError && (
        <Flex justify="center" align="center" minH="200px">
          <Text color="red.500" fontSize="lg">
            Error loading leaderboard: {leaderboardError}
          </Text>
          <Button onClick={onRetryLeaderboard} ml={2} colorScheme="primary">
            Retry
          </Button>
        </Flex>
      )}
      {!leaderboardLoading && !leaderboardError && leaderboard && (
        <WallOfFame leaderboard={leaderboard} />
      )}
      {tasks && tasks.length > 0 && (
        <Box mt={6}>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Available Tasks
          </Text>
          {tasks.map((task) => (
            <Flex
              key={task.task_id}
              align="center"
              justify="space-between"
              p={4}
              mb={2}
              borderRadius="md"
              bg={task.status === "completed" ? "gray.100" : "white"}
              borderWidth="1px"
              borderColor={task.status === "completed" ? "gray.300" : "gray.200"}
            >
              <Box>
                <Text fontSize="lg" fontWeight="bold">
                  {task.title}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Points: {task.points}
                </Text>
              </Box>
              <Button
                colorScheme="primary"
                onClick={() => onCompleteTask(task.task_id)}
                isDisabled={task.status === "completed"}
              >
                {task.status === "completed" ? "Completed" : "Complete Task"}
              </Button>
            </Flex>
          ))}
        </Box>
      )}
      {tasks && tasks.length === 0 && (
        <Flex justify="center" align="center" minH="200px">
          <Text fontSize="lg" color="gray.500">
            No available tasks yet. Check back later!
          </Text>
        </Flex>
      )}
    </Box>
  );
};
