"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "./theme";
import NavBar from "./ui/NavBar";
import TopBar from "./ui/TopBar";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <AptosWalletAdapterProvider>
        <TopBar />
        {children}
        <NavBar />
      </AptosWalletAdapterProvider>
    </ChakraProvider>
  );
}
