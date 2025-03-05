"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { system } from "./theme";
import NavBar from "./ui/NavBar";
import TopBar from "./ui/TopBar";
import { AptosWalletProvider } from "../contexts/AptosWalletContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        <AptosWalletAdapterProvider>
          <AptosWalletProvider sessionDuration={8 * 60 * 60 * 1000}>
            {" "}
            {/* 8 hour session */}
            <TopBar />
            {children}
            <NavBar />
          </AptosWalletProvider>
        </AptosWalletAdapterProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}
