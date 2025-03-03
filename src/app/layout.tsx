"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { ChakraProvider } from "@chakra-ui/react";
import "@fontsource/jetbrains-mono";
import { system } from "./components/theme";
import NavBar from "./components/ui/NavBar";
import TopBar from "./components/ui/TopBar";
import "./global.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AptosWalletAdapterProvider>
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
