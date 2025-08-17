"use client";
import { Button, Flex, Text } from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";
import { WalletIcon } from "../icons/wallet";
import { useAptosWallet } from "@/app/context/AptosWalletContext";
import { useCallback } from "react";
import dynamic from "next/dynamic";

const WalletMenu = dynamic(() => import("../../hooks/WalletMenu"), {
  // loading: () => (
  //   <Button mr="2rem" background="#1D3114">
  //     Loading...
  //   </Button>
  // ),
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
          borderWidth={1}
          onClick={handleConnect}
          borderColor={{ base: "gray.700", md: colorTokens.green.dark }}
          borderRadius={6}
          alignItems="center"
          justifyContent="center"
          px={6}
          py={{ base: 2, md: 3 }}
          bgColor={{ base: "transparent", md: colorTokens.blackCustom.a2 }}
          h="unset"
        >
          <Text display={{ base: "none", md: "block" }}>Connect wallet</Text>
          <WalletIcon w={5} color={colorTokens.green.erin} />
        </Button>
      )}
    </Flex>
  );
}
