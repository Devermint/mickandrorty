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

      const channelIds = channels.map((channel) => channel.chatId.toString());
      const channelDetail = channels.map((channel) => ({
        chatId: channel.chatId,
        title: channel.title,
        username: channel.username,
        type: channel.type,
        status: channel.status ?? undefined,
      }));

      const payloadLines: string[] = [
        `telegram_channel_ids: ${JSON.stringify(channelIds)}`,
      ];

      if (channelDetail.length > 0) {
        payloadLines.push(
          `telegram_channels_detail: ${JSON.stringify(channelDetail)}`
        );
      }

      target.value = payloadLines.join("\n");

      await Promise.resolve(onMessageSend());
    },
    [inputMessage, onMessageSend, setMessages]
  );

  return { handleChannelsDetected };
};
