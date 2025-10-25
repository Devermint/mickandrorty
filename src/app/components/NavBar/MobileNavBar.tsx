"use client";

import { Flex, IconButton, Icon, Box, Button, Portal } from "@chakra-ui/react";
import { IoMdClose } from "react-icons/io";
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
import { HamburgerIcon } from "../icons/hamburger";

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
        bg={{ base: colorTokens.blackCustom.a1, md: "transparent" }}
        borderBottom="1px solid"
        borderBottomColor="#333333"
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
            <Icon size="2xl" ml={-1} color={colorTokens.gray.platinum}>
              <IoMdClose />
            </Icon>
          ) : (
            <HamburgerIcon color={colorTokens.gray.platinum} />
          )}
        </IconButton>
        <Logo height="31px" src="/img/new/logo-mobile.webp" />
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
            gap={2}
            pt={2}
            overflowY="auto"
            maxH="calc(100dvh - 64px)"
            borderTop="1px solid"
            borderTopColor="#333333"
          >
            {navButtons.map((button, index) => (
              <Box key={index} w="100%">
                <NavBarButton
                  text={button.text}
                  onClick={handleButtonClick}
                  textColor={
                    button.active
                      ? colorTokens.green.salad
                      : colorTokens.gray.timberwolf
                  }
                  alignItems="start"
                  ml={5}
                />
                <Box
                  borderBottom="1px solid"
                  borderColor={colorTokens.green.dark}
                  mt={2}
                />
              </Box>
            ))}

            <Flex maxH="100%" flexGrow={1} justify="center" alignItems="end">
              {/* <Box
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
                <span>© Copyrights reserved by Aptos AI Layer 2025</span>
              </Box> */}
              <ConnectWalletButton mb={6} />
            </Flex>
          </Flex>
        </Portal>
      )}
    </>
  );
};
