import { Flex } from "@chakra-ui/react";
import { ReactNode } from "react";
import Footer from "../Footer/Footer";
import { NavBar } from "../NavBar/NavBar";

interface LayoutProps {
  children: ReactNode;
}

export default function FullHeightLayout({ children }: LayoutProps) {
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

      {children}
      <Footer />
    </Flex>
  );
}
