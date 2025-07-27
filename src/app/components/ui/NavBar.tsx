"use client";

import { Flex, Text, Box } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useMobileBreak } from "../responsive";
import { useTransitionRouter } from "next-view-transitions";
import ConnectWalletButton from "./ConnectWaletButton";
import Link from "next/link";
import Image from "next/image";

const NavButtonsInitial = [
  { active: false, text: "Agents", page: "/agents" },
  { active: false, text: "Chat", page: "/chat" },
  { active: false, text: "About", page: "/about" },
];

type NavBarButtonProps = {
  text: string;
  textColor?: string;
  onClick: (id: string) => void;
};

function NavBarButton(props: NavBarButtonProps) {
  return (
    <Flex
      direction="column"
      alignItems="center"
      cursor="pointer"
      padding="0.6rem"
      onClick={() => props.onClick(props.text)}
    >
      <Text
        userSelect="none"
        fontWeight="400"
        fontSize="14px"
        lineHeight="14px"
        color={props.textColor}
      >
        {props.text}
      </Text>
    </Flex>
  );
}

export default function NavBar() {
  const [navButtons, setNavButtons] = useState(NavButtonsInitial);
  const router = useTransitionRouter();
  const isMobile = useMobileBreak();
  const pathname = usePathname();

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
    <div>
      {isMobile ? (
        <Box position="fixed" bottom="0" width="100%">
          <Flex
            background="#1D311475"
            justify="center"
            borderTopRadius="21px"
            borderTopLeftRadius="28px"
            justifySelf="center"
            gap="1rem"
            width="100%"
          >
            {navButtons.map((button, index) => (
              <NavBarButton
                key={index}
                text={button.text}
                onClick={handleButtonClick}
                textColor={button.active ? "green.500" : "gray.700"}
              />
            ))}
          </Flex>
        </Box>
      ) : (
        <Flex
          h="55px"
          py="5px"
          mx="1rem"
          position="relative"
          background="transparent"
        >
          <Flex position="absolute" left={0} h="100%" maxH="100%">
            <Link href="https://aptoslayer.ai/">
              <Box display={{ base: "none", md: "block" }} maxH="100%">
                <Image
                  src="/logo.png"
                  alt="logo"
                  style={{
                    objectFit: "contain",
                    height: "44px",
                    width: "auto",
                    maxHeight: "100%",
                  }}
                  height={100}
                  width={100}
                />
              </Box>
              <Box display={{ base: "block", md: "none" }}>
                <Image
                  src="/logo-mobile.png"
                  alt="logo"
                  style={{
                    width: "100%",
                    height: "auto",
                  }}
                  width={40}
                  height={40}
                  sizes="40px"
                />
              </Box>
            </Link>
          </Flex>

          <Flex
            align="center"
            justify="center"
            w="100%"
            h="100%"
            padding="0.5rem"
            gap="0.6rem"
          >
            {navButtons.map((button, index) => (
              <NavBarButton
                key={index}
                text={button.text}
                onClick={handleButtonClick}
                textColor={button.active ? "green.500" : "gray.700"}
              />
            ))}
          </Flex>
          <Flex flexGrow={1} position="absolute" right={0} maxH="100%">
            <ConnectWalletButton />
          </Flex>
        </Flex>
      )}
    </div>
  );
}
