"use client";

import { Flex } from "@chakra-ui/react";
import { Logo } from "./Logo";
import ConnectWalletButton from "../ConnectWalletButton/ConnectWalletButton";
import NavBarButton from "./NavBarButton";
import { NavButton } from "@/app/types/navBar";

type Props = {
  navButtons: NavButton[];
  handleButtonClick: (id: string) => void;
};

export const DesktopNavBar = ({ navButtons, handleButtonClick }: Props) => (
  <Flex
    h="100px"
    mx="1rem"
    position="relative"
    align="center"
    pt={3}
    display={{ base: "none", md: "flex" }}
  >
    <Flex position="absolute" left={0}>
      <Logo />
    </Flex>
    <Flex align="center" justify="center" w="100%" gap="1.5rem">
      {navButtons.map((button, index) => (
        <NavBarButton
          key={index}
          text={button.text}
          onClick={handleButtonClick}
          textColor={button.active ? "green.500" : "gray.700"}
        />
      ))}
    </Flex>
    <Flex flexGrow={1} position="absolute" right={0} align="center">
      <ConnectWalletButton />
    </Flex>
  </Flex>
);
