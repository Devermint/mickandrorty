"use client";

import { Button, FileUpload, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFileUploadContext } from "@chakra-ui/react";
import { ClientRef, putClientFile } from "@/app/lib/clientImageStore";
import { LuFileImage } from "react-icons/lu";
import { colorTokens } from "../theme/theme";
import type { UploadConstraints } from "@/app/types/file";

export function ImageUpload({
  onUploaded,
  constraints,
}: {
  onUploaded: (ref: ClientRef) => void;
  constraints?: Partial<UploadConstraints>;
}) {
  const accept =
    constraints?.accept && constraints.accept.length > 0
      ? constraints.accept
      : ["image/png", "image/jpeg", "image/webp"];
  const maxFileSize =
    typeof constraints?.maxSizeBytes === "number" && constraints.maxSizeBytes > 0
      ? constraints.maxSizeBytes
      : 2 * 1024 * 1024;
  const [error, setError] = useState<string | null>(null);

  return (
    <FileUpload.Root
      accept={accept}
      maxFiles={1}
      maxFileSize={maxFileSize}
    >
      <FileUpload.HiddenInput />
      <FileUpload.Trigger asChild>
        <Button
          size="sm"
          borderWidth={1}
          borderColor={colorTokens.gray.platinum}
        >
          <LuFileImage /> Upload Image
        </Button>
      </FileUpload.Trigger>
      <UploaderEffect
        onUploaded={onUploaded}
        maxSizeBytes={maxFileSize}
        onError={setError}
      />
      {error && (
        <Text mt={2} fontSize="sm" color="red.300">
          {error}
        </Text>
      )}
      {/* your preview component if any */}
    </FileUpload.Root>
  );
}

function UploaderEffect({
  onUploaded,
  maxSizeBytes,
  onError,
}: {
  onUploaded: (ref: ClientRef) => void;
  maxSizeBytes: number;
  onError: (message: string | null) => void;
}) {
  const { acceptedFiles } = useFileUploadContext();
  const file = acceptedFiles[0];

  const fileKey = useMemo(
    () => (file ? `${file.name}:${file.size}:${file.lastModified}` : ""),
    [file]
  );

  const lastHandledKeyRef = useRef<string | null>(null);
  const onUploadedRef = useRef(onUploaded);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onUploadedRef.current = onUploaded;
  }, [onUploaded]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!file || !fileKey) return;
    if (lastHandledKeyRef.current === fileKey) return;
    lastHandledKeyRef.current = fileKey;

    if (file.size > maxSizeBytes) {
      onErrorRef.current(
        `Image is too large. Max size is ${formatBytes(maxSizeBytes)}.`
      );
      return;
    }

    onErrorRef.current(null);
    const ref = putClientFile(file);
    onUploadedRef.current(ref);
  }, [fileKey, file, maxSizeBytes]);

  return null;
}

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
