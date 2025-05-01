"use client";

import { Box, Button, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState, Suspense, useCallback } from "react";
import dynamic from "next/dynamic";
import { useAptosWallet } from "@/app/contexts/AptosWalletContext";

const WalletMenu = dynamic(() => import("../hooks/WalletMenu"), {
  loading: () => (
    <Button mr="2rem" background="#1D3114">
      Loading...
    </Button>
  ),
  ssr: false,
});

export default function TopBarClient() {
  const [mounted, setMounted] = useState(false);
  const { isConnected, connect } = useAptosWallet();

  const handleConnect = useCallback(async () => {
    try {
      await connect();
      // Optional: Add success feedback here (e.g., toast notification)
    } catch (error) {
      console.error("Connection failed:", error);
      // Optional: Add error feedback here (e.g., toast notification)
      // The connect function in the context already alerts the user if Petra is not found.
    }
  }, [connect]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <Button mr="2rem" background="#1D3114">
          Loading...
        </Button>
      }
    >
      {isConnected ? (
        <Box mr="2rem">
          <WalletMenu />
        </Box>
      ) : (
        <Box mr="2rem">
          <VStack gap={1}>
            <Button background="#1D3114" onClick={handleConnect}>
              Sign in
            </Button>
            <Text fontSize="xs" color="gray.400">
              Requires Petra Wallet
            </Text>
          </VStack>
        </Box>
      )}
    </Suspense>
  );
}
