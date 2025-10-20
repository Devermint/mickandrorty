"use client";

import * as React from "react";
import {
  Box,
  Button,
  HStack,
  IconButton,
  Spinner,
  Text,
  Tooltip as ChakraTooltip,
  Portal,
} from "@chakra-ui/react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { Agent } from "@/app/types/agent";
import { AgentKeysDialog } from "./AgentKeysDialog";
import { useAptosWallet } from "@/app/context/AptosWalletContext";
import { TwitterComposerDialog } from "@/app/components/Agents/AgentComposerDialog";
import { useAuthToken } from "@/app/hooks/useAuth";
import { colorTokens } from "@/app/components/theme/theme";
import { ChatHelperButton } from "@/app/components/Chat/ChatHelperButton";

type Props = {
  agent: Agent;
  apiBase?: string;
  onDraftCreated?: (draftId: string) => void;
};

export function AgentOwnerTwitterActions({
  agent,
  onDraftCreated,
  apiBase: apiBaseProp,
}: Props) {
  const { authHeader, signIn } = useAuthToken();

  const apiBase = apiBaseProp || process.env.NEXT_PUBLIC_API_URL || "";
  const { wallet, account, isConnected, connect } = useAptosWallet();

  const ownerWallet = (agent.wallet || "").toLowerCase();
  const currentWallet = account?.address || "";
  const isOwner =
    !!ownerWallet && !!currentWallet && ownerWallet === currentWallet;

  const [keysOpen, setKeysOpen] = React.useState(false);
  const [keysLoading, setKeysLoading] = React.useState(false);
  const [usageLoading, setUsageLoading] = React.useState(false);
  const [creatingDraft, setCreatingDraft] = React.useState(false);

  const [composerOpen, setComposerOpen] = React.useState(false);
  const [composerDraftId, setComposerDraftId] = React.useState<string | null>(
    null
  );

  const [keys, setKeys] = React.useState<{
    configured: boolean;
    ok: boolean;
    user?: { id?: string; username?: string; name?: string };
    error?: any;
  } | null>(null);

  const [usage, setUsage] = React.useState<{
    sent_today: number;
    daily_cap: number;
    remaining: number;
    reset_epoch: number;
  } | null>(null);

  const refreshKeys = React.useCallback(async () => {
    if (!agent.fa_id) return;
    setKeysLoading(true);
    try {
      const res = await fetch(
        `${apiBase}/agents/${agent.fa_id}/twitter/keys/status`,
        {
          headers: { ...authHeader() },
        }
      );
      const body = await res.json().catch(() => ({}));
      setKeys({
        configured: !!body.configured,
        ok: !!body.ok,
        user: body.user,
        error: body.error,
      });
    } catch {
      setKeys({ configured: false, ok: false, error: "status_fetch_failed" });
    } finally {
      setKeysLoading(false);
    }
  }, [agent.fa_id, apiBase, authHeader]);

  const refreshUsage = React.useCallback(async () => {
    if (!agent.fa_id) return;
    setUsageLoading(true);
    const cacheKey = `twitter_usage_${agent.fa_id}`;
    try {
      // try cache first
      const cached =
        typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.reset_epoch && parsed.reset_epoch * 1000 > Date.now()) {
          setUsage(parsed);
          setUsageLoading(false);
          return;
        }
      }
      const res = await fetch(
        `${apiBase}/agents/${agent.fa_id}/twitter/usage`,
        {
          headers: { ...authHeader() },
        }
      );
      const body = await res.json().catch(() => ({}));
      const next = {
        sent_today: body.sent_today ?? 0,
        daily_cap: body.daily_cap ?? 17,
        remaining: body.remaining ?? 0,
        reset_epoch: body.reset_epoch ?? 0,
      };
      setUsage(next);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(next));
      } catch {
        /* ignore quota */
      }
    } catch {
      setUsage(null);
    } finally {
      setUsageLoading(false);
    }
  }, [agent.fa_id, apiBase, authHeader]);

  React.useEffect(() => {
    if (isOwner) {
      refreshKeys();
      refreshUsage();
    }
  }, [isOwner]);

  async function handleCreatePost() {
    if (!agent.fa_id) return;
    setCreatingDraft(true);
    try {
      const res = await fetch(`${apiBase}/twitter/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ fa_id: agent.fa_id }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.draft_id) return;
      onDraftCreated?.(body.draft_id);
      setComposerDraftId(body.draft_id);
      setComposerOpen(true);
    } finally {
      setCreatingDraft(false);
    }
  }

  if (!isOwner) return null;

  const keysOk = keys?.configured && keys?.ok;
  const quotaDepleted = usage ? usage.remaining <= 0 : false;

  return (
    <HStack w="full" justify="left" mt="3">
      {/*  Keys */}
      <HStack>
        {keysLoading ? (
          <Spinner size="sm" />
        ) : !keysOk ? (
          <>
            <ChatHelperButton
              label={keys?.configured ? "Fix X API keys" : "Add X API keys"}
              onButtonClick={() => setKeysOpen(true)}
            />
          </>
        ) : (
          <></>
        )}
      </HStack>
      {/*  quota info + create post */}
      <HStack>
        <ChatHelperButton
          label={creatingDraft ? <Spinner size="sm" /> : "Post on X"}
          onButtonClick={handleCreatePost}
          disabled={!keysOk || quotaDepleted || creatingDraft}
        />
        <ChakraTooltip.Root positioning={{ placement: "top" }} openDelay={200}>
          <ChakraTooltip.Trigger asChild>
            <IconButton
              aria-label="quota-info"
              size="sm"
              variant={"ghost"}
              rounded={"full"}
              color={colorTokens.gray.timberwolf}
              border={"none"}
              background={"transparent"}
            >
              <AiOutlineInfoCircle />
            </IconButton>
          </ChakraTooltip.Trigger>
          <Portal>
            <ChakraTooltip.Positioner>
              <ChakraTooltip.Content>
                <Text fontSize="sm" whiteSpace="pre-line">
                  {keys?.configured
                    ? `X API connected to @${keys?.user?.username}\n`
                    : "X API keys invalid/not set\n"}
                  {usageLoading || !usage
                    ? "Loading quota…"
                    : `Posts today: ${usage.sent_today}/${
                        usage.daily_cap
                      }\nRemaining posts: ${
                        usage.remaining
                      }\nLimit resets: ${new Date(
                        (usage.reset_epoch || 0) * 1000
                      ).toUTCString()}`}
                </Text>
              </ChakraTooltip.Content>
            </ChakraTooltip.Positioner>
          </Portal>
        </ChakraTooltip.Root>
      </HStack>

      {/* Keys Dialog */}
      <AgentKeysDialog
        faId={agent.fa_id!}
        isOpen={keysOpen}
        onClose={() => setKeysOpen(false)}
        onSaved={() => {
          refreshKeys();
          refreshUsage();
        }}
        apiBase={apiBase}
      />

      {/* Composer Dialog (opens after draft is created) */}
      <TwitterComposerDialog
        faId={agent.fa_id!}
        draftId={composerDraftId || ""}
        isOpen={composerOpen}
        onClose={() => {
          setComposerOpen(false);
          setComposerDraftId(null);
          refreshUsage();
        }}
        apiBase={apiBase}
      />
    </HStack>
  );
}
