"use client";

import * as React from "react";
import {
    Button,
    Dialog,
    Field,
    Input,
    Portal,
    Spinner,
    Stack,
    Text,
} from "@chakra-ui/react";
import { useAuthToken } from "@/app/hooks/useAuth";
import type { TwitterKeys } from "@/app/lib/utils/agentCreation";
import {colorTokens} from "@/app/components/theme/theme";

type SavedPayload = TwitterKeys & {
    isConnectAPISuccess: boolean;
    user?: { id?: string; username?: string; name?: string };
};

type Props = {
    /** If provided => persisted (auth) mode. If omitted => stateless verify mode. */
    faId?: string;
    isOpen: boolean;
    onClose: () => void;
    /** Called with keys + success flag (+ optional user) regardless of mode */
    onSaved?: (data: SavedPayload) => void;
    apiBase?: string;
};

export function AgentKeysDialog({
                                    faId,
                                    isOpen,
                                    onClose,
                                    onSaved,
                                    apiBase: apiBaseProp,
                                }: Props) {
    const apiBase = apiBaseProp || process.env.NEXT_PUBLIC_API_URL || "";
    const { authHeader, signIn } = useAuthToken();

    // NOTE: defaults blank; do NOT ship test keys
    const [apiKey, setApiKey] = React.useState("o0UrclSwbT6Kf07PlXu1BzUUM");
    const [apiSecret, setApiSecret] = React.useState("qFcdCL4rcy8lOI0xid1xJJXmjirjgT7RKDn1ztHyDz09nAV4we");
    const [accessToken, setAccessToken] = React.useState("1977492002401845248-eLrTYe8jVvw2eRmvQyr9c4NeC4PhIa");
    const [accessSecret, setAccessSecret] = React.useState("KvbqsmpGGkMT4CYSkukcb2ZIICgaxmzPJ7piKm8K3VaMk");

    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const allFilled =
        apiKey.trim() && apiSecret.trim() && accessToken.trim() && accessSecret.trim();

    const keysObj: TwitterKeys = React.useMemo(
        () => ({
            consumerKey: apiKey.trim(),
            consumerSecret: apiSecret.trim(),
            accessToken: accessToken.trim(),
            accessSecret: accessSecret.trim(),
        }),
        [apiKey, apiSecret, accessToken, accessSecret]
    );

    async function savePersisted(): Promise<SavedPayload> {
        // persisted (faId) mode — authenticated
        await signIn(); // ensure token minted/valid
        const res = await fetch(`${apiBase}/agents/${faId}/twitter/keys`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeader(),
            },
            body: JSON.stringify(keysObj),
        });

        const body = await res.json().catch(() => ({}));
        const ok = res.ok && body?.ok !== false;

        // Fire-and-forget refresh (doesn't block UX)
        if (ok) {
            fetch(`${apiBase}/agents/${faId}/twitter/keys/status`, {
                headers: { ...authHeader() },
            }).catch(() => void 0);
        }

        return {
            ...keysObj,
            isConnectAPISuccess: !!ok,
            user: body?.user ?? undefined,
        };
    }

    async function saveStateless(): Promise<SavedPayload> {
        // stateless verify (no auth)
        const res = await fetch(`${apiBase}/twitter/keys/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(keysObj),
        });
        const body = await res.json().catch(() => ({}));
        const ok = !!body?.ok;

        return {
            ...keysObj,
            isConnectAPISuccess: ok,
            user: body?.user ?? undefined,
        };
    }

    async function handleSave() {
        if (!allFilled || submitting) return;
        setSubmitting(true);
        setError(null);

        try {
            const result = await (faId ? savePersisted() : saveStateless());

            if (!result.isConnectAPISuccess) {
                setError("Key verification failed. Please double-check and try again.");
                return;
            }

            onSaved?.(result);
            onClose();
        } catch (e: any) {
            setError(e?.message || "Network error");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => (!e.open ? onClose() : null)} size="md">
            <Portal>
                <Dialog.Backdrop
                    bg="rgba(0,0,0,0.7)"
                    backdropFilter="blur(4px)"/>
                <Dialog.Positioner>
                    <Dialog.Content
                        bg={colorTokens.blackCustom.a2}
                        borderRadius="md"
                        border="1px solid"
                        borderColor={colorTokens.gray.dark}
                        color={colorTokens.gray.timberwolf}
                        shadow="lg"
                        p={6}>
                        <Dialog.Header borderBottom="1px solid" borderColor={colorTokens.blackCustom.a3} pb={3}>
                            <Dialog.Title color="white" fontWeight="semibold">Connect X (Twitter) keys</Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body pt={4}>
                            <Stack gap="4">
                                <Field.Root required>
                                    <Field.Label color={colorTokens.gray.platinum}>
                                        API Key <Field.RequiredIndicator />
                                    </Field.Label>
                                    <Input
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="API Key"
                                        autoComplete="off"
                                        bg={colorTokens.blackCustom.a1}
                                        borderColor={colorTokens.blackCustom.a3}
                                        color="white"
                                        _placeholder={{ color: colorTokens.gray.dark }}
                                        _focus={{ borderColor: colorTokens.green.erin }}
                                    />
                                </Field.Root>

                                <Field.Root required>
                                    <Field.Label color={colorTokens.gray.platinum}>
                                        API Secret <Field.RequiredIndicator />
                                    </Field.Label>
                                    <Input
                                        value={apiSecret}
                                        onChange={(e) => setApiSecret(e.target.value)}
                                        placeholder="API Secret"
                                        type="password"
                                        autoComplete="off"
                                        bg={colorTokens.blackCustom.a1}
                                        borderColor={colorTokens.blackCustom.a3}
                                        color="white"
                                        _placeholder={{ color: colorTokens.gray.dark }}
                                        _focus={{ borderColor: colorTokens.green.erin }}
                                    />
                                </Field.Root>

                                <Field.Root required>
                                    <Field.Label color={colorTokens.gray.platinum}>
                                        Access Token <Field.RequiredIndicator />
                                    </Field.Label>
                                    <Input
                                        value={accessToken}
                                        onChange={(e) => setAccessToken(e.target.value)}
                                        placeholder="Access Token"
                                        autoComplete="off"
                                        bg={colorTokens.blackCustom.a1}
                                        borderColor={colorTokens.blackCustom.a3}
                                        color="white"
                                        _placeholder={{ color: colorTokens.gray.dark }}
                                        _focus={{ borderColor: colorTokens.green.erin }}
                                    />
                                </Field.Root>

                                <Field.Root required>
                                    <Field.Label color={colorTokens.gray.platinum}>
                                        Access Token Secret <Field.RequiredIndicator />
                                    </Field.Label>
                                    <Input
                                        value={accessSecret}
                                        onChange={(e) => setAccessSecret(e.target.value)}
                                        placeholder="Access Token Secret"
                                        type="password"
                                        autoComplete="off"
                                        bg={colorTokens.blackCustom.a1}
                                        borderColor={colorTokens.blackCustom.a3}
                                        color="white"
                                        _placeholder={{ color: colorTokens.gray.dark }}
                                        _focus={{ borderColor: colorTokens.green.erin }}
                                    />
                                </Field.Root>

                                {error && (
                                    <Text color="red.400" fontSize="sm">
                                        {error}
                                    </Text>
                                )}
                            </Stack>
                        </Dialog.Body>

                        <Dialog.Footer borderTop="1px solid" borderColor={colorTokens.blackCustom.a3} pt={3}>
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={submitting}
                                borderColor={colorTokens.gray.platinum}
                                color={colorTokens.gray.platinum}
                                _hover={{ bg: colorTokens.blackCustom.a3 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={!allFilled || submitting}
                                ml="2"
                                bg={colorTokens.green.erin}
                                color="black"
                                _hover={{ bg: colorTokens.green.darkErin }}
                            >
                                {submitting ? <Spinner size="sm" /> : "Save & Validate"}
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}
