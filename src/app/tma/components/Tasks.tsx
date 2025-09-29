"use client";

import { colorTokens } from "@/app/components/theme/theme";
import { Box, Button, Flex, Spinner, Text, Circle } from "@chakra-ui/react";
import React from "react";

interface Task {
  task_id: string;
  title: string;
  description: string;
  points: number;
}

interface TasksProps {
  tasks?: Task[];
  onCompleteTask: (taskId: string) => void;
  leaderboardLoading: boolean;
  leaderboardError: string | null;
  onRetryLeaderboard: () => void;
}

export const Tasks: React.FC<TasksProps> = ({
  tasks,
  onCompleteTask,
  leaderboardLoading,
  leaderboardError,
  onRetryLeaderboard,
}) => {
  return (
    <Box className="overflow-y-auto">
      {tasks && tasks.length > 0 && (
        <Box mt={6}>
          {tasks.map((task) => (
            <Flex
              key={task.task_id}
              align="center"
              justify="space-between"
              p={2}
              mb={2}
              borderRadius="md"
            >
              <Flex align="center">
                <Circle size="40px" bg="gray.700" color="white" mr={4}>
                  <Text fontSize="2xl" fontWeight="bold">
                    !
                  </Text>
                </Circle>
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="white">
                    {task.title}
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    +{task.points} Aptos
                  </Text>
                </Box>
              </Flex>
              <Button
                bg="#8DFF64"
                color="black"
                onClick={() => onCompleteTask(task.task_id)}
                _hover={{
                  bg: "#7BEF55",
                }}
                borderRadius="full"
                px={6}
              >
                Start
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
