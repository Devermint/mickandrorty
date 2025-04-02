"use client";

import ChevronDownIcon from "@/app/components/icons/chevronDown";
import GlobeIcon from "@/app/components/icons/globe";
import {
  AboutAptosConnect,
  AptosPrivacyPolicy,
  WalletSortingOptions,
  groupAndSortWallets,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { Box, Button, Dialog, Flex, Icon, Stack, Text, useDisclosure } from "@chakra-ui/react";
import AptosConnectWalletRow from "./AptosConnectWalletRow";
import renderEducationScreen from "./RenderEducationScreen";
import WalletRow from "./WalletRow";

export interface WalletConnectorProps extends WalletSortingOptions {
  networkSupport?: string;
  handleNavigate?: () => void;
  /** The max width of the wallet selector modal. Defaults to `xs`. */
  modalMaxWidth?: unknown;
}
interface WalletsModalProps
  extends Pick<WalletConnectorProps, "networkSupport" | "modalMaxWidth">,
    WalletSortingOptions {
  handleClose: () => void;
  modalOpen: boolean;
}

export default function WalletsModal({
  handleClose,
  modalOpen,
  networkSupport,
  ...walletSortingOptions
}: WalletsModalProps): JSX.Element {
  const { open, onToggle } = useDisclosure();
  const { wallets = [] } = useWallet();

  const { aptosConnectWallets, availableWallets, installableWallets } = groupAndSortWallets(
    wallets,
    walletSortingOptions
  );

  const hasAptosConnectWallets = !!aptosConnectWallets.length;

  return (
    <Dialog.Root open={modalOpen} onOpenChange={handleClose}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="#1D3114" borderRadius="2xl" border="1px solid #AFDC296E">
          <Dialog.CloseTrigger />
          <Dialog.Header textAlign="center" pt={4}>
            {hasAptosConnectWallets ? (
              <Stack gap={0}>
                <Text>Log in or sign up</Text>
                <Text>with Social + Aptos Connect</Text>
              </Stack>
            ) : (
              "Connect Wallet"
            )}
          </Dialog.Header>
          <Dialog.Body pb={6}>
            {networkSupport && (
              <Stack direction="row" justify="center" gap={1} mb={4}>
                <Icon as={GlobeIcon} color="gray.500" />
                <Text fontSize="sm" color="gray.500">
                  {networkSupport} only
                </Text>
              </Stack>
            )}

            <AboutAptosConnect renderEducationScreen={renderEducationScreen}>
              {hasAptosConnectWallets && (
                <Stack gap={4} align="stretch">
                  {aptosConnectWallets.map((wallet) => (
                    <AptosConnectWalletRow
                      key={wallet.name}
                      wallet={wallet}
                      onConnect={handleClose}
                    />
                  ))}

                  <Stack direction="row" justify="center" gap={2}>
                    <Text fontSize="sm" color="gray.500">
                      Learn more about
                    </Text>
                    <Text
                      as={AboutAptosConnect.Trigger}
                      color="black"
                      fontSize="sm"
                      _hover={{ color: "gray.500", textDecoration: "underline", cursor: "pointer" }}
                      h="auto"
                    >
                      {`Aptos Connect`}
                    </Text>
                  </Stack>

                  <Box textAlign="center" py={1}>
                    <Text fontSize="xs" lineHeight="5">
                      <AptosPrivacyPolicy.Disclaimer />{" "}
                      <Text
                        as={AptosPrivacyPolicy.Link}
                        fontSize="xs"
                        color="gray.500"
                        _hover={{
                          color: "gray.500",
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                        p={0}
                        h="auto"
                      />
                      .
                    </Text>
                    <Flex
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="center"
                      gap={1}
                      as={AptosPrivacyPolicy.PoweredBy}
                      fontSize="xs"
                      color="gray.500"
                    />
                  </Box>

                  <Box position="relative" py={4}>
                    <Box position="absolute" inset={0} display="flex" alignItems="center">
                      <Box w="full" borderTop="1px" borderColor="gray.200" />
                    </Box>
                    <Box position="relative" display="flex" justifyContent="center">
                      <Text px={2} color="gray.500" fontSize="sm">
                        Or
                      </Text>
                    </Box>
                  </Box>
                </Stack>
              )}

              <Stack gap={4} align="stretch">
                {availableWallets.map((wallet) => (
                  <WalletRow key={wallet.name} wallet={wallet} onConnect={handleClose} />
                ))}

                {!!installableWallets.length && (
                  <>
                    <Button variant="ghost" size="sm" onClick={onToggle}>
                      More Wallets
                      <Icon
                        as={ChevronDownIcon}
                        ml={1}
                        transform={open ? "rotate(180deg)" : "none"}
                        transition="transform 0.2s"
                      />
                    </Button>
                    {open && (
                      <Stack gap={4} align="stretch">
                        {installableWallets.map((wallet) => (
                          <WalletRow key={wallet.name} wallet={wallet} onConnect={handleClose} />
                        ))}
                      </Stack>
                    )}
                  </>
                )}
              </Stack>
            </AboutAptosConnect>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
