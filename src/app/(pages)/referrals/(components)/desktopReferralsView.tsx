"use client";
import { colorTokens } from "@/app/components/theme/theme";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Task } from "../page";
import MobileHeader from "./mobileReferralsHeader";
import Tasks from "./tasks";
import Referrals from "./referrals";
import { Referral } from "@/app/types/user";
import Leaderboard from "./leaderboard";
import { LeaderboardResponse } from "@/app/types/leaderboard";
import { PointsIcon } from "@/app/components/icons/points";
import { InfoBanner } from "./infoBanner";

export interface Props {
  tasks?: Task[];
  score: number;
  referalLink: string;
  referrals: Referral[];
  leaderboard: LeaderboardResponse | null;
}
export default function DesktopReferralsView({
  tasks,
  score,
  referalLink,
  referrals,
  leaderboard,
}: Props) {
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
    >
      <MobileHeader
        title=""
        points={score}
        image="/img/new/desktop-referrals.webp"
        zIndex={1}
      />

      <Flex gap={4} mt={-20} zIndex={2} flex={1} minH={0}>
        <Flex
          direction="column"
          flex="1"
          minW={0}
          bg="#101010"
          border="1px solid"
          borderColor={colorTokens.gray[300]}
          borderRadius={23}
          p={4}
          minH={0}
        >
          <Flex justifyContent="space-between" mb={5} px={2}>
            <Text fontFamily="inter" fontSize={22} color="white">
              Tasks
            </Text>
            <Flex align="center" gap={2}>
              <PointsIcon w={5} h={5} />
              <Text fontSize={24} fontWeight="medium" color="white">
                {score}
              </Text>
            </Flex>
          </Flex>
          <Box flex="1" minH={0} overflowY="auto" pr={1}>
            <Tasks tasks={tasks ?? []} />
          </Box>
          <Box mt={4}>
            <InfoBanner message="Earn Aptos by completing daily tasks" />
          </Box>
        </Flex>

        <Flex flex="1" minH={0} flexDir="column">
          <Referrals referalLink={referalLink} referrals={[...referrals]} />
        </Flex>

        <Flex
          flex="1"
          minW={0}
          bg="#101010"
          border="1px solid"
          borderColor={colorTokens.gray[300]}
          borderRadius={23}
          p={4}
          direction="column"
          minH={0}
        >
          <Text fontFamily="inter" fontSize={22} color="white" mb={5} px={2}>
            Leaderboard
          </Text>
          <Box flex="1" minH={0} overflowY="auto" pr={1}>
            <Leaderboard leaderboard={leaderboard} />
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
}
