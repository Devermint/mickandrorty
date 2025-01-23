"use client";

import "@fontsource/jetbrains-mono";
import { ChakraProvider } from "@chakra-ui/react";
import NavBar from "./components/ui/NavBar";
import TopBar from "./components/ui/TopBar";
import "./global.css";
import { system } from "./components/theme";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { OKXWallet } from "@okwallet/aptos-wallet-adapter";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const wallets = [new PetraWallet(), new OKXWallet()];
  return (
    <html lang="en">
      <body>
        <AptosWalletAdapterProvider plugins={wallets}>
          <ChakraProvider value={system}>
            <TopBar />
            {children}
            <NavBar />
          </ChakraProvider>
        </AptosWalletAdapterProvider>
      </body>
    </html>
  );
}
