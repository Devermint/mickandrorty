import { Button, Flex } from "@chakra-ui/react";
import { colorTokens } from "../theme";
import { WalletIcon } from "../icons/wallet";

export default function ConnectWalletButton() {
  return (
    <Flex>
      <Button
        bgColor={colorTokens.blackCustom.a2}
        onClick={(e) => {
          e.preventDefault();
          e.nativeEvent.stopImmediatePropagation();
        }}
        fontSize={18}
        borderRadius={6}
        borderColor={colorTokens.green.dark}
        fontWeight={400}
        h="unset"
        px={4}
        py={3}
        lineHeight={1}
        color={colorTokens.green.darkErin}
      >
        <WalletIcon w={5} />
        Connect wallet
      </Button>
    </Flex>
  );
}
