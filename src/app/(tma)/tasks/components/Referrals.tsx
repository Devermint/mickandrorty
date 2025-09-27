"use client";

import { colorTokens } from "@/app/components/theme/theme";
import { User } from "@/app/context/AptosWalletContext";
import { Box, Button, Text, useClipboard } from "@chakra-ui/react";
import Image from "next/image";
import React from "react";

interface ReferralsProps {
  user: User | null;
}

export const Referrals: React.FC<ReferralsProps> = ({ user }) => {
  const referralLink = user?.referral_code
    ? `https://dapp.aptoslayer.ai/?referralCode=${user.referral_code}`
    : "";
  const clipboard = useClipboard({ value: referralLink });
  const referrals = user?.referral_count ?? 0;

  return (
    <Box p={4}>
      <Box textAlign="center" mb={6}>
        <Text fontSize="lg" color={colorTokens.gray.timberwolf}>
          Your referrals
        </Text>
        <Text color="white" fontSize="4xl" fontWeight="bold">
          {referrals.toLocaleString()}
        </Text>
      </Box>

      <Box
        bg={colorTokens.blackCustom.a2}
        p={5}
        borderRadius="lg"
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" width="120%" height="120%" top="-10%" left="-10%" zIndex={0}>
          <Image
            src="/img/invite-link-bg.webp"
            alt="Invite link backdrop"
            layout="fill"
            objectFit="cover"
          />
        </Box>
        <Box zIndex={1} position="relative" textAlign="center">
          <Text color="white" fontSize="lg" fontWeight="bold">
            Your invite link
          </Text>
          <Text color="white" fontSize="sm" fontWeight={200} title={referralLink}>
            {referralLink}
          </Text>

          <Button
            mt={4}
            borderRadius="full"
            px={8}
            py={2}
            h="auto"
            fontSize="md"
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
            {clipboard.copied ? "Copied" : "Copy link"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
