import React from "react";
import Providers from "@/app/components/Providers";
import "@/app/global.css";
import { Box } from "@chakra-ui/react";
import { BottomNavBar } from "./components/BottomNavBar";

export default function TmaLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body>
        <Providers>
          <Box
            bg="black"
            minH="100vh"
            color="white"
            pb="60px" // Add padding to the bottom to avoid content being hidden by the nav bar
          >
            {children}
          </Box>
          <BottomNavBar />
        </Providers>
      </body>
    </html>
  );
}
