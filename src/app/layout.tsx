"use client";

import { Inter } from 'next/font/google';

import { ChakraProvider } from "@chakra-ui/react";
import NavBar from './components/ui/NavBar';
import TopBar from './components/ui/TopBar';
import "./global.module.css";
import { system } from './components/theme';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ChakraProvider value={system}>
                    <TopBar />
                    {children}
                    <NavBar />
                </ChakraProvider>
            </body>
        </html>
    );
}
