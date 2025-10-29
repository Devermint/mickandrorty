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
        position="relative"
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
            bottom="var(--mobile-footer-height, 0px)"
            zIndex={40}
            bg="black"
            flexDir="column"
            pt={2}
            overflow="hidden"
            borderTop="1px solid"
            borderTopColor="#333333"
          >
            <Box flex="1" overflowY="auto" pr={0}>
              {navButtons.map((button, index) => (
                <Box key={index} w="100%" mb={2}>
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
            </Box>

            <Box
              position="sticky"
              bottom="var(--mobile-footer-height, 0px)"
              bg="black"
              px={5}
              py={4}
            >
              <Flex justify="center">
                <ConnectWalletButton />
              </Flex>
            </Box>
          </Flex>
        </Portal>
      )}
    </>
  );
};
