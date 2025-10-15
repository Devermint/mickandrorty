import { useCallback } from "react";
import { ClientRef, getClientFile } from "@/app/lib/clientImageStore";
import type { ChatEntryProps } from "../types/message";
import type { UploadConstraints } from "../types/file";

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
    async (
      ref: ClientRef,
      constraints?: Partial<UploadConstraints>
    ) => {
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

        const acceptedTypes =
          constraints?.accept && constraints.accept.length > 0
            ? constraints.accept
            : ["image/png", "image/jpeg", "image/webp"];
        const okTypes = new Set(
          acceptedTypes.map((item: string) => item.toLowerCase())
        );
        const maxBytes =
          typeof constraints?.maxSizeBytes === "number" &&
          constraints.maxSizeBytes > 0
            ? constraints.maxSizeBytes
            : 2 * 1024 * 1024;
        if (!okTypes.has(file.type.toLowerCase()))
          throw new Error("Unsupported file type.");
        if (file.size === 0) throw new Error("Empty file.");
        if (file.size > maxBytes)
          throw new Error(
            `Image exceeds the ${formatBytes(maxBytes)} limit.`
          );

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

function formatBytes(bytes: number) {
  const thresh = 1024;
  if (bytes < thresh) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let u = -1;
  let value = bytes;
  do {
    value /= thresh;
    ++u;
  } while (value >= thresh && u < units.length - 1);
  const formatted = value.toFixed(value < 10 ? 1 : 0);
  return `${formatted.endsWith(".0") ? formatted.slice(0, -2) : formatted} ${
    units[u]
  }`;
}
