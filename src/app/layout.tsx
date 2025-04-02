import "@fontsource/jetbrains-mono";
// Import the polyfill first to ensure it's loaded before any other code
import "./lib/viewTransitionsPolyfill";
import Providers from "./components/Providers";
import "./global.css";
import { Suspense } from "react";
import { Box } from "@chakra-ui/react";
import type { Viewport } from "next";
import { ViewTransitions } from "next-view-transitions";

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
  return (
    <ViewTransitions>
      <html
        style={{
          background: "black",
        }}
        lang="en"
        suppressHydrationWarning={true}
      >
        <body suppressHydrationWarning={true}>
          <Suspense fallback={<Loading />}>
            <Providers>{children}</Providers>
          </Suspense>
        </body>
      </html>
    </ViewTransitions>
  );
}
