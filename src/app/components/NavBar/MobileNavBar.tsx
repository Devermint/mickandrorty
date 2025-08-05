"use client";

import {
  Flex,
  IconButton,
  Icon,
  Box,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { IoClose } from "react-icons/io5";
import { RxHamburgerMenu } from "react-icons/rx";
import { Logo } from "./Logo";
import ConnectWalletButton from "../ConnectWalletButton/ConnectWalletButton";
import NavBarButton from "./NavBarButton";
import { colorTokens } from "../theme";
import { GlobeIcon } from "../icons/globe";
import Link from "next/link";
import { NavButton } from "@/app/types/navBar";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CreateAgentMobile } from "../CreateAgent/CreateAgentMobile";

type Props = {
  navButtons: NavButton[];
  handleButtonClick: (id: string) => void;
};

export const MobileNavBar = ({ navButtons, handleButtonClick }: Props) => {
  const { open, onToggle, onClose } = useDisclosure();
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
  }, [pathname]);

  return (
    <>
      <Flex
        position="sticky"
        top={0}
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        px={6}
        py={2}
        zIndex={50}
        display={{ base: "flex", md: "none" }}
      >
        <IconButton
          bg="none"
          border="none"
          color="gray.700"
          size="2xl"
          justifyContent="start"
          onClick={onToggle}
          aria-label="Toggle menu"
        >
          {open ? (
            <Icon size="2xl" ml={-1}>
              <IoClose />
            </Icon>
          ) : (
            <RxHamburgerMenu />
          )}
        </IconButton>
        <Logo height="44px" />
        <ConnectWalletButton />
      </Flex>

      {open && (
        <Flex
          flexDir="column"
          zIndex={20}
          h="calc(100dvh - 80px)"
          bgColor="black"
          gap={5}
          px={4}
          pt={4}
        >
          {navButtons.map((button, index) => (
            <Box key={index} w="100%">
              <NavBarButton
                text={button.text}
                onClick={handleButtonClick}
                textColor={button.active ? "green.500" : "gray.700"}
                alignItems="start"
                ml={1}
              />
              <Box borderBottom="1px solid" borderColor="gray.700" mt={5} />
            </Box>
          ))}

          <Flex>
            <CreateAgentMobile></CreateAgentMobile>
          </Flex>

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
      )}
    </>
  );
};
