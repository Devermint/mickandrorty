import { useCallback, useState } from "react";
import { ChatEntryProps, ChatState } from "@/app/types/message";
import {
  AccountShape,
  WalletClient,
  getAccountAddress,
  VIDEO_FEE_OCTAS,
} from "./useVideoGeneration";

const TWITTER_BROADCAST_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/twitter/broadcast`;

interface UseTwitterPostPosterParams {
  wallet: WalletClient;
  account: AccountShape;
  isConnected: boolean;
  setMessages: React.Dispatch<React.SetStateAction<ChatEntryProps[]>>;
  setChatState: React.Dispatch<React.SetStateAction<ChatState>>;
  agentId?: string;
}

interface PostingPayload {
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

export const useTwitterPostPoster = ({
  wallet,
  account,
  isConnected,
  setMessages,
  setChatState,
  agentId,
}: UseTwitterPostPosterParams) => {
  const [twitterPostInProgressIndex, setTwitterPostInProgressIndex] =
    useState<number | null>(null);

  const handleTwitterPostConfirm = useCallback(
    async ({ post, videoUrl, messageIndex }: PostingPayload) => {
      const postContent = (post ?? "").trim();
      if (!postContent) {
        appendErrorMessage(setMessages, "Twitter post content is empty.");
        return;
      }

      // 1) Check if the agent’s X (Twitter) keys are configured
      try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/agents/${agentId}/twitter/keys/status`,
            { method: "GET", credentials: "include" }
        );

        if (!response.ok) throw new Error("status not ok");

        const json = await response.json();
        if (!json.ok && json.configured === false) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              type: "x_api_prompt",
              content: "X API not connected. If you're the owner, please connect the X API first to post. You can do this via the agent page",
            },
          ]);
          return;
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            type: "x_api_prompt",
            content: "X API not connected. If you're the owner, please connect the X API first to post. You can do this via the agent page",
          },
        ]);
        return;
      }
      // 2) Enforce client-side tweet length (t.co = 23 chars per URL)
      const urlLength = videoUrl ? 23 : 0;
      const approximateLength =
          postContent.length + (urlLength > 0 ? 1 + urlLength : 0);

      if (approximateLength > 280) {
        appendErrorMessage(
            setMessages,
            `X post too long (~${approximateLength}/280). Shorten or remove a hashtag/link.`
        );
        return;
      }

      if (twitterPostInProgressIndex !== null) {
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

      setTwitterPostInProgressIndex(messageIndex);
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

        const broadcastResponse = await fetch(TWITTER_BROADCAST_ENDPOINT, {
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
            "Failed to broadcast Twitter post.";
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
                posted: true,
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
            content: `Twitter post scheduled! Transaction hash: ${paymentHash}`,
          },
        ]);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to post Twitter post.";
        appendErrorMessage(setMessages, message);
      } finally {
        setChatState(ChatState.IDLE);
        setTwitterPostInProgressIndex(null);
      }
    },
    [
      account,
      agentId,
      isConnected,
      setChatState,
      setMessages,
      twitterPostInProgressIndex,
      wallet,
    ]
  );

  return {
    handleTwitterPostConfirm,
    twitterPostInProgressIndex,
  };
};
