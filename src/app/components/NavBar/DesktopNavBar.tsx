"use client";

import { Box, Flex } from "@chakra-ui/react";
import { Logo } from "./Logo";
import ConnectWalletButton from "../ConnectWalletButton/ConnectWalletButton";
import NavBarButton from "./NavBarButton";
import { NavButton } from "@/app/types/navBar";
import { colorTokens } from "../theme/theme";

type Props = {
  navButtons: NavButton[];
  handleButtonClick: (id: string) => void;
};

export const DesktopNavBar = ({ navButtons, handleButtonClick }: Props) => (
  <Flex
    // height={20}
    align="center"
    justify="center"
    pt={3}
    pb={2}
    px={{ base: 4, xl: 8 }}
    display={{ base: "none", md: "flex" }}
    w="full"
  >
    <Flex
      align="center"
      w="full"
      maxW="1620px"
      gap={{ base: 6, md: 6, lg: 10, xl: 12 }}
    >
      <Flex align="center" flex="1" minW="0">
        <Logo height="40px" />
      </Flex>
      <Flex flex="2" justify="center" w="full">
        <Flex
          w="full"
          maxW="850px"
          gap={{ base: "2.5rem", xl: "6rem" }}
          bg={colorTokens.gray.tertiaryDark}
          borderRadius={22}
          px={{ base: 10, md: 12, lg: 16, xl: 24 }}
        >
          {navButtons.map((button, index) => (
            <NavBarButton
              key={index}
              text={button.text}
              onClick={handleButtonClick}
              textColor={button.active ? "#E5E5E5" : "#575757"}
              isActive={button.active}
            />
          ))}
        </Flex>
      </Flex>
      <Flex align="center" justify="flex-end" flex="1" minW="0">
        <ConnectWalletButton />
      </Flex>
    </Flex>
  </Flex>
);
