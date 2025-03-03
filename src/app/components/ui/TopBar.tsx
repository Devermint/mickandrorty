"use client";

import { Box, Button, Flex } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";
import WalletButton from "../hooks/WalletButton";
import WalletsModal from "./modals/wallet/WalletModal";

export default function TopBar() {
  const { connected } = useWallet();
  const [modalState, setModalState] = useState(false);

  const handleModalState = (state: boolean) => {
    setModalState(state);
  };

  useEffect(() => {
    console.log("Wallet connection status:", connected);
  }, [connected]);

  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Box mt="1rem" ml="2rem">
        <Link href="/">
          <Image src="/logo.png" alt="logo" width={200} height={60} />
        </Link>
      </Box>
      {connected ? (
        <Box mr="2rem">
          <WalletButton handleModalOpen={() => handleModalState(false)} />
        </Box>
      ) : (
        <>
          <WalletsModal
            handleClose={() => handleModalState(false)}
            modalOpen={modalState}
            networkSupport={undefined}
            modalMaxWidth={undefined}
          />
          <Button mr="2rem" background="#1D3114" onClick={() => handleModalState(true)}>
            Sign in
          </Button>
        </>
      )}
    </Flex>
  );
}
