import { useAptosWallet } from "@/app/contexts/AptosWalletContext";
import { toaster } from "@/components/ui/toaster";
import { truncateAddress } from "@aptos-labs/wallet-adapter-react";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuTrigger,
  Portal,
  Button,
  Text,
  Flex,
} from "@chakra-ui/react";
import { WalletIcon } from "../icons/wallet";

type WalletMenuProps = {
  handleModalOpen: () => void;
  handleNavigate?: () => void;
};

export default function WalletMenu({
  handleModalOpen,
  handleNavigate,
}: WalletMenuProps): JSX.Element {
  const { isConnected, account, disconnect } = useAptosWallet();

  const onAccountOptionClicked = () => {
    if (handleNavigate) {
      handleNavigate();
    }
  };

  const handleLogout = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const copyAddress = async () => {
    const address = account?.address;
    if (address) {
      await navigator.clipboard.writeText(address.toString());
      toaster.create({
        title: "Copied",
        type: "success",
        duration: 2000,
      });
    } else {
      console.error("Address is undefined");
    }
  };

  if (!isConnected) {
    return (
      <Button size="lg" onClick={handleModalOpen} className="wallet-button" borderRadius="10px">
        <Flex alignItems="center">
          <WalletIcon mr={1} />
          <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            Connect Wallet
          </Text>
        </Flex>
      </Button>
    );
  }

  return (
    <Menu.Root>
      <MenuTrigger asChild>
        <Button size="lg" className="wallet-button" borderRadius="10px">
          <Flex alignItems="center">
            <Text maxW="150px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" ml={2}>
              {truncateAddress(account?.address?.toString() || "") || "Unknown"}
            </Text>
          </Flex>
        </Button>
      </MenuTrigger>
      <Portal>
        <MenuPositioner>
          <MenuContent boxShadow="lg">
            <MenuItem value="copy" onClick={copyAddress} px={4} py={2} _hover={{ bg: "gray.400" }}>
              Copy Address
            </MenuItem>
            {!!handleNavigate && (
              <MenuItem
                value="account"
                onClick={onAccountOptionClicked}
                px={4}
                py={2}
                _hover={{ bg: "whiteAlpha.100" }}
              >
                Account
              </MenuItem>
            )}
            <MenuItem
              value="logout"
              onClick={handleLogout}
              px={4}
              py={2}
              colorScheme="red"
              _hover={{ bg: "red.500" }}
            >
              Logout
            </MenuItem>
          </MenuContent>
        </MenuPositioner>
      </Portal>
    </Menu.Root>
  );
}
