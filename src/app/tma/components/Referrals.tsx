"use client";

import React from "react";
import Image from "next/image";
import { Box, Text, Flex, Button, useClipboard } from "@chakra-ui/react";
import { useAptosWallet } from "@/app/context/AptosWalletContext";
import { colorTokens } from "@/app/components/theme/theme";
import { User } from "@/app/context/AptosWalletContext";

interface ReferralsProps {
  user: User | null;
}

export const Referrals: React.FC<ReferralsProps> = ({ user }) => {
  const referralLink = user?.referral_code
    ? `https://dapp.aptoslayer.ai/?referralCode=${user.referral_code}`
    : "";
};
