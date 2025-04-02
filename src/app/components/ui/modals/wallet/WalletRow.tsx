"use client";

import {
  AdapterNotDetectedWallet,
  AdapterWallet,
  WalletItem,
  isInstallRequired,
} from "@aptos-labs/wallet-adapter-react";
import { Box, Button, Text } from "@chakra-ui/react";

interface WalletRowProps {
  wallet: AdapterWallet | AdapterNotDetectedWallet;
  onConnect?: () => void;
}

function WalletRow({ wallet, onConnect }: WalletRowProps) {
  return (
    <WalletItem wallet={wallet} onConnect={onConnect} asChild>
      <Box
        display="flex"
        alignItems="center"
        width="100%"
        px={4}
        py={3}
        gap={4}
        border="1px solid"
        borderColor="gray.200"
        _dark={{ borderColor: "gray.700" }}
        borderRadius="md"
      >
        <Box as={WalletItem.Icon} w={8} h={8} />
        <Text fontSize="lg">{wallet.name}</Text>
        {isInstallRequired(wallet) ? (
          <WalletItem.InstallLink asChild>
            <Button as="a" size="sm" className="wallet-connect-install">
              Install
            </Button>
          </WalletItem.InstallLink>
        ) : (
          <WalletItem.ConnectButton asChild>
            <Button colorScheme="blue" size="sm" className="wallet-connect-button">
              Connect
            </Button>
          </WalletItem.ConnectButton>
        )}
      </Box>
    </WalletItem>
  );
}

export default WalletRow;
