"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Box,
  Flex,
  Text,
  Button,
  SimpleGrid,
  Image as ChakraImage,
  useClipboard,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { colorTokens } from "@/app/components/theme/theme";
import { CheckmarkIcon } from "@/app/components/icons/checkmark";
import { TelegramIcon } from "@/app/components/icons/telegram";
import { useAptosWallet } from "@/app/context/AptosWalletContext";
import { CreatePostModal } from "@/app/components/CreatePostModal/CreatePostModal";
import TelegramLoginWidget from "@/app/components/TelegramLoginWidget/TelegramLoginWidget";
import WallOfFame from "@/app/components/Referrals/WallOfFame";
import { isLeaderboardResponse, type LeaderboardResponse } from "@/app/types/leaderboard";

interface Task {
  task_id: string;
  title: string;
  points: number;
  status: "completed" | "available";
}

export default function ReferralsPage() {
  const {
    user,
    jwt,
    isConnected,
    refreshUser,
    account,
    balanceInApt,
    isLoadingBalance,
    refreshBalance,
  } = useAptosWallet();
  const [tasks, setTasks] = useState<Task[]>();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const {
    open: isCreatePostModalOpen,
    onOpen: onCreatePostModalOpen,
    onClose: onCreatePostModalClose,
  } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const referralLink = user?.referral_code
    ? `https://dapp.aptoslayer.ai/?referralCode=${user.referral_code}`
    : "";
  const clipboard = useClipboard({ value: referralLink });

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
      setSelectedTask(task);
      onCreatePostModalOpen();
      return;
    }

    if (!jwt) {
      console.error("No JWT available for authenticated request.");
      return;
    }

    try {
      const response = await fetch("/api/tasks/complete", {
        // This calls your Next.js proxy
        method: "POST",

        // *** THIS IS THE REQUIRED FIX ***
        // 'credentials' must be a top-level option, NOT inside 'headers'
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
          const popup = window.open(targetUrl, "_blank", "noopener,noreferrer");
          if (!popup) {
            window.location.href = targetUrl;
            return;
          }
        }
      }

      await Promise.all([fetchData(), fetchLeaderboard(), refreshUser()]);
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleCreatePostTask = async (tweetUrl: string) => {
    if (!jwt || !selectedTask) {
      throw new Error("Authentication error or no task selected.");
    }

    const response = await fetch("/api/tasks/complete", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": jwt,
      },
      body: JSON.stringify({
        task_id: selectedTask.task_id,
        tweet_url: tweetUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to complete task");
    }

    await Promise.all([fetchData(), fetchLeaderboard(), refreshUser()]);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100%">
        <Spinner color={colorTokens.green.erin} size="xl" />
      </Flex>
    );
  }

  if (!isConnected) {
    return (
      <Flex justify="center" align="center" h="100%">
        <Text color="white">Please connect your wallet to see your referrals.</Text>
      </Flex>
    );
  }

  const score = user?.points ?? 0;
  const referrals = user?.referral_count ?? 0;
  const isTgConnected = !!user?.telegram_id;
  return (
    <Box
      position="relative"
      display="flex"
      flexDirection="column"
      flex={1}
      minH={0}
      overflowY="auto"
    >
      <Box
        maxW="700px"
        w="full"
        mx="auto"
        p={{ base: 4, md: 8 }}
        bg="transparent"
        display="flex"
        flexDirection="column"
        mt={{ base: 10, md: 0 }}
      >
        <SimpleGrid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} rowGap={4}>
          <Flex align="center" justify="center" direction={{ base: "column", md: "row" }} gap={4}>
            <Image src="/img/logo-mobile.png" alt="Logo" width={80} height={80}></Image>
            <Box textAlign={{ base: "center", md: "left" }}>
              <Text color="white" fontSize={25} lineHeight={1.3} fontWeight="bold">
                {isLoadingBalance ? <Spinner /> : `${balanceInApt || "0"}`}
              </Text>
              <Text fontSize={11} lineHeight={1} fontWeight="bold">
                APTOS
              </Text>
            </Box>
          </Flex>

          <Flex align="center" gap={4}>
            <Box
              mt={10}
              w="100%"
              position="relative"
              overflow="visible"
              flexShrink={0}
              px={5}
              py={15}
              borderRadius={14}
            >
              <Box position="absolute" width="100%" height="100%" top={0} left={0} zIndex={0}>
                <ChakraImage
                  src="/img/invite-link-bg.webp"
                  alt="Invite link backdrop"
                  style={{ objectFit: "cover" }}
                />
              </Box>
              <Box zIndex={1} position="relative">
                <Text color="white" fontSize={16}>
                  Your invite link
                </Text>
                <Text color="white" fontSize={14} fontWeight={200}>
                  {referralLink}
                </Text>

                <Button
                  mt={4}
                  borderRadius="full"
                  px={8}
                  py={2}
                  h="auto"
                  fontSize={14}
                  color={colorTokens.blackCustom.a1}
                  bg={colorTokens.green.erin}
                  _hover={{
                    bg: colorTokens.green.darkErin,
                  }}
                  _active={{
                    bg: colorTokens.green.dark,
                  }}
                  transition="background 0.2s ease"
                  onClick={clipboard.copy}
                >
                  {clipboard.copied ? "Copied" : "Copy link "}
                </Button>
              </Box>
              <ChakraImage
                position="absolute"
                top={-3}
                right={5}
                zIndex={2}
                src="/img/tg-image.png"
                h={71}
                w={71}
                opacity={1}
              />
            </Box>
          </Flex>

          <Flex gap={3}>
            <Flex
              borderRadius="full"
              h={10}
              w={10}
              bg={colorTokens.blackCustom.a1}
              justify="center"
              align="center"
            >
              <CheckmarkIcon color={colorTokens.green.erin} h={4} w={4} />
            </Flex>
            <Box>
              <Text fontSize={11} lineHeight={1}>
                Your referrals
              </Text>
              <Text color="white" fontSize={25} lineHeight={1.3} fontWeight="bold">
                {referrals.toLocaleString()}
              </Text>
            </Box>
          </Flex>

          <Flex gap={3}>
            <Flex
              borderRadius="full"
              h={10}
              w={10}
              bg={colorTokens.blackCustom.a1}
              justify="center"
              align="center"
            >
              <TelegramIcon color={colorTokens.green.erin} h={4} w={4} />
            </Flex>
            <Box>
              <Text fontSize={20} lineHeight={1.3} color="white">
                Telegram
              </Text>
              <Text color={isTgConnected ? colorTokens.green.erin : "red"} fontSize={12}>
                {isTgConnected ? "Connected" : "Not connected"}
              </Text>
            </Box>
            {!isTgConnected && (
              <Box ml={4}>
                <TelegramLoginWidget onAuthSuccess={fetchData} />
              </Box>
            )}
          </Flex>
        </SimpleGrid>

        <Box mt={10} w="100%" position="relative" overflow="hidden" flexShrink={0}>
          <Box position="absolute" inset={0} zIndex={0}>
            <Image
              src="/img/green_clouds.webp"
              alt="Green clouds backdrop"
              fill
              style={{ objectFit: "cover" }}
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
            <Text
              color={colorTokens.gray.timberwolf}
              fontSize={24}
              lineHeight={1}
              fontWeight="bold"
            >
              {score.toLocaleString()}
            </Text>
            <Text fontSize={13} lineHeight={1} color={colorTokens.gray.timberwolf}>
              Your score
            </Text>
          </Flex>
        </Box>

        <Box mt={10} position="relative" display="flex" flexDirection="column">
          <Text fontSize={16} letterSpacing="wider" color={colorTokens.gray.timberwolf} mb={4}>
            Tasks
          </Text>

          {tasks && (
            <Flex position="relative" flexDirection="column">
              <Flex flexDirection="column" gap={3}>
                {tasks.map((task) => (
                  <Flex key={task.task_id} align="center" justify="space-between">
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
                        <Text color="white" fontSize={{ base: "sm", md: "md" }}>
                          {task.title}
                        </Text>
                        <Text color={colorTokens.gray.platinum} fontSize={{ base: "sm", md: "sm" }}>
                          +{task.points.toLocaleString()} Points
                        </Text>
                      </Box>
                    </Flex>
                    <Button
                      borderRadius="full"
                      px={{ base: 4, md: 6 }}
                      h={{ base: 8, md: 10 }}
                      fontSize={{ base: "xs", md: "sm" }}
                      fontWeight="semibold"
                      cursor={task.status === "completed" ? "default" : "pointer"}
                      disabled={task.status === "completed"}
                      onClick={() => handleCompleteTask(task.task_id)}
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
                      _active={{
                        bg:
                          task.status === "completed"
                            ? colorTokens.blackCustom.a3
                            : colorTokens.green.dark,
                      }}
                      transition="background 0.2s ease"
                    >
                      {task.status === "completed" ? "Done" : "Complete"}
                    </Button>
                  </Flex>
                ))}
              </Flex>
            </Flex>
          )}
        </Box>
        <WallOfFame
          leaderboard={leaderboard}
          loading={leaderboardLoading}
          error={leaderboardError}
          onRetry={fetchLeaderboard}
        />
      </Box>
      {selectedTask && (
        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={onCreatePostModalClose}
          onComplete={handleCreatePostTask}
          taskTitle={selectedTask.title}
        />
      )}
    </Box>
  );
}
