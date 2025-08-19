"use client";

import { Button, FileUpload } from "@chakra-ui/react";
import { useEffect, useMemo, useRef } from "react";
import { useFileUploadContext } from "@chakra-ui/react";
import { ClientRef, putClientFile } from "@/app/lib/clientImageStore";
import { LuFileImage } from "react-icons/lu";
import { colorTokens } from "../theme/theme";

export function ImageUpload({
  onUploaded,
}: {
  onUploaded: (ref: ClientRef) => void;
}) {
  return (
    <FileUpload.Root
      accept={["image/png", "image/jpeg", "image/webp"]}
      maxFiles={1}
      maxFileSize={2 * 1024 * 1024}
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
      <UploaderEffect onUploaded={onUploaded} />
      {/* your preview component if any */}
    </FileUpload.Root>
  );
}

function UploaderEffect({
  onUploaded,
}: {
  onUploaded: (ref: ClientRef) => void;
}) {
  const { acceptedFiles } = useFileUploadContext();
  const file = acceptedFiles[0];

  const fileKey = useMemo(
    () => (file ? `${file.name}:${file.size}:${file.lastModified}` : ""),
    [file]
  );

  const lastHandledKeyRef = useRef<string | null>(null);
  const onUploadedRef = useRef(onUploaded);
  useEffect(() => {
    onUploadedRef.current = onUploaded;
  }, [onUploaded]);

  useEffect(() => {
    if (!file || !fileKey) return;
    if (lastHandledKeyRef.current === fileKey) return;
    lastHandledKeyRef.current = fileKey;

    const ref = putClientFile(file);
    onUploadedRef.current(ref);
  }, [fileKey, file]);

  return null;
}
