"use client";
import { Box, Button, Flex, FlexProps, Text } from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";
import Image from "next/image";
import { useMemo, useState } from "react";
import type {
  LeaderboardEntry as LeaderboardDataEntry,
  LeaderboardResponse,
} from "@/app/types/leaderboard";

const LEADERBOARD_TABS = [
  { key: "weekly", label: "Weekly" },
  { key: "all_time", label: "All Time" },
] as const;

type LeaderboardTabKey = (typeof LEADERBOARD_TABS)[number]["key"];
type LeaderboardEntry = LeaderboardDataEntry;

type HighlightVariant = "gold" | "silver" | "bronze" | "self" | "default";
const MAX_VISIBLE_ROWS = 10;
const ROW_MIN_HEIGHT = 64;
const ROW_GAP_PX = 12;

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
    containerBg: "linear-gradient(90deg, rgba(115, 88, 29, 0.48) 0%, rgba(20, 15, 5, 0.92) 100%)",
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
    containerBg: "linear-gradient(90deg, rgba(86, 90, 96, 0.44) 0%, rgba(18, 19, 22, 0.92) 100%)",
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
    containerBg: "linear-gradient(90deg, rgba(120, 62, 24, 0.52) 0%, rgba(26, 13, 6, 0.92) 100%)",
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
    containerBg: "linear-gradient(90deg, rgba(9, 32, 15, 0.88) 0%, rgba(6, 24, 10, 0.92) 100%)",
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

type WallOfFameProps = {
  leaderboard: LeaderboardResponse | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
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

const formatPoints = (points: number) => `${points.toLocaleString()} Points`;

const formatOrdinal = (rank: number) => {
  if (rank === 1) {
    return "1st";
  }
  if (rank === 2) {
    return "2nd";
  }
  return "3rd";
};

const createRowBaseProps = (styles: HighlightStyle): FlexProps => ({
  align: "center",
  justify: "space-between",
  px: 4,
  py: 3,
  borderRadius: "20px",
  bg: styles.containerBg,
  border: "1px solid",
  borderColor: styles.containerBorder,
  minH: `${ROW_MIN_HEIGHT}px`,
});

const buildRightElement = (
  entry: LeaderboardEntry,
  highlight: HighlightVariant,
  styles: HighlightStyle
) => {
  if (highlight === "gold" || highlight === "silver" || highlight === "bronze") {
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
        <Text fontSize="sm" fontWeight="semibold" color={styles.badgeColor}>
          {formatOrdinal(entry.rank)}
        </Text>
      </Flex>
    );
  }

  if (highlight === "self") {
    return (
      <Flex
        align="center"
        justify="center"
        w={10}
        h={10}
        borderRadius="999px"
        bg={styles.badgeBg}
        border="1px solid"
        borderColor={styles.badgeBorder}
      >
        <Text fontSize="sm" fontWeight="semibold" color={styles.badgeColor}>
          #{entry.rank}
        </Text>
      </Flex>
    );
  }

  return (
    <Text fontSize="sm" fontWeight="semibold" color={styles.badgeColor}>
      #{entry.rank}
    </Text>
  );
};

const renderRowBody = (
  entry: LeaderboardEntry,
  highlight: HighlightVariant,
  styles: HighlightStyle
) => {
  const avatarLabel = getAvatarLabel(entry.name);
  const rightElement = buildRightElement(entry, highlight, styles);

  return (
    <>
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
            fontWeight={highlight === "default" ? "medium" : "semibold"}
            fontSize="md"
          >
            {entry.isSelf ? "(You) " : ""}
            {entry.name}
          </Text>
          <Text color={styles.pointsColor} fontSize="sm">
            {formatPoints(entry.points)}
          </Text>
        </Box>
      </Flex>
      {rightElement}
    </>
  );
};

const WallOfFame = ({ leaderboard, loading = false, error = null, onRetry }: WallOfFameProps) => {
  const [activeTab, setActiveTab] = useState<LeaderboardTabKey>("weekly");

  const { displayEntries, totalScore } = useMemo(() => {
    const period = leaderboard
      ? activeTab === "weekly"
        ? leaderboard.weekly
        : leaderboard.all_time
      : null;

    const periodEntries = period?.entries ?? [];
    const sortedEntries = [...periodEntries].sort((a, b) => a.rank - b.rank);
    const topEntries = sortedEntries.slice(0, MAX_VISIBLE_ROWS);
    const foundSelf = sortedEntries.find((entry) => entry.isSelf);
    const isSelfInTop = Boolean(foundSelf && foundSelf.rank <= MAX_VISIBLE_ROWS);
    const totalPoints = sortedEntries.reduce((sum, entry) => sum + entry.points, 0);

    const additionalEntries = foundSelf && !isSelfInTop ? [foundSelf] : [];

    return {
      displayEntries: [...topEntries, ...additionalEntries],
      totalScore: totalPoints,
    };
  }, [leaderboard, activeTab]);

  const totalScoreDisplay = leaderboard ? totalScore.toLocaleString() : loading ? "..." : "0";

  const totalScoreLabel = activeTab === "weekly" ? "weekly points" : "lifetime points";

  return (
    <>
      <Box mt={10} w="100%" position="relative" flexShrink={0} borderRadius="24px">
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
          <Text color={colorTokens.gray.timberwolf} fontSize={24} lineHeight={1} fontWeight="bold">
            Wall Of Fame
          </Text>
          <Text fontSize={14} lineHeight={1} color={colorTokens.gray.timberwolf} opacity={0.8}>
            {totalScoreDisplay} {totalScoreLabel}
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
                borderColor={isActive ? "rgba(81, 254, 83, 0.38)" : "transparent"}
                transition="all 0.2s ease"
              >
                {tab.label}
              </Flex>
            );
          })}
        </Flex>

        <Flex flexDirection="column" gap={`${ROW_GAP_PX}px`} pr="4px" position="relative">
          {loading ? (
            <Flex align="center" justify="center" minH={`${ROW_MIN_HEIGHT}px`}>
              <Text color={colorTokens.gray.platinum} fontSize="sm">
                Loading leaderboard...
              </Text>
            </Flex>
          ) : error ? (
            <Flex
              align="center"
              justify="center"
              minH={`${ROW_MIN_HEIGHT}px`}
              direction="column"
              gap={2}
              textAlign="center"
            >
              <Text color={colorTokens.gray.platinum} fontSize="sm">
                {error}
              </Text>
              {onRetry ? (
                <Button
                  size="sm"
                  variant="ghost"
                  color={colorTokens.green.erin}
                  _hover={{ color: colorTokens.green.darkErin }}
                  onClick={onRetry}
                >
                  Try again
                </Button>
              ) : null}
            </Flex>
          ) : displayEntries.length === 0 ? (
            <Flex align="center" justify="center" minH={`${ROW_MIN_HEIGHT}px`}>
              <Text color={colorTokens.gray.platinum} fontSize="sm">
                No leaderboard entries yet.
              </Text>
            </Flex>
          ) : (
            displayEntries.map((entry) => {
              const highlight = getHighlightVariant(entry);
              const styles = HIGHLIGHT_STYLES[highlight];
              const rowBaseProps = createRowBaseProps(styles);
              const rowBody = renderRowBody(entry, highlight, styles);

              return (
                <Flex key={entry.id} {...rowBaseProps}>
                  {rowBody}
                </Flex>
              );
            })
          )}
        </Flex>
      </Flex>
    </>
  );
};

export default WallOfFame;
