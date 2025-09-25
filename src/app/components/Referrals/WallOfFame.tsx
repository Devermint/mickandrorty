"use client";
import { Box, Flex, Text } from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";
import Image from "next/image";
import { useState } from "react";

const LEADERBOARD_TABS = [
  { key: "weekly", label: "Weekly" },
  { key: "allTime", label: "All time" },
] as const;

type LeaderboardTabKey = (typeof LEADERBOARD_TABS)[number]["key"];

type LeaderboardEntry = {
  id: string;
  name: string;
  points: number;
  rank: number;
  isSelf?: boolean;
};

type HighlightVariant = "gold" | "silver" | "bronze" | "self" | "default";

const LEADERBOARD_DATA: Record<LeaderboardTabKey, LeaderboardEntry[]> = {
  weekly: [
    { id: "weekly-1", name: "Crypto", points: 1000, rank: 1 },
    { id: "weekly-2", name: "Crypto", points: 1000, rank: 2 },
    { id: "weekly-3", name: "Crypto", points: 1000, rank: 3 },
    { id: "weekly-4", name: "Crypto", points: 1000, rank: 4 },
    { id: "weekly-5", name: "Crypto", points: 1000, rank: 5 },
    { id: "weekly-6", name: "Crypto", points: 1000, rank: 6 },
    { id: "weekly-7", name: "Crypto", points: 1000, rank: 7 },
    { id: "weekly-8", name: "You", points: 1000, rank: 123, isSelf: true },
  ],
  allTime: [
    { id: "all-1", name: "Crypto", points: 24000, rank: 1 },
    { id: "all-2", name: "Crypto", points: 20000, rank: 2 },
    { id: "all-3", name: "Crypto", points: 16000, rank: 3 },
    { id: "all-4", name: "Crypto", points: 12500, rank: 4 },
    { id: "all-5", name: "Crypto", points: 11200, rank: 5 },
    { id: "all-6", name: "Crypto", points: 9800, rank: 6 },
    { id: "all-7", name: "Crypto", points: 9100, rank: 7 },
    { id: "all-8", name: "You", points: 4200, rank: 96, isSelf: true },
  ],
};

type HighlightStyle = {
  containerBg: string;
  containerBorder: string;
  avatarBg: string;
  avatarColor: string;
  titleColor: string;
  pointsColor: string;
  badgeBg?: string;
  badgeBorder?: string;
  badgeColor: string;
};

const HIGHLIGHT_STYLES: Record<HighlightVariant, HighlightStyle> = {
  gold: {
    containerBg:
      "linear-gradient(90deg, rgba(115, 88, 29, 0.48) 0%, rgba(20, 15, 5, 0.92) 100%)",
    containerBorder: "rgba(246, 202, 86, 0.32)",
    avatarBg: "rgba(246, 202, 86, 0.18)",
    avatarColor: "#F6CA56",
    titleColor: "#FFFFFF",
    pointsColor: "rgba(255, 255, 255, 0.72)",
    badgeBg: "rgba(246, 202, 86, 0.16)",
    badgeBorder: "rgba(246, 202, 86, 0.32)",
    badgeColor: "#F6CA56",
  },
  silver: {
    containerBg:
      "linear-gradient(90deg, rgba(86, 90, 96, 0.44) 0%, rgba(18, 19, 22, 0.92) 100%)",
    containerBorder: "rgba(170, 176, 190, 0.26)",
    avatarBg: "rgba(195, 199, 213, 0.2)",
    avatarColor: "#D7DBE7",
    titleColor: "#FFFFFF",
    pointsColor: "rgba(255, 255, 255, 0.72)",
    badgeBg: "rgba(195, 199, 213, 0.16)",
    badgeBorder: "rgba(170, 176, 190, 0.3)",
    badgeColor: "#E0E3EF",
  },
  bronze: {
    containerBg:
      "linear-gradient(90deg, rgba(120, 62, 24, 0.52) 0%, rgba(26, 13, 6, 0.92) 100%)",
    containerBorder: "rgba(255, 164, 102, 0.28)",
    avatarBg: "rgba(255, 164, 102, 0.2)",
    avatarColor: "#FFA466",
    titleColor: "#FFFFFF",
    pointsColor: "rgba(255, 255, 255, 0.72)",
    badgeBg: "rgba(255, 164, 102, 0.16)",
    badgeBorder: "rgba(255, 164, 102, 0.32)",
    badgeColor: "#FFA466",
  },
  self: {
    containerBg:
      "linear-gradient(90deg, rgba(9, 32, 15, 0.88) 0%, rgba(6, 24, 10, 0.92) 100%)",
    containerBorder: "rgba(81, 254, 83, 0.22)",
    avatarBg: "rgba(81, 254, 83, 0.18)",
    avatarColor: "#51FE53",
    titleColor: "#51FE53",
    pointsColor: "rgba(81, 254, 83, 0.72)",
    badgeBg: "rgba(81, 254, 83, 0.16)",
    badgeBorder: "rgba(81, 254, 83, 0.32)",
    badgeColor: "#51FE53",
  },
  default: {
    containerBg: "rgba(26, 29, 31, 0.55)",
    containerBorder: "rgba(255, 255, 255, 0.06)",
    avatarBg: "rgba(255, 255, 255, 0.04)",
    avatarColor: colorTokens.gray.timberwolf,
    titleColor: "#FFFFFF",
    pointsColor: colorTokens.gray.platinum,
    badgeColor: colorTokens.gray.platinum,
  },
};

