"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { useAptosWallet } from "@/app/context/AptosWalletContext";
import { colorTokens } from "@/app/components/theme/theme";

export default function TmaHomePage() {
  const { user } = useAptosWallet();
  const score = user?.points ?? 0;
  const referrals = user?.referral_count ?? 0;

  return (
    <Box p={4} textAlign="center">
      <Text fontSize="2xl" fontWeight="bold" color="white" mb={8}>
        Welcome, {user?.telegram_username ?? "User"}!
      </Text>

      <Flex justify="space-around">
        <Box>
          <Text fontSize="3xl" fontWeight="bold" color={colorTokens.green.erin}>
            {score.toLocaleString()}
          </Text>
          <Text color="gray.400">Your Score</Text>
        </Box>
        <Box>
          <Text fontSize="3xl" fontWeight="bold" color={colorTokens.green.erin}>
            {referrals.toLocaleString()}
          </Text>
          <Text color="gray.400">Your Frens</Text>
        </Box>
      </Flex>
    </Box>
  );
}
