"use client";

import { storeUserData } from "@/app/lib/authUtils";
import { AdapterWallet, AptosSignInInput, useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@chakra-ui/react";
// reported bug with loading mui icons with esm, therefore need to import like this https://github.com/mui/material-ui/issues/35233
interface WalletRowProps {
  wallet: AdapterWallet;
  onConnect?: (email: string) => void;
}

function AptosConnectWalletRow({ wallet, onConnect }: WalletRowProps) {
  const { signIn } = useWallet();

  const input = {
    nonce: "...",
    resources: ["aptosconnect.app.email", "aptosconnect.app.name"],
  } satisfies AptosSignInInput;

  const handleSignIn = async () => {
    try {
      const result = await signIn({ walletName: wallet.name, input });
      if (!result) return;
      const email = result.input.resources
        ?.find((resource) => resource.startsWith("aptosconnect.app.email"))
        ?.split(":")
        ?.at(1);
      console.log(result, "result");
      await storeUserData(result.account, wallet, email ?? "");
      if (email) {
        console.log(email, "email");
        onConnect?.(email); // Pass the email to the onConnect callback
      }
    } catch (error) {
      console.error("Sign-in failed:", error);
    }
  };
  return (
    <div>
      <Button
        onClick={handleSignIn}
        _hover={{
          transform: "scale(1.05)",
        }}
        cursor="pointer"
        bg={wallet.name.includes("Google") ? "white" : "gray.900"}
        color={wallet.name.includes("Google") ? "gray.900" : "white"}
        size="lg"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={wallet.icon}
          alt={`${wallet.name} icon`}
          style={{ width: 24, height: 24, marginRight: 8 }}
        />
        Connect with {wallet.name}
      </Button>
    </div>
  );
}

export default AptosConnectWalletRow;