const getHighlightVariant = (entry: LeaderboardEntry): HighlightVariant => {
  if (entry.isSelf) {
    return "self";
  }
  if (entry.rank === 1) {
    return "gold";
  }
  if (entry.rank === 2) {
    return "silver";
  }
  if (entry.rank === 3) {
    return "bronze";
  }
  return "default";
};

const getAvatarLabel = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) {
    return "?";
  }
  if (trimmed.length === 1) {
    return trimmed.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
};

const formatPoints = (points: number) => `${points.toLocaleString()} Aptos`;

const formatOrdinal = (rank: number) => {
  if (rank === 1) {
    return "1st";
  }
  if (rank === 2) {
    return "2nd";
  }
  return "3rd";
};

const WallOfFame = () => {
  const [activeTab, setActiveTab] = useState<LeaderboardTabKey>("weekly");
  const activeEntries = LEADERBOARD_DATA[activeTab];
  const totalScore = 123456;

  return (
    <>
      <Box
        mt={10}
        w="100%"
        position="relative"
        overflow="hidden"
        flexShrink={0}
        borderRadius="24px"
      >
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
          py={6}
          px={6}
          gap={2}
        >
          <Text
            color={colorTokens.gray.timberwolf}
            fontSize={24}
            lineHeight={1}
            fontWeight="bold"
          >
            Wall Of Fame
          </Text>
          <Text
            fontSize={14}
            lineHeight={1}
            color={colorTokens.gray.timberwolf}
            opacity={0.8}
          >
            {totalScore.toLocaleString()} lifetime Aptos
          </Text>
        </Flex>
      </Box>

      <Flex position="relative" flexDirection="column" gap={4} mt={6}>
        <Flex
          align="center"
          bg={colorTokens.blackCustom.a2}
          borderRadius="999px"
          p="4px"
          maxW="260px"
        >
          {LEADERBOARD_TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <Flex
                key={tab.key}
                as="button"
                onClick={() => setActiveTab(tab.key)}
                flex={1}
                align="center"
                justify="center"
                h="34px"
                borderRadius="999px"
                cursor="pointer"
                fontSize="sm"
                fontWeight={isActive ? 600 : 500}
                color={isActive ? "white" : colorTokens.gray.platinum}
                bg={
                  isActive
                    ? "linear-gradient(90deg, rgba(81, 254, 83, 0.28) 0%, rgba(81, 254, 83, 0.18) 100%)"
                    : "transparent"
                }
                border="1px solid"
                borderColor={
                  isActive ? "rgba(81, 254, 83, 0.38)" : "transparent"
                }
                transition="all 0.2s ease"
              >
                {tab.label}
              </Flex>
            );
          })}
        </Flex>

        <Flex flexDirection="column" gap={3}>
          {activeEntries.map((entry) => {
            const highlight = getHighlightVariant(entry);
            const styles = HIGHLIGHT_STYLES[highlight];
            const avatarLabel = getAvatarLabel(entry.name);

            const rightElement = (() => {
              if (
                highlight === "gold" ||
                highlight === "silver" ||
                highlight === "bronze"
              ) {
                return (
                  <Flex
                    align="center"
                    justify="center"
                    w={10}
                    h={10}
                    borderRadius="full"
                    bg={styles.badgeBg}
                    border="1px solid"
                    borderColor={styles.badgeBorder}
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color={styles.badgeColor}
                    >
                      {formatOrdinal(entry.rank)}
                    </Text>
                  </Flex>
                );
              }

              if (highlight === "self") {
                return (
                  <Flex
                    px={3}
                    py={1}
                    borderRadius="999px"
                    bg={styles.badgeBg}
                    border="1px solid"
                    borderColor={styles.badgeBorder}
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color={styles.badgeColor}
                    >
                      #{entry.rank}
                    </Text>
                  </Flex>
                );
              }

              return (
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color={styles.badgeColor}
                >
                  #{entry.rank}
                </Text>
              );
            })();

            return (
              <Flex
                key={entry.id}
                align="center"
                justify="space-between"
                px={4}
                py={3}
                borderRadius="20px"
                bg={styles.containerBg}
                border="1px solid"
                borderColor={styles.containerBorder}
                minH="64px"
              >
                <Flex align="center" gap={3}>
                  <Flex
                    align="center"
                    justify="center"
                    w={12}
                    h={12}
                    borderRadius="full"
                    bg={styles.avatarBg}
                    color={styles.avatarColor}
                    fontWeight="semibold"
                    fontSize="md"
                  >
                    {avatarLabel}
                  </Flex>
                  <Box>
                    <Text
                      color={styles.titleColor}
                      fontWeight={
                        highlight === "default" ? "medium" : "semibold"
                      }
                      fontSize="md"
                    >
                      {entry.name}
                    </Text>
                    <Text color={styles.pointsColor} fontSize="sm">
                      {formatPoints(entry.points)}
                    </Text>
                  </Box>
                </Flex>
                {rightElement}
              </Flex>
            );
          })}
        </Flex>
      </Flex>
    </>
  );
};

export default WallOfFame;

