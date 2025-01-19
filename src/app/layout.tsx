"use client";

import "@fontsource/jetbrains-mono";
import { ChakraProvider } from "@chakra-ui/react";
import NavBar from './components/ui/NavBar';
import TopBar from './components/ui/TopBar';
import "./global.css";
import { system } from './components/theme';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <ChakraProvider value={system}>
                    <TopBar />
                    {children}
                    <NavBar />
                </ChakraProvider>
            </body>
        </html>
    );
}
