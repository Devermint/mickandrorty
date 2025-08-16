"use client";

import { DesktopNavBar } from "./DesktopNavBar";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { routes } from "./routes";
import { MobileNavBar } from "./MobileNavBar";
import { Box } from "@chakra-ui/react";

export const NavBar = () => {
  const [navButtons, setNavButtons] = useState(routes);
  const pathname = usePathname();
  const router = useTransitionRouter();

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
      <MobileNavBar
        navButtons={navButtons}
        handleButtonClick={handleButtonClick}
      />
      <DesktopNavBar
        navButtons={navButtons}
        handleButtonClick={handleButtonClick}
      />
    </Box>
  );
};
