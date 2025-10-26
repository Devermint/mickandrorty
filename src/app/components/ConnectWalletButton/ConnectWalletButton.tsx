"use client";
import {
  Button,
  Flex,
  Text,
  Dialog,
  Portal,
  CloseButton,
  useDisclosure,
  FlexProps,
} from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";
import { useAptosWallet } from "@/app/context/AptosWalletContext";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useIsMobile } from "@/app/hooks/useIsMobile";

const WalletMenu = dynamic(() => import("../../hooks/WalletMenu"), {
  ssr: false,
});

export default function ConnectWalletButton({ ...rest }: FlexProps) {
  const { isConnected, isWalletConnected, connect, login } = useAptosWallet();
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile && isWalletConnected && !isConnected) {
      onOpen();
    } else {
      onClose();
    }
  }, [isMobile, isWalletConnected, isConnected]);

  async function handleConnect() {
    try {
      await connect();
    } catch (error) {
      console.error("Connection failed:", error);
    }
  }

  async function handleLogin() {
    try {
      await login();
    } catch (error) {
      console.error("Login failed:", error);
    }
  }

  return (
    <Flex
      {...rest}
      pl={5}
      pr={{ base: 5, md: 0 }}
      w={{ base: "100%", md: "auto" }}
    >
      {isConnected ? (
        <Flex w={{ base: "100%", md: "auto" }}>
          <WalletMenu />
        </Flex>
      ) : (
        <Button
          borderWidth={1}
          onClick={handleConnect}
          borderColor={{ base: "gray.700", md: colorTokens.green.dark }}
          borderRadius={34}
          alignItems="center"
          justifyContent="center"
          px={{ base: 6, md: 6 }}
          py={{ base: 3, md: 3 }}
          bgColor={{ base: colorTokens.green.salad, md: "#E5E5E5" }}
          h="unset"
          w={{ base: "100%", md: "auto" }}
        >
          <Text
            display={{ base: "block", md: "block" }}
            color="black"
            fontWeight={500}
          >
            Connect wallet
          </Text>
        </Button>
      )}

      <Dialog.Root
        open={isOpen}
        onOpenChange={(details) => !details.open && onClose()}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content bg={colorTokens.blackCustom.a1} color="white">
              <Dialog.Header>
                <Dialog.Title>Sign In to Continue</Dialog.Title>
              </Dialog.Header>
              <Dialog.CloseTrigger asChild>
                <CloseButton position="absolute" top="2" right="2" />
              </Dialog.CloseTrigger>
              <Dialog.Body>
                <Text>
                  To complete your login, you need to sign a message to verify
                  that you own this wallet. This is a secure step and does not
                  cost any gas fees.
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Flex w="100%" justify="center" gap={4}>
                  <Button colorScheme="blue" onClick={handleLogin}>
                    Sign to Login
                  </Button>
                  <Button variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                </Flex>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Flex>
  );
}
