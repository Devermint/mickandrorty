"use client";
import "@fontsource/jetbrains-mono";
import Providers from "./components/Providers";
import "./global.css";
import { useEffect } from "react";
import { Suspense } from "react";
import { Box } from "@chakra-ui/react";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Also supported but less commonly used
  // interactiveWidget: 'resizes-visual',
};
// Loading component that matches our dark theme
function Loading() {
  return (
    <Box
      width="100vw"
      height="100vh"
      backgroundColor="#020909"
      position="fixed"
      top="0"
      left="0"
      zIndex={9999}
    />
  );
}

// export const metadata: Metadata = {
//   title: "Aptoslayer.ai",
//   description: "AI Agents Platform",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body suppressHydrationWarning={true}>
        <Suspense fallback={<Loading />}>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
