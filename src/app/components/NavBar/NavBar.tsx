"use client";

import { DesktopNavBar } from "./DesktopNavBar";
import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { routes } from "./routes";
import { MobileNavBar } from "./MobileNavBar";
import { Box, useDisclosure } from "@chakra-ui/react";
import { useAptosWallet } from "@/app/context/AptosWalletContext";
import { ReferralDialog } from "../ReferralDialog/ReferralDialog";

export const NavBar = () => {
  const [navButtons, setNavButtons] = useState(routes);
  const pathname = usePathname();
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const { isConnected } = useAptosWallet();
  const { open, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const referralCode = searchParams.get("referralCode");
    if (referralCode && !isConnected) {
      onOpen();
    } else {
      onClose();
    }
  }, [searchParams, isConnected, onOpen, onClose]);

  const handleButtonClick = (id: string) => {
    navButtons.forEach((button) => {
      button.active = button.text === id;
    });

    const targetIndex = navButtons.findIndex((button) => button.text === id);
    router.push(navButtons[targetIndex].page);
  };

  useEffect(() => {
    setNavButtons((n) => {
      n.forEach((button) => {
        button.active = button.page === pathname;
      });

      return [...n];
    });
  }, [pathname]);

  return (
    <Box>
      <MobileNavBar navButtons={navButtons} handleButtonClick={handleButtonClick} />
      <DesktopNavBar navButtons={navButtons} handleButtonClick={handleButtonClick} />
      <ReferralDialog isOpen={open} onClose={onClose} />
    </Box>
  );
};
