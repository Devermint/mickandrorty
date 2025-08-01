"use client";

import { useDisclosure } from "@chakra-ui/react";
import { Mobile } from "./Mobile";
import { Desktop } from "./Desktop";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { routes } from "./routes";

export const NavBar = () => {
  const [navButtons, setNavButtons] = useState(routes);
  const pathname = usePathname();
  const router = useTransitionRouter();
  const { open, onToggle } = useDisclosure();

  const handleButtonClick = (id: string) => {
    navButtons.forEach((button) => {
      button.active = button.text === id;
    });

    const targetIndex = navButtons.findIndex((button) => button.text === id);
    router.push(navButtons[targetIndex].page);
    onToggle();
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
    <>
      <Mobile
        open={open}
        onToggle={onToggle}
        navButtons={navButtons}
        handleButtonClick={handleButtonClick}
      />
      <Desktop navButtons={navButtons} handleButtonClick={handleButtonClick} />
    </>
  );
};
