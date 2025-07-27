"use client";

import { ChakraProvider, Box, Spinner } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { system } from "./theme";
import NavBar from "./ui/NavBar";
import { Suspense, useEffect } from "react";
import Footer from "./ui/Footer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function LoadingSpinner() {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      display="flex"
      alignItems="center"
      justifyContent="center"
      backgroundColor="#020909"
      zIndex={9999}
    >
      <Spinner size="xl" color="#AFDC29" />
    </Box>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "http:" &&
      process.env.NODE_ENV === "production"
    ) {
      window.location.href = window.location.href.replace("http:", "https:");
    }
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        {/* <AptosWalletAdapterProvider> */} {/* 8 hour session */}
        <Suspense fallback={<LoadingSpinner />}>
          <NavBar />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
        {/* </AptosWalletAdapterProvider> */}
        <Footer />
      </ChakraProvider>
    </QueryClientProvider>
  );
}
