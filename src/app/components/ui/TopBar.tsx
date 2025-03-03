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
  const [isMobile, setIsMobile] = useState(false);

  const handleModalState = (state: boolean) => {
    setModalState(state);
  };

  useEffect(() => {
    console.log("Wallet connection status:", connected);
  }, [connected]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);

      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Box mt="1rem" ml="2rem">
        <Link href="/">
          <Image
            src={isMobile ? "/logo-mobile.png" : "/logo.png"}
            alt="logo"
            style={{
              width: isMobile ? "50px" : "200px",
              height: isMobile ? "50px" : "70px",
            }}
            width={isMobile ? 30 : 200}
            height={isMobile ? 30 : 70}
          />
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
