"use client";
import { Box, Flex, FlexProps, Text } from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

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
const MAX_VISIBLE_ROWS = 10;
const ROW_MIN_HEIGHT = 64;
const ROW_GAP_PX = 12;
const SELF_ROW_STICKY_OFFSET = 0;

const LEADERBOARD_DATA: Record<LeaderboardTabKey, LeaderboardEntry[]> = {
  weekly: [
    { id: "weekly-1", name: "Crypto", points: 12800, rank: 1 },
    { id: "weekly-2", name: "Nova", points: 12350, rank: 2 },
    { id: "weekly-3", name: "Orbit", points: 11920, rank: 3 },
    { id: "weekly-4", name: "Specter", points: 11000, rank: 4 },
    { id: "weekly-5", name: "Flux", points: 10300, rank: 5 },
    { id: "weekly-6", name: "Pulse", points: 9800, rank: 6 },
    { id: "weekly-7", name: "Tempo", points: 9120, rank: 7 },
    { id: "weekly-8", name: "Phantom", points: 8660, rank: 8 },
    { id: "weekly-9", name: "Cipher", points: 8320, rank: 9 },
    { id: "weekly-10", name: "Echo", points: 8100, rank: 10 },
    { id: "weekly-11", name: "Glitch", points: 7920, rank: 11 },
    { id: "weekly-12", name: "Vector", points: 7830, rank: 12 },
    { id: "weekly-13", name: "Neon", points: 7780, rank: 13 },
    { id: "weekly-14", name: "OrbitX", points: 7710, rank: 14 },
    { id: "weekly-15", name: "Zenith", points: 7640, rank: 15 },
    { id: "weekly-16", name: "PulseX", points: 7560, rank: 16 },
    { id: "weekly-17", name: "Glyph", points: 7480, rank: 17 },
    { id: "weekly-18", name: "Gamma", points: 7420, rank: 18 },
    { id: "weekly-19", name: "Photon", points: 7350, rank: 19 },
    { id: "weekly-20", name: "Aria", points: 7280, rank: 20 },
    { id: "weekly-21", name: "Helix", points: 7200, rank: 21 },
    { id: "weekly-22", name: "Mosaic", points: 7120, rank: 22 },
    { id: "weekly-23", name: "Quasar", points: 7040, rank: 23 },
    { id: "weekly-24", name: "NovaX", points: 6960, rank: 24 },
    { id: "weekly-25", name: "You", points: 6880, rank: 25, isSelf: true },
  ],
  allTime: [
    { id: "all-1", name: "Crypto", points: 54000, rank: 1 },
    { id: "all-2", name: "Nova", points: 51250, rank: 2 },
    { id: "all-3", name: "Orbit", points: 49820, rank: 3 },
    { id: "all-4", name: "Specter", points: 47210, rank: 4 },
    { id: "all-5", name: "You", points: 46840, rank: 5, isSelf: true },
    { id: "all-6", name: "Flux", points: 46220, rank: 6 },
    { id: "all-7", name: "Pulse", points: 45550, rank: 7 },
    { id: "all-8", name: "Tempo", points: 44980, rank: 8 },
    { id: "all-9", name: "Phantom", points: 43860, rank: 9 },
    { id: "all-10", name: "Cipher", points: 43210, rank: 10 },
    { id: "all-11", name: "Echo", points: 42040, rank: 11 },
    { id: "all-12", name: "Glitch", points: 40510, rank: 12 },
    { id: "all-13", name: "Vector", points: 39980, rank: 13 },
    { id: "all-14", name: "Neon", points: 39200, rank: 14 },
    { id: "all-15", name: "OrbitX", points: 38450, rank: 15 },
    { id: "all-16", name: "Zenith", points: 37920, rank: 16 },
    { id: "all-17", name: "PulseX", points: 37550, rank: 17 },
    { id: "all-18", name: "Glyph", points: 36840, rank: 18 },
    { id: "all-19", name: "Gamma", points: 36020, rank: 19 },
    { id: "all-20", name: "Photon", points: 35440, rank: 20 },
    { id: "all-21", name: "Aria", points: 34810, rank: 21 },
    { id: "all-22", name: "Helix", points: 34220, rank: 22 },
    { id: "all-23", name: "Mosaic", points: 33810, rank: 23 },
    { id: "all-24", name: "Quasar", points: 33090, rank: 24 },
    { id: "all-25", name: "NovaX", points: 32560, rank: 25 },
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
        <Text fontSize="sm" fontWeight="semibold" color={styles.badgeColor}>
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

const WallOfFame = () => {
  const [activeTab, setActiveTab] = useState<LeaderboardTabKey>("weekly");
  const [isSelfPinned, setIsSelfPinned] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const selfRowRef = useRef<HTMLDivElement | null>(null);

  const { displayEntries, selfEntry } = useMemo(() => {
    const sortedEntries = [...LEADERBOARD_DATA[activeTab]].sort(
      (a, b) => a.rank - b.rank
    );
    const topEntries = sortedEntries.slice(0, MAX_VISIBLE_ROWS);
    const foundSelf = sortedEntries.find((entry) => entry.isSelf);
    const isSelfInTop = foundSelf && foundSelf.rank <= MAX_VISIBLE_ROWS;

    return {
      displayEntries:
        isSelfInTop || !foundSelf ? topEntries : [...topEntries, foundSelf],
      selfEntry: foundSelf ?? null,
    };
  }, [activeTab]);

  const totalScore = 123456;

  useEffect(() => {
    const scrollElement = scrollContainerRef.current;
    const selfElement = selfRowRef.current;

    if (!scrollElement || !selfElement || !selfEntry) {
      setIsSelfPinned(false);
      return;
    }

    const updatePinState = () => {
      const containerRect = scrollElement.getBoundingClientRect();
      const selfRect = selfElement.getBoundingClientRect();
      const stickyThreshold = containerRect.top + SELF_ROW_STICKY_OFFSET;
      const shouldPin =
        selfRect.top <= stickyThreshold && selfRect.bottom >= stickyThreshold;
      setIsSelfPinned(shouldPin);
    };

    updatePinState();
    scrollElement.addEventListener("scroll", updatePinState, { passive: true });

    return () => {
      scrollElement.removeEventListener("scroll", updatePinState);
    };
  }, [selfEntry, displayEntries]);

  const stickySelfRow =
    selfEntry && isSelfPinned
      ? (() => {
          const highlight = getHighlightVariant(selfEntry);
          const styles = HIGHLIGHT_STYLES[highlight];
          return (
            <Flex
              key={`${selfEntry.id}-sticky`}
              {...createRowBaseProps(styles)}
              position="sticky"
              top={`${SELF_ROW_STICKY_OFFSET}px`}
              zIndex={3}
            >
              {renderRowBody(selfEntry, highlight, styles)}
            </Flex>
          );
        })()
      : null;

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

        <Flex
          ref={scrollContainerRef}
          flexDirection="column"
          gap={`${ROW_GAP_PX}px`}
          overflowY="auto"
          pr="4px"
          position="relative"
        >
          {stickySelfRow}
          {displayEntries.map((entry) => {
            const highlight = getHighlightVariant(entry);
            const styles = HIGHLIGHT_STYLES[highlight];
            const rowBaseProps = createRowBaseProps(styles);
            const rowBody = renderRowBody(entry, highlight, styles);
            const isSelfRow = Boolean(entry.isSelf);

            return (
              <Flex
                key={entry.id}
                {...rowBaseProps}
                ref={isSelfRow ? selfRowRef : undefined}
                visibility={isSelfRow && isSelfPinned ? "hidden" : "visible"}
                pointerEvents={isSelfRow && isSelfPinned ? "none" : "auto"}
              >
                {rowBody}
              </Flex>
            );
          })}
        </Flex>
      </Flex>
    </>
  );
};

export default WallOfFame;
