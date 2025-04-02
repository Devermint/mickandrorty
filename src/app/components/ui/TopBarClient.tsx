"use client";

import { Box, Button } from "@chakra-ui/react";
import { useEffect, useState, Suspense } from "react";
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

const WalletsModal = dynamic(() => import("./modals/wallet/WalletModal"), {
  ssr: false,
});

export default function TopBarClient() {
  const [modalState, setModalState] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAptosWallet();

  const handleModalState = (state: boolean) => {
    setModalState(state);
  };

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
          <WalletMenu handleModalOpen={() => handleModalState(true)} />
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
    </Suspense>
  );
}
