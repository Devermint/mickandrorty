"use client";

import { Flex, Box } from "@chakra-ui/react";
import { ReactNode } from "react";
import Footer from "../Footer/Footer";
import { NavBar } from "../NavBar/NavBar";
import { MobileFooter } from "../NavBar/MobileFooter";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: ReactNode;
}

export default function FullHeightLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const showMobileFooter = Boolean(pathname && !pathname.startsWith("/agent/"));

  return (
    <Flex
      minH="100dvh"
      h="100dvh"
      flexDirection="column"
      position="relative"
      overflow="hidden"
      css={{ minHeight: ["-webkit-fill-available", "100dvh"] }}
    >
      <NavBar />

      <Box
        flex="1"
        w="100%"
        minH={0}
        display="flex"
        flexDirection="column"
        minWidth={0}
      >
        {children}
      </Box>
      <Footer />
      {showMobileFooter ? <MobileFooter /> : null}
    </Flex>
  );
}
