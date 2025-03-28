"use client";
import "@fontsource/jetbrains-mono";
import Providers from "./components/Providers";
import "./global.css";
import { useEffect } from "react";

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
      <body suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
