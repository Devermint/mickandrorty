"use client";
import "@fontsource/jetbrains-mono";
import Providers from "./components/Providers";
import "./global.css";

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
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
