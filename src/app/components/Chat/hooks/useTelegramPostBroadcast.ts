import { useCallback, useState } from "react";
import { ChatEntryProps, ChatState } from "@/app/types/message";
import {
  AccountShape,
  WalletClient,
  getAccountAddress,
  VIDEO_FEE_OCTAS,
} from "./useVideoGeneration";

const TELEGRAM_BROADCAST_ENDPOINT = "/api/telegram/broadcast";

interface UseTelegramPostBroadcastParams {
  wallet: WalletClient;
  account: AccountShape;
  isConnected: boolean;
  setMessages: React.Dispatch<React.SetStateAction<ChatEntryProps[]>>;
  setChatState: React.Dispatch<React.SetStateAction<ChatState>>;
  agentId?: string;
}

interface BroadcastPayload {
  post: string;
  videoUrl?: string;
  messageIndex: number;
}

const appendErrorMessage = (
  setMessages: React.Dispatch<React.SetStateAction<ChatEntryProps[]>>,
  content: string
) => {
  setMessages((prev) => [
    ...prev,
    { role: "assistant", content, type: "error" },
  ]);
};

export const useTelegramPostBroadcast = ({
  wallet,
  account,
  isConnected,
  setMessages,
  setChatState,
  agentId,
}: UseTelegramPostBroadcastParams) => {
  const [telegramPostInProgressIndex, setTelegramPostInProgressIndex] =
    useState<number | null>(null);

  const handleTelegramPostConfirm = useCallback(
    async ({ post, videoUrl, messageIndex }: BroadcastPayload) => {
      const postContent = (post ?? "").trim();
      if (!postContent) {
        appendErrorMessage(setMessages, "Telegram post content is empty.");
        return;
      }

      if (telegramPostInProgressIndex !== null) {
        return;
      }

      const transactionsWallet = process.env.NEXT_PUBLIC_TRANSACTIONS_WALLET;
      if (!transactionsWallet) {
        appendErrorMessage(
          setMessages,
          "Transactions wallet is not configured. Please try again later."
        );
        return;
      }

      if (!wallet || !isConnected) {
        appendErrorMessage(
          setMessages,
          "Wallet not connected. Please connect your wallet to pay 0.1 APT before broadcasting."
        );
        return;
      }

      const senderAddress = getAccountAddress(account);
      if (!senderAddress) {
        appendErrorMessage(
          setMessages,
          "Wallet not connected. Please connect your wallet to pay 0.1 APT before broadcasting."
        );
        return;
      }

      setTelegramPostInProgressIndex(messageIndex);
      setChatState(ChatState.PROCESSING);

      try {
        const paymentResult = await wallet
          .signAndSubmitTransaction({
            data: {
              function: "0x1::coin::transfer",
              typeArguments: ["0x1::aptos_coin::AptosCoin"],
              functionArguments: [
                transactionsWallet,
                VIDEO_FEE_OCTAS.toString(),
              ],
            },
          })
          .catch((paymentError: unknown) => {
            const paymentMessage =
              paymentError instanceof Error
                ? `Payment failed: ${paymentError.message}`
                : "Payment failed or was rejected.";
            throw new Error(paymentMessage);
          });

        const paymentHash =
          paymentResult?.hash ?? paymentResult?.transactionHash;

        if (!paymentHash) {
          throw new Error("Payment completed but transaction hash is missing.");
        }

        const payload: Record<string, unknown> = {
          tx_hash: paymentHash,
          agent_id: agentId,
          post: postContent,
        };

        if (videoUrl) {
          payload.video_url = videoUrl;
        }

        const broadcastResponse = await fetch(TELEGRAM_BROADCAST_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const rawBody = await broadcastResponse.text();
        let parsedBody: { error?: string; message?: string } | null = null;
        if (rawBody) {
          try {
            parsedBody = JSON.parse(rawBody);
          } catch {
            parsedBody = null;
          }
        }

        if (!broadcastResponse.ok) {
          const message =
            parsedBody?.error ??
            parsedBody?.message ??
            "Failed to broadcast Telegram post.";
          throw new Error(message);
        }

        setMessages((prev) =>
          prev.map((msg, idx) => {
            if (idx !== messageIndex) {
              return msg;
            }
            const baseData =
              msg.data && typeof msg.data === "object" && msg.data !== null
                ? msg.data
                : {};
            return {
              ...msg,
              data: {
                ...baseData,
                post: postContent,
                broadcasted: true,
                transactionHash: paymentHash,
              },
            };
          })
        );

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            type: "text",
            content: `Telegram post broadcast scheduled! Transaction hash: ${paymentHash}`,
          },
        ]);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to broadcast Telegram post.";
        appendErrorMessage(setMessages, message);
      } finally {
        setChatState(ChatState.IDLE);
        setTelegramPostInProgressIndex(null);
      }
    },
    [
      account,
      agentId,
      isConnected,
      setChatState,
      setMessages,
      telegramPostInProgressIndex,
      wallet,
    ]
  );

  return {
    handleTelegramPostConfirm,
    telegramPostInProgressIndex,
  };
};
