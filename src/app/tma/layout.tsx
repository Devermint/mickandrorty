import React from "react";
import "@/app/global.css";
import { Box } from "@chakra-ui/react";
import { BottomNavBar } from "./components/BottomNavBar";

export default function TmaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Box
        bg="black"
        minH="100vh"
        maxH="100vh"
        color="white"
        pb="60px" // Add padding to the bottom to avoid content being hidden by the nav bar
        overflowY="auto"
      >
        {children}
      </Box>
      <BottomNavBar />
    </>
  );
}
