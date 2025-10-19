// components/twitter/TwitterComposerDialog.tsx
import * as React from "react";
import {
    Box, Button, Dialog, Field, HStack, Input, Portal, Spinner, Stack, Text, Textarea, Image, CloseButton,
} from "@chakra-ui/react";
import {useAuthToken} from "@/app/hooks/useAuth";

type MediaItem = {
    media_id: string;
    kind: "image" | "gif" | "video";
    s3_url: string;
    size: number;
    mime: string;
};

type Props = {
    faId: string;
    isOpen: boolean;
    onClose: () => void;
    apiBase?: string;
    draftId?: string;
};
function detectKind(file: File): "image" | "gif" | "video" | "unknown" {
    const t = (file.type || "").toLowerCase();
    if (t.includes("gif")) return "gif";
    if (t.startsWith("video/")) return "video";
    if (t.startsWith("image/")) return "image";
    return "unknown";
}



export function TwitterComposerDialog({ faId, isOpen, onClose, draftId: draftIdProp }: Props) {
    const { authHeader, signIn } = useAuthToken();
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    const [draftId, setDraftId] = React.useState<string | null>(draftIdProp ?? null);

    const [text, setText] = React.useState("");
    const [media, setMedia] = React.useState<MediaItem[]>([]);
    const [busy, setBusy] = React.useState(false);
    const [creating, setCreating] = React.useState(false);
    const [err, setErr] = React.useState<string | null>(null);
    const TCO_URL_LEN = 23;
    function countTwitterChars(text: string) {
        const urlRe = /https?:\/\/\S+/g;
        let len = 0, i = 0;
        for (const m of text.matchAll(urlRe)) {
            const start = m.index ?? 0;
            const end = start + m[0].length;
            len += (start - i);     // plain
            len += TCO_URL_LEN;     // t.co normalized
            i = end;
        }
        len += text.length - i;
        return len;
     }
     const MAX_CHARS = 280;

    const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
    const MAX_GIF_BYTES   = 15 * 1024 * 1024;
    const MAX_VIDEO_BYTES = 512 * 1024 * 1024;
    // create draft on open
    React.useEffect(() => {
        if (!isOpen) return;
        setErr(null);
        setMedia([]);
        setText("");
        setCreating(false);
        setDraftId(draftIdProp ?? null);
    }, [isOpen, draftIdProp]);


    const charCount = countTwitterChars(text);
    const overLimit = charCount > MAX_CHARS;

    function enforceMediaRules(files: File[]) {
        // Only 4 images OR 1 gif/video
        const incomingKinds = files.map(detectKind);
        if (incomingKinds.includes("video") || incomingKinds.includes("gif")) {
            if (media.length > 0) throw new Error("Remove existing media before attaching a video/GIF");
            if (files.length > 1) throw new Error("Only one video/GIF is allowed");
        } else {
            const newCount = media.length + files.length;
            if (newCount > 4) throw new Error("Max 4 images");
        }
    }

    async function attachSelected(files: FileList | null) {
        if (!files || !draftId) return;
        setBusy(true); setErr(null);
        try {
            const arr = Array.from(files);
            enforceMediaRules(arr);

            for (const f of arr) {
                const kind = detectKind(f);
                if (kind === "unknown") throw new Error("Unsupported file type");

                const size = f.size;
                if (kind === "image" && size > MAX_IMAGE_BYTES) throw new Error("Image exceeds 5MB");
                if (kind === "gif" && size > MAX_GIF_BYTES) throw new Error("GIF exceeds 15MB");
                if (kind === "video" && size > MAX_VIDEO_BYTES) throw new Error("Video exceeds 512MB");

                // 1) upload to S3 via server passthrough
                const form = new FormData();
                form.append("file", f);
                const uploadRes = await fetch(`${apiBase}/media/upload?type=${kind === "gif" ? "gif" : kind}`, {
                    method: "POST",
                    headers: { ...authHeader() }, // NO content-type; browser sets boundary
                    body: form,
                });
                const uploadBody = await uploadRes.json().catch(() => ({}));
                if (!uploadRes.ok || !uploadBody?.url) throw new Error("Upload failed");

                // 2) attach to draft (server uploads to X and returns media_id)
                const attachRes = await fetch(`${apiBase}/twitter/draft/${draftId}/attach_media`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...authHeader() },
                    body: JSON.stringify({ fa_id: faId, s3_url: uploadBody.url }),
                });
                const attachBody = await attachRes.json().catch(() => ({}));
                if (!attachRes.ok || !attachBody?.media_id) throw new Error(attachBody?.error || "Attach failed");

                setMedia((m) => [
                    ...m,
                    {
                        media_id: attachBody.media_id,
                        kind: kind,
                        s3_url: uploadBody.url,
                        size: f.size,
                        mime: f.type || "application/octet-stream",
                    },
                ]);
            }
        } catch (e: any) {
            setErr(e?.message || "Attach failed");
        } finally {
            setBusy(false);
            // clear the input value so same file can be re-selected
            const input = document.getElementById("tw-file-input") as HTMLInputElement | null;
            if (input) input.value = "";
        }
    }

    async function removeMedia(mid: string) {
        if (!draftId) return;
        setBusy(true); setErr(null);
        try {
            const res = await fetch(`${apiBase}/twitter/draft/${draftId}/media/${mid}`, {
                method: "DELETE",
                headers: { ...authHeader() },
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok || body?.ok !== true) throw new Error("Remove failed");
            setMedia((m) => m.filter((x) => x.media_id !== mid));
        } catch (e: any) {
            setErr(e?.message || "Remove failed");
        } finally { setBusy(false); }
    }

    async function handlePost() {
        if (!draftId) return;
        setBusy(true); setErr(null);
        try {
            if (overLimit) throw new Error("Text exceeds 280 characters");

            // persist text
            const setRes = await fetch(`${apiBase}/twitter/draft/${draftId}/text`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeader() },
                body: JSON.stringify({ text }),
            });
            const setBody = await setRes.json().catch(() => ({}));
            if (!setRes.ok || setBody?.ok !== true) throw new Error("Failed to set text");

            // post
            const postRes = await fetch(`${apiBase}/twitter/post`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeader() },
                body: JSON.stringify({ draft_id: draftId }),
            });
            const postBody = await postRes.json().catch(() => ({}));
            if (!postRes.ok || postBody?.ok !== true) {
                const msg = postBody?.twitter?.detail || postBody?.error || "Post failed";
                throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
            }

            onClose(); // parent refreshes usage
        } catch (e: any) {
            setErr(e?.message || "Post failed");
        } finally { setBusy(false); }
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => (!e.open ? onClose() : null)} size={{ mdDown: "full", md: "lg" }}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Create Post</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            {creating ? (
                                <HStack><Spinner size="sm" /><Text>Preparing…</Text></HStack>
                            ) : (
                                <Stack gap="4">
                                    <Field.Root>
                                        <Field.Label>Text</Field.Label>
                                        <Textarea
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            rows={5}
                                            placeholder="What’s happening?"
                                        />
                                        <HStack justify="space-between">
                                            <Text fontSize="xs" color={overLimit ? "red.400" : "fg.muted"}>
                                                {charCount}/{MAX_CHARS}
                                            </Text>
                                            {err && <Text fontSize="xs" color="red.400">{err}</Text>}
                                        </HStack>
                                    </Field.Root>

                                    {/* Attach media */}
                                    <Field.Root>
                                        <Field.Label>Media</Field.Label>
                                        <Input id="tw-file-input" type="file" multiple onChange={(e) => attachSelected(e.target.files)} />
                                        <Text fontSize="xs" color="fg.muted">
                                            Up to 4 images or 1 GIF/Video. Limits: image 5MB, GIF 15MB, video 512MB.
                                        </Text>
                                        {/* Preview grid */}
                                        <HStack wrap="wrap" gap="3" mt="2">
                                            {media.map((m) => (
                                                <Box key={m.media_id} position="relative" borderWidth="1px" borderRadius="md" p="1">
                                                    {m.kind === "video" || m.kind === "gif" ? (
                                                        <video
                                                            controls
                                                            preload="metadata"
                                                            crossOrigin="anonymous"
                                                            width="200"
                                                        >
                                                            <source src={m.s3_url} type={m.mime || "video/mp4"} />
                                                        </video>
                                                    ) : (
                                                        <Image src={m.s3_url} alt="" width="200px" height="200px" objectFit="cover" />
                                                    )}
                                                    <CloseButton size="sm" position="absolute" top="1" right="1" onClick={() => removeMedia(m.media_id)} />
                                                </Box>
                                            ))}
                                        </HStack>
                                    </Field.Root>
                                </Stack>
                            )}
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button variant="outline" onClick={onClose} disabled={busy || creating}>Cancel</Button>
                            <Button onClick={handlePost} disabled={busy || creating || overLimit || !draftId} ml="2">
                                {busy ? <Spinner size="sm" /> : "Post"}
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}
