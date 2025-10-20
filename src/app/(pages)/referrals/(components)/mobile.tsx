"use client";
import { colorTokens } from "@/app/components/theme/theme";
import { Flex, Tabs } from "@chakra-ui/react";
import { Task } from "../page";
import MobileHeader from "./mobileHeader";
import Tasks from "./tasks";
import Referrals from "./referrals";
import { useState } from "react";
import { Referral } from "@/app/types/user";
import Leaderboard from "./leaderboard";
import { LeaderboardResponse } from "@/app/types/leaderboard";

const TABS = ["Tasks", "Refferals", "Leaderboard"];

export interface MobileReferralsViewProps {
  tasks?: Task[];
  score: number;
  referalLink: string;
  referrals: Referral[];
  leaderboard: LeaderboardResponse | null;
}
export default function MobileReferralsView({
  tasks,
  score,
  referalLink,
  referrals,
  leaderboard,
}: MobileReferralsViewProps) {
  const [value, setValue] = useState<string | null>("tasks");
  const tabStyles = {
    borderRadius: 18,
    h: 7,
    py: 0,
    fontSize: 13,
    _selected: {
      bg: colorTokens.green.salad,
      color: colorTokens.green[700],
    },
    color: colorTokens.gray.platinum,
  };

  const getHeaderImage = () => {
    if (value === "tasks") return "/img/tasks-bg.webp";
    if (value === "referrals") return "/img/referrals-bg.webp";
    else return "/img/leaderboard-bg.webp";
  };

  const getHeaderText = () => {
    if (value === "tasks") return "Earn by completing daily tasks";
    if (value === "referrals") return "Earn by inviting friends";
    else return "Stay on top of the charts!";
  };

  return (
    <Flex
      flex={1}
      flexDir="column"
      px={3}
      py={4}
      minW="full"
      maxH="100%"
      h="100%"
      minH={0}
      bg={colorTokens.blackCustom.a0}
      overflowY="auto"
    >
      <MobileHeader
        title={getHeaderText()}
        points={score}
        image={getHeaderImage()}
      />
      <Tabs.Root
        value={value}
        onValueChange={(e) => setValue(e.value)}
        variant="plain"
        fitted
        mt={3}
      >
        <Tabs.List
          minW="100%"
          bgColor={colorTokens.gray.tertiaryAlpha12}
          borderRadius={15}
          h="auto"
          minH="auto"
          alignItems="center"
        >
          <Tabs.Trigger value="tasks" {...tabStyles}>
            Tasks
          </Tabs.Trigger>
          <Tabs.Trigger value="referrals" {...tabStyles}>
            Refferals
          </Tabs.Trigger>

          <Tabs.Trigger value="leaderboard" {...tabStyles}>
            Leaderboard
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tasks">
          <Tasks tasks={tasks ?? []} />
        </Tabs.Content>
        <Tabs.Content value="referrals">
          <Referrals referalLink={referalLink} referrals={referrals} />
        </Tabs.Content>
        <Tabs.Content value="leaderboard">
          <Leaderboard leaderboard={leaderboard} />
        </Tabs.Content>
      </Tabs.Root>
    </Flex>
  );
}
