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
import { HowItWorksStepper } from "../HowItWorksStepper/HowItWorksStepper";

const WalletMenu = dynamic(() => import("../../hooks/WalletMenu"), {
  ssr: false,
});

const HOW_IT_WORKS_STEPS = [
  {
    title: "Choose Aptos AI Layer Agent",
    description:
      "Creative, for agent creation, Strategic Agent for news style content, or Meme - each with its own style and purpose.",
  },
  {
    title: "Create Your Agent",
    description:
      "Launch your own AI agent by defining its tone and personality, or use one of the community-created agents available in the ecosystem.",
  },
  {
    title: "Create Content",
    description:
      "Use your agent, a community-created one, or an ecosystem agent to generate posts, images, or videos for X or Telegram.",
  },
  {
    title: "Post & Create Predictions",
    description:
      "Publish your content and choose to create a prediction about its engagement results.",
  },
  {
    title: "Predict & Earn",
    description:
      "Join prediction markets, make forecasts, and earn rewards for accurate predictions.",
  },
  {
    title: "Earn Extra Rewards",
    description:
      "Earn additional rewards by completing tasks and inviting friends through our referral program.",
  },
];

export default function ConnectWalletButton({ ...rest }: FlexProps) {
  const { isConnected, isWalletConnected, connect, login } = useAptosWallet();
  const {
    open: isLoginDialogOpen,
    onOpen: openLoginDialog,
    onClose: closeLoginDialog,
  } = useDisclosure();
  const {
    open: isHowItWorksOpen,
    onOpen: openHowItWorks,
    onClose: closeHowItWorks,
  } = useDisclosure();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile && isWalletConnected && !isConnected) {
      openLoginDialog();
    } else {
      closeLoginDialog();
    }
  }, [
    isMobile,
    isWalletConnected,
    isConnected,
    openLoginDialog,
    closeLoginDialog,
  ]);

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
      flexDir={{ base: "column", md: "row" }}
      gap={{ base: 3, md: 3 }}
    >
      <Button
        variant="outline"
        color="white"
        borderRadius={34}
        px={{ base: 6, md: 6 }}
        py={{ base: 3, md: 3 }}
        bg="transparent"
        h="unset"
        w={{ base: "100%", md: "auto" }}
        onClick={openHowItWorks}
        border={{ base: "1px solid", md: "none" }}
        borderColor={{ base: colorTokens.green.salad, md: "transparent" }}
      >
        How it works
      </Button>
      {isConnected ? (
        <Flex w={{ base: "100%", md: "auto" }}>
          <WalletMenu />
        </Flex>
      ) : (
        <>
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
        </>
      )}

      <Dialog.Root
        open={isLoginDialogOpen}
        onOpenChange={(details) => !details.open && closeLoginDialog()}
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
                  <Button variant="ghost" onClick={closeLoginDialog}>
                    Cancel
                  </Button>
                </Flex>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <HowItWorksStepper
        isOpen={isHowItWorksOpen}
        onClose={closeHowItWorks}
        steps={HOW_IT_WORKS_STEPS}
      />
    </Flex>
  );
}
