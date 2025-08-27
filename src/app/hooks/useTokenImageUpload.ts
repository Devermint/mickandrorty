import { useCallback } from "react";
import { ClientRef, getClientFile } from "@/app/lib/clientImageStore";
import type { ChatEntryProps } from "../types/message";

interface UseTokenImageUploadProps {
  setMessages: React.Dispatch<React.SetStateAction<ChatEntryProps[]>>;
  inputMessage: React.RefObject<HTMLTextAreaElement>;
  onMessageSend: () => void;
}

export const useTokenImageUpload = ({
  setMessages,
  inputMessage,
  onMessageSend,
}: UseTokenImageUploadProps) => {
  const handleTokenImageUploaded = useCallback(
    async (ref: ClientRef) => {
      try {
        const file = getClientFile(ref.id);
        if (!file) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Could not read the selected file. Please try again.",
              type: "error",
            },
          ]);
          return;
        }

        const okTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
        const maxBytes = 5_000_000;
        if (!okTypes.has(file.type)) throw new Error("Unsupported file type.");
        if (file.size === 0) throw new Error("Empty file.");
        if (file.size > maxBytes) throw new Error("File too large.");

        const fd = new FormData();
        fd.append("file", file, file.name || "upload");

        const res = await fetch("/api/upload-image", {
          method: "POST",
          body: fd,
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          throw new Error(errText || `Upload failed with ${res.status}`);
        }

        const json = (await res.json()) as { url?: string };
        if (!json?.url)
          throw new Error("Upload succeeded but no URL returned.");

        if (inputMessage.current) {
          inputMessage.current.value = `Here is my token image: ![Image](${json.url})`;
          await onMessageSend();
        }
      } catch (e: any) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: e?.message ?? "Upload failed",
            type: "error",
          },
        ]);
      }
    },
    [onMessageSend, setMessages, inputMessage]
  );

  return { handleTokenImageUploaded };
};
