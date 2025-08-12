import { toaster } from "@/components/ui/toaster";
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
import { useAptosWallet } from "../context/AptosWalletContext";
import { colorTokens } from "../components/theme/theme";

type WalletMenuProps = {
  handleNavigate?: () => void;
};

// Simple address truncation function
const truncateAddress = (
  address: string | undefined | null,
  length = 4
): string => {
  if (!address) return "Unknown";
  if (address.length <= length * 2 + 2) return address; // Avoid truncating if too short
  return `${address.substring(0, length + 2)}...${address.substring(
    address.length - length
  )}`;
};

export default function WalletMenu({
  handleNavigate,
}: WalletMenuProps): JSX.Element {
  const { account, disconnect } = useAptosWallet();

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

  return (
    <Menu.Root>
      <MenuTrigger asChild>
        <Button
          size={{ base: "sm", md: "xl" }}
          className="wallet-button"
          borderRadius="10px"
          borderColor={colorTokens.green.dark}
        >
          <Flex alignItems="center">
            <Text
              maxW="150px"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              ml={2}
              color={colorTokens.gray.timberwolf}
              fontSize={{ base: "2xs", md: "lg" }}
            >
              {truncateAddress(account?.address?.toString() || "") || "Unknown"}
            </Text>
          </Flex>
        </Button>
      </MenuTrigger>
      <Portal>
        <MenuPositioner>
          <MenuContent boxShadow="lg" bg={colorTokens.gray.platinum}>
            <MenuItem
              value="copy"
              onClick={copyAddress}
              px={4}
              py={2}
              _hover={{ bg: "gray.400" }}
            >
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
