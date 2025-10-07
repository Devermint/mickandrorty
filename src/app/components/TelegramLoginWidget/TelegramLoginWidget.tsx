"use client";

import { useAptosWallet } from "@/app/context/AptosWalletContext";
import React, { useEffect } from "react";
import { toaster } from "@/components/ui/toaster";

declare global {
  interface Window {
    onTelegramAuth: (user: any) => void;
  }
}

interface TelegramUser {
  id: number;
  first_name: string;
  username: string;
  photo_url: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginWidgetProps {
  onAuthSuccess: () => void;
}

const TelegramLoginWidget: React.FC<TelegramLoginWidgetProps> = ({ onAuthSuccess }) => {
  const { jwt } = useAptosWallet();

  useEffect(() => {
    window.onTelegramAuth = (user: TelegramUser) => {
      if (!jwt) {
        toaster.create({
          type: "error",
          description: "You must be logged in to connect your Telegram account.",
        });
        return;
      }

      fetch("/api/auth/telegram/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": jwt,
        },
        body: JSON.stringify(user),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            toaster.create({
              type: "success",
              description: "Telegram account connected successfully.",
            });
            onAuthSuccess();
          } else {
            toaster.create({
              type: "error",
              description: data.message || "Telegram authentication failed.",
            });
          }
        })
        .catch(() => {
          toaster.create({
            type: "error",
            description: "An error occurred during Telegram authentication.",
          });
        });
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "");
    script.setAttribute("data-size", "medium");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");

    const widgetContainer = document.getElementById("telegram-login-widget");
    if (widgetContainer) {
      // Clear previous script if any
      widgetContainer.innerHTML = "";
      widgetContainer.appendChild(script);
    }

    return () => {
      if (widgetContainer && widgetContainer.contains(script)) {
        widgetContainer.removeChild(script);
      }
      // Clean up the global callback to avoid memory leaks
      window.onTelegramAuth = null as any;
    };
  }, [jwt, onAuthSuccess]);

  return <div id="telegram-login-widget" />;
};

export default TelegramLoginWidget;
