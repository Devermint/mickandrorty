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
      <Box mt={6} w="100%" position="relative" overflow="hidden" flexShrink={0} px={4}>
        <Box position="absolute" inset={0} zIndex={0}>
          <Image
            src="/img/green_clouds.webp"
            alt="Green clouds backdrop"
            layout="fill"
            objectFit="cover"
            priority
          />
        </Box>

        <Flex
          position="relative"
          zIndex={1}
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
          h="100%"
          py={4}
          px={6}
          gap={1}
        >
          <Text color={colorTokens.gray.timberwolf} fontSize="3xl" lineHeight={1} fontWeight="bold">
            {userScore.toLocaleString()}
          </Text>
          <Text fontSize="md" lineHeight={1} color={colorTokens.gray.timberwolf}>
            Your score
          </Text>
        </Flex>
      </Box>

      <Box mt={8} px={4}>
        <Text fontSize="lg" letterSpacing="wider" color={colorTokens.gray.timberwolf} mb={4}>
          Tasks
        </Text>

        {tasks ? (
          <Flex flexDirection="column" gap={3}>
            {tasks.map((task) => (
              <Flex
                key={task.task_id}
                align="center"
                justify="space-between"
                bg={colorTokens.blackCustom.a2}
                p={3}
                borderRadius="lg"
              >
                <Flex align="center" gap={4}>
                  <Flex
                    align="center"
                    justify="center"
                    minW={10}
                    minH={10}
                    borderRadius="full"
                    bg={colorTokens.blackCustom.a3}
                    color={colorTokens.gray.timberwolf}
                    fontSize="lg"
                    fontWeight="semibold"
                  >
                    !
                  </Flex>
                  <Box>
                    <Text color="white" fontSize="md">
                      {task.title}
                    </Text>
                    <Text color={colorTokens.gray.platinum} fontSize="sm">
                      +{task.points.toLocaleString()} Points
                    </Text>
                  </Box>
                </Flex>
                <Button
                  borderRadius="full"
                  px={6}
                  h={10}
                  fontSize="sm"
                  fontWeight="semibold"
                  cursor={task.status === "completed" ? "default" : "pointer"}
                  disabled={task.status === "completed"}
                  onClick={() => onCompleteTask(task.task_id)}
                  color={
                    task.status === "completed"
                      ? colorTokens.gray.platinum
                      : colorTokens.blackCustom.a1
                  }
                  bg={
                    task.status === "completed"
                      ? colorTokens.blackCustom.a3
                      : colorTokens.green.erin
                  }
                  _hover={{
                    bg:
                      task.status === "completed"
                        ? colorTokens.blackCustom.a3
                        : colorTokens.green.darkErin,
                  }}
                >
                  {task.status === "completed" ? "Done" : "Complete"}
                </Button>
              </Flex>
            ))}
          </Flex>
        ) : (
          <Flex justify="center" align="center" h="100px">
            <Spinner color={colorTokens.green.erin} />
          </Flex>
        )}
      </Box>
      <Box mt={8} px={4}>
        <WallOfFame
          leaderboard={leaderboard}
          loading={leaderboardLoading}
          error={leaderboardError}
          onRetry={onRetryLeaderboard}
        />
      </Box>
    </Box>
  );
};
