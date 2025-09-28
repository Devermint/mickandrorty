"use client";

import React from "react";
import { Box } from "@chakra-ui/react";
import { Referrals } from "../components/Referrals";
import { useAptosWallet } from "@/app/context/AptosWalletContext";

export default function TmaFriendsPage() {
  const { user } = useAptosWallet();
  return (
    <Box>
      <Referrals user={user} />
    </Box>
  );
}
