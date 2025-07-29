"use client";
import { Button, Flex } from "@chakra-ui/react";
import { colorTokens } from "../theme";
import { WalletIcon } from "../Icons/wallet";
import { useAptosWallet } from "@/app/context/AptosWalletContext";
import { useCallback } from "react";
import dynamic from "next/dynamic";

const WalletMenu = dynamic(() => import("../../hooks/WalletMenu"), {
  loading: () => (
    <Button mr="2rem" background="#1D3114">
      Loading...
    </Button>
  ),
  ssr: false,
});

export default function ConnectWalletButton() {
  const { isConnected, connect } = useAptosWallet();

  const handleConnect = useCallback(async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Connection failed:", error);
    }
  }, [connect]);

  return (
    <Flex>
      {isConnected ? (
        <WalletMenu />
      ) : (
        <Button
          bgColor={colorTokens.blackCustom.a2}
          onClick={handleConnect}
          fontSize={18}
          borderRadius={6}
          borderColor={colorTokens.green.dark}
          fontWeight={400}
          h="unset"
          px={4}
          py={3}
          lineHeight={1}
        >
          <WalletIcon w={5} />
          Connect wallet
        </Button>
      )}
    </Flex>
  );
}
