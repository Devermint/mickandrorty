"use client";

import {
  Flex,
  Text,
  Box,
  IconButton,
  useDisclosure,
  Separator,
  Button,
} from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useMobileBreak } from "../responsive";
import { useTransitionRouter } from "next-view-transitions";
import ConnectWalletButton from "../ConnectWalletButton/ConnectWalletButton";
import Link from "next/link";
import Image from "next/image";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import { colorTokens } from "../theme";
import { GlobeIcon } from "../icons/globe";

const NavButtonsInitial = [
  { active: false, text: "Agents", page: "/agents" },
  { active: false, text: "Chat", page: "/chat" },
  { active: false, text: "About", page: "/about" },
];

type NavBarButtonProps = {
  text: string;
  textColor?: string;
  alignItems?: string;
  ml?: number;
  onClick: (id: string) => void;
};

function NavBarButton(props: NavBarButtonProps) {
  return (
    <Flex
      direction="column"
      alignItems={props.alignItems ?? "center"}
      ml={props.ml}
      cursor="pointer"
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
  const { open, onToggle } = useDisclosure();

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
        <Flex
          position="sticky"
          py={3}
          top={0}
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          px={6}
        >
          <IconButton
            bg="none"
            border="none"
            color="gray.700"
            size="2xl"
            justifyContent="start"
            onClick={onToggle}
          >
            {open ? <CloseIcon boxSize={5} /> : <HamburgerIcon />}
          </IconButton>
          <Link href="https://aptoslayer.ai/">
            <Box maxH="100%">
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
          </Link>
          <ConnectWalletButton />
        </Flex>
      ) : (
        <Flex h="55px" mx="1rem" position="relative" align="center" pt={3}>
          <Flex position="absolute" left={0}>
            <Link href="https://aptoslayer.ai/">
              <Box>
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
            </Link>
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
      )}
      <Flex
        flexDir="column"
        zIndex={20}
        h="calc(100dvh - 88px)"
        top={0}
        left={0}
        bgColor="black"
        display={open ? "flex" : "none"}
        gap={5}
      >
        {navButtons.map((button, index) => (
          <Box key={index} w="100%">
            <NavBarButton
              text={button.text}
              onClick={handleButtonClick}
              textColor={button.active ? "green.500" : "gray.700"}
              alignItems="start"
              ml={5}
            />
            <Separator borderColor="gray.700" mt={5} />
          </Box>
        ))}
        <Flex flexGrow={1} justify="center" alignItems="end">
          <Box
            lineHeight={1.5}
            color={colorTokens.gray.platinum}
            textAlign="center"
            fontSize={13}
            w="85%"
          >
            <span>By messaging Aptos Layer, you agree to our </span>
            <Link href="">
              <Box as="span" color={colorTokens.gray.timberwolf}>
                Terms
              </Box>
            </Link>
            <Box as="span"> and have read our </Box>
            <Link href="" target="_blank">
              <Box as="span" color={colorTokens.gray.timberwolf}>
                Privacy Policy
              </Box>
            </Link>
            <br />
            <Box as="span"> See cookie preferences.</Box>
            <Button
              fontSize={13}
              color={colorTokens.green.darkErin}
              borderRadius={33}
              borderColor={colorTokens.green.dark}
              bg="transparent"
              w="100%"
              gap={3}
              mt={5}
              mb={5}
            >
              <GlobeIcon h="1.5rem" />
              Visit AptosLayerAI
            </Button>
            <span>© Copyrights reserved by blabla 2025</span>
          </Box>
        </Flex>
      </Flex>
    </div>
  );
}
