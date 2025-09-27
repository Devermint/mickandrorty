import React from "react";
import Providers from "@/app/components/Providers";
import "@/app/global.css";

export default function TmaLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
