import { useCallback } from "react";
import { ChatEntryProps, ChatState } from "@/app/types/message";

export const VIDEO_FEE_OCTAS = 10_000_000n; // 0.1 APT
const VIDEO_PAYMENT_VERIFY_ENDPOINT = "/api/video/payments/verify";

export type WalletClient =
  | {
      signAndSubmitTransaction: (
        ...args: any[]
      ) => Promise<{ hash?: string; transactionHash?: string }>;
    }
  | null
  | undefined;

export type AccountShape =
  | {
      address?:
        | string
        | {
            toString: () => string;
          };
    }
  | null
  | undefined;

interface UseVideoGenerationParams {
  wallet: WalletClient;
  account: AccountShape;
  isConnected: boolean;
  setMessages: React.Dispatch<React.SetStateAction<ChatEntryProps[]>>;
  setChatState: React.Dispatch<React.SetStateAction<ChatState>>;
}

export const getAccountAddress = (account: AccountShape): string => {
  if (!account) return "";

  const address = account.address;
  if (!address) return "";

  if (typeof address === "string") {
    return address;
  }

  if (typeof address.toString === "function") {
    return address.toString();
  }

  return "";
};

const appendErrorMessage = (
  setMessages: React.Dispatch<React.SetStateAction<ChatEntryProps[]>>,
  content: string
) => {
  setMessages((prev) => [
    ...prev,
    { role: "assistant", content, type: "error" },
  ]);
};

export const useVideoGeneration = ({
  wallet,
  account,
  isConnected,
  setMessages,
  setChatState,
}: UseVideoGenerationParams) => {
  const handleVideoGenerationRequest = useCallback(
    async (prompt: string | undefined) => {
      const promptToUse = (prompt ?? "").trim();
      if (!promptToUse) {
        return;
      }

      const senderAddress = getAccountAddress(account);

      if (!wallet || !senderAddress || !isConnected) {
        appendErrorMessage(
          setMessages,
          "Wallet not connected. Please connect your wallet to pay 0.1 APT before generating a video."
        );
        return;
      }

      setChatState(ChatState.PROCESSING);

      let paymentHash: string | undefined;
      try {
        const paymentResult = await wallet.signAndSubmitTransaction({
          data: {
            function: "0x1::coin::transfer",
            typeArguments: ["0x1::aptos_coin::AptosCoin"],
            functionArguments: [
              process.env.NEXT_PUBLIC_TRANSACTIONS_WALLET,
              VIDEO_FEE_OCTAS.toString(),
            ],
          },
        });

        paymentHash = paymentResult?.hash ?? paymentResult?.transactionHash;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Payment failed or was rejected.";
        appendErrorMessage(setMessages, `Payment failed: ${message}`);
        setChatState(ChatState.IDLE);
        return;
      }

      if (!paymentHash) {
        appendErrorMessage(
          setMessages,
          "Payment completed but transaction hash is missing."
        );
        setChatState(ChatState.IDLE);
        return;
      }

      try {
        const verifyResponse = await fetch(VIDEO_PAYMENT_VERIFY_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tx_hash: paymentHash }),
        } as RequestInit);

        let verifyBody: unknown;
        try {
          verifyBody = await verifyResponse.json();
        } catch {
          verifyBody = null;
        }

        if (!verifyResponse.ok) {
          const message =
            (verifyBody as { error?: string })?.error ??
            (verifyBody as { message?: string })?.message ??
            "Payment verification failed.";
          throw new Error(message);
        }

        if (
          verifyBody &&
          typeof verifyBody === "object" &&
          (verifyBody as { inserted?: boolean }).inserted === false
        ) {
          appendErrorMessage(
            setMessages,
            "This transaction has already been used for video generation."
          );
          setChatState(ChatState.IDLE);
          return;
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Payment verification failed.";
        appendErrorMessage(setMessages, message);
        setChatState(ChatState.IDLE);
        return;
      }

      try {
        const response = await fetch("/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: promptToUse }),
        } as RequestInit);

        if (!response.ok) {
          throw new Error("Failed to generate video");
        }

        const { jobId } = (await response.json()) as { jobId?: string };
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "",
            type: "video",
            data: { job_id: jobId, prompt: promptToUse },
          },
        ]);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to generate video";
        appendErrorMessage(setMessages, message);
      } finally {
        setChatState(ChatState.IDLE);
      }
    },
    [account, isConnected, setMessages, setChatState, wallet]
  );

  return { handleVideoGenerationRequest };
};
