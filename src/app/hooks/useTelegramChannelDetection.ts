"use client";

import { useCallback } from "react";
import type {
  ChatEntryProps,
  TelegramChannelDetectionResult,
} from "../types/message";

interface UseTelegramChannelDetectionProps {
  setMessages: React.Dispatch<React.SetStateAction<ChatEntryProps[]>>;
  inputMessage: React.RefObject<HTMLTextAreaElement>;
  onMessageSend: () => void | Promise<void>;
}

export const useTelegramChannelDetection = ({
  setMessages,
  inputMessage,
  onMessageSend,
}: UseTelegramChannelDetectionProps) => {
  const handleChannelsDetected = useCallback(
    async ({ channels }: TelegramChannelDetectionResult) => {
      const target = inputMessage.current;
      if (!target) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Could not access the input area to share the detected channels. Please try again.",
            type: "error",
          },
        ]);
        return;
      }

      const channelLines =
        channels.length > 0
          ? channels.map((channel) => {
              const label =
                channel.title ??
                (channel.username ? `@${channel.username}` : null) ??
                channel.chatId.toString();
              return `- ${label} — ID: ${channel.chatId} (${channel.type})`;
            })
          : [
              "- No channels detected. The bot may not yet be an administrator of any channels.",
            ];

      target.value = [
        "Here are the Telegram channels connected to our bot:",
        ...channelLines,
      ].join("\n");

      await Promise.resolve(onMessageSend());
    },
    [inputMessage, onMessageSend, setMessages]
  );

  return { handleChannelsDetected };
};
