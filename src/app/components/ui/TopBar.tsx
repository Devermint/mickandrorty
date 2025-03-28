import { Box, Button, Flex } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import WalletButton from "../hooks/WalletButton";
import WalletsModal from "./modals/wallet/WalletModal";
import { useAptosWallet } from "@/app/contexts/AptosWalletContext";

export default function TopBar() {
  const [modalState, setModalState] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const { isConnected } = useAptosWallet();

  const handleModalState = (state: boolean) => {
    setModalState(state);
  };

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
    <Flex alignItems="center" justifyContent="space-between" minHeight="50px" py={2}>
      <Box ml="2rem">
        <Link href="/">
          <Image
            src={isMobile ? "/logo-mobile.png" : "/logo.png"}
            alt="logo"
            style={{
              width: isMobile ? "40px" : "200px",
              height: isMobile ? "40px" : "70px",
            }}
            width={isMobile ? 40 : 200}
            height={isMobile ? 40 : 70}
          />
        </Link>
      </Box>
      {isConnected ? (
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
