"use client";

import * as React from "react";
import { HStack, Spinner, Text } from "@chakra-ui/react";
import { ChatHelperButton } from "@/app/components/Chat/ChatHelperButton";
import { AgentKeysDialog } from "@/app/components/Agents/AgentKeysDialog";
import { TwitterKeys } from "@/app/lib/utils/agentCreation";

type Props = {
    onSaved?: (data?: TwitterKeys) => void; // you can pass { isConnectAPISuccess: boolean } too
};

export function ConnectXApiInline({ onSaved }: Props) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;

    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [keysOk, setKeysOk] = React.useState<boolean | null>(null);
    const [configured, setConfigured] = React.useState<boolean>(false);

    const verifyKeys = React.useCallback(
        async (keys: TwitterKeys) => {
            setLoading(true);
            try {
                const res = await fetch(`${apiBase}/twitter/keys/verify`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }, // unauthenticated
                    body: JSON.stringify(keys),
                });
                const body = await res.json().catch(() => ({}));
                const ok = !!body.ok;
                setConfigured(true);
                setKeysOk(ok);
                // bubble a compact result for chat flow if you want
                onSaved?.({ ...keys, isConnectAPISuccess: ok });
            } catch {
                setConfigured(true);
                setKeysOk(false);
                onSaved?.({ ...keys, isConnectAPISuccess: false });
            } finally {
                setLoading(false);
            }
        },
        [apiBase, onSaved]
    );

    // dialog will call this with the keys the user entered
    const handleDialogSaved = React.useCallback(
        (keys?: TwitterKeys) => {
            setOpen(false);
            if (!keys) return;
            void verifyKeys(keys);
        },
        [verifyKeys]
    );

    const label =
        loading ? (
            <Spinner size="sm" />
        ) : configured && !keysOk ? (
            "Fix X API keys"
        ) : configured && keysOk ? (
            "X API connected"
        ) : (
            "Add X API keys"
        );

    const disabled = loading || (configured && keysOk === true);

    return (
        <>
            <HStack>
                <ChatHelperButton
                    label={label}
                    onButtonClick={() => setOpen(true)}
                    disabled={!!disabled}
                />
            </HStack>

            <AgentKeysDialog
                isOpen={open}
                onClose={() => setOpen(false)}
                // IMPORTANT: make sure the dialog calls onSaved(keysObject)
                onSaved={handleDialogSaved}
                // You can drop apiBase here if the dialog was previously calling
                // authenticated agent endpoints; now it should just return keys.
                apiBase={apiBase}
            />
        </>
    );
}
