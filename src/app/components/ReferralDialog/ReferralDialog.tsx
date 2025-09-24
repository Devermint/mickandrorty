"use client";

import { Dialog, Portal, Button, CloseButton, Text, Flex } from "@chakra-ui/react";
import { colorTokens } from "@/app/components/theme/theme";
import ConnectWalletButton from "../ConnectWalletButton/ConnectWalletButton";

interface ReferralDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferralDialog: React.FC<ReferralDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(details) => !details.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg={colorTokens.blackCustom.a1} color="white">
            <Dialog.Header>
              <Dialog.Title>You have been invited!</Dialog.Title>
            </Dialog.Header>
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="2" right="2" />
            </Dialog.CloseTrigger>
            <Dialog.Body>
              <Text>Someone invited you to join Aptos AI Layer! Connect your wallet to begin.</Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Flex w="100%" justify="center">
                <ConnectWalletButton />
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
