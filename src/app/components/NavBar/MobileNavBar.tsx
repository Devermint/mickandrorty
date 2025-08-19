"use client";

import { Flex, IconButton, Icon, Box, Button, Portal } from "@chakra-ui/react";
import { IoClose } from "react-icons/io5";
import { RxHamburgerMenu } from "react-icons/rx";
import { Logo } from "./Logo";
import ConnectWalletButton from "../ConnectWalletButton/ConnectWalletButton";
import NavBarButton from "./NavBarButton";
import { colorTokens } from "../theme/theme";
import { GlobeIcon } from "../icons/globe";
import Link from "next/link";
import { NavButton } from "@/app/types/navBar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Props = {
  navButtons: NavButton[];
  handleButtonClick: (id: string) => void;
};

export const MobileNavBar = ({ navButtons, handleButtonClick }: Props) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const onToggle = () => setOpen(!open);
  const onClose = () => setOpen(false);

  useEffect(() => {
    if (open) {
      onClose();
    }
  }, [pathname]);

  return (
    <>
      <Flex
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        px={6}
        py={0}
        zIndex={50}
        display={{ base: "flex", md: "none" }}
        bg={{ base: colorTokens.blackCustom.a2, md: "transparent" }}
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
        <Portal>
          <Flex
            position="fixed"
            top={16}
            left={0}
            right={0}
            bottom={0}
            zIndex={25}
            bg="black"
            flexDir="column"
            gap={3}
            pt={3}
            overflowY="auto"
            maxH="calc(100dvh - 64px)"
          >
            {navButtons.map((button, index) => (
              <Box key={index} w="100%">
                <NavBarButton
                  text={button.text}
                  onClick={handleButtonClick}
                  textColor={
                    button.active ? colorTokens.green.erin : "gray.700"
                  }
                  alignItems="start"
                  ml={5}
                />
                <Box
                  borderBottom="1px solid"
                  borderColor={colorTokens.green.dark}
                  mt={3}
                />
              </Box>
            ))}

            <Flex maxH="100%" flexGrow={1} justify="center" alignItems="end">
              <Box
                lineHeight={1.5}
                color={colorTokens.gray.platinum}
                textAlign="center"
                fontSize={13}
                w="85%"
                mb={2}
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
                  borderRadius={33}
                  borderColor={colorTokens.green.dark}
                  bg="transparent"
                  w="100%"
                  mt={5}
                  mb={5}
                  gap={3}
                >
                  <GlobeIcon h="1.5rem" w="1.5rem" />
                  Visit AptosLayerAI
                </Button>
                <span>© Copyrights reserved by blabla 2025</span>
              </Box>
            </Flex>
          </Flex>
        </Portal>
      )}
    </>
  );
};
