import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_BASE_URL = "https://api.telegram.org";

type TelegramChat = {
  id: number;
  type: string;
  title?: string;
  username?: string;
};

type TelegramChatMember = {
  status?: string;
  is_member?: boolean;
};

type TelegramUpdate = {
  update_id: number;
  my_chat_member?: {
    chat: TelegramChat;
    new_chat_member?: TelegramChatMember;
    old_chat_member?: TelegramChatMember;
  };
  chat_member?: {
    chat: TelegramChat;
    new_chat_member?: TelegramChatMember;
  };
  channel_post?: { chat: TelegramChat };
  edited_channel_post?: { chat: TelegramChat };
};

type ChannelRecord = {
  chatId: number;
  type: string;
  title: string | null;
  username: string | null;
  status: string | null;
  isActive: boolean | null;
  description?: string | null;
  inviteLink?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as {
      botToken?: string;
      offset?: number;
      includeGroups?: boolean;
    } | null;

    const botToken = body?.botToken?.trim();
    if (!botToken) {
      return NextResponse.json(
        { error: "Missing Telegram bot token" },
        { status: 400 }
      );
    }

    const params: Record<string, unknown> = {
      allowed_updates: ["my_chat_member", "chat_member", "channel_post", "edited_channel_post"],
      limit: 100,
      timeout: 0,
    };

    if (typeof body?.offset === "number" && Number.isFinite(body.offset)) {
      params.offset = body.offset;
    }

    const updatesResponse = await fetch(
      `${TELEGRAM_BASE_URL}/bot${botToken}/getUpdates`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
        cache: "no-store",
      }
    );

    const updatesPayload = await safeJson<TelegramApiEnvelope<TelegramUpdate[]>>(updatesResponse);
    if (!updatesResponse.ok || !updatesPayload?.ok) {
      return NextResponse.json(
        {
          error: "Telegram API error",
          details: updatesPayload?.description ?? updatesResponse.statusText,
          statusCode: updatesPayload?.error_code ?? updatesResponse.status,
        },
        { status: 502 }
      );
    }

    const updates = Array.isArray(updatesPayload.result) ? updatesPayload.result : [];
    const includeGroups = Boolean(body?.includeGroups);

    const channelsMap = new Map<number, ChannelRecord>();
    let lastUpdateId: number | null = null;

    for (const update of updates) {
      if (typeof update.update_id === "number") {
        lastUpdateId = lastUpdateId === null ? update.update_id : Math.max(lastUpdateId, update.update_id);
      }

      const candidate =
        update.my_chat_member?.chat ??
        update.chat_member?.chat ??
        update.channel_post?.chat ??
        update.edited_channel_post?.chat;

      if (!candidate) continue;

      const isChannel = candidate.type === "channel";
      const isGroup = candidate.type === "supergroup" || candidate.type === "group";

      if (!isChannel && !(includeGroups && isGroup)) continue;

      const membership = update.my_chat_member?.new_chat_member ??
        update.chat_member?.new_chat_member ??
        update.my_chat_member?.old_chat_member ??
        null;

      const status = membership?.status ?? null;
      const isActive = deriveIsActive(membership);

      const existing = channelsMap.get(candidate.id);
      channelsMap.set(candidate.id, {
        chatId: candidate.id,
        type: candidate.type,
        title: candidate.title ?? existing?.title ?? null,
        username: candidate.username ?? existing?.username ?? null,
        status: status ?? existing?.status ?? null,
        isActive: isActive ?? existing?.isActive ?? null,
        description: existing?.description ?? null,
        inviteLink: existing?.inviteLink ?? null,
      });
    }

    const allChannels = Array.from(channelsMap.values());
    const activeChannels = allChannels.filter((channel) => channel.isActive !== false);

    await enrichWithChatDetails(activeChannels, botToken);

    return NextResponse.json({
      channels: activeChannels,
      lastUpdateId,
      updateCount: updates.length,
    });
  } catch (error) {
    console.error("Failed to inspect Telegram bot state", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}

type TelegramApiEnvelope<T> = {
  ok: boolean;
  result: T;
  description?: string;
  error_code?: number;
};

type TelegramChatDetails = {
  id: number;
  type: string;
  title?: string;
  username?: string;
  description?: string;
  invite_link?: string;
};

function deriveIsActive(member: TelegramChatMember | null | undefined): boolean | null {
  if (!member?.status) {
    return null;
  }

  switch (member.status) {
    case "creator":
    case "administrator":
    case "member":
      return true;
    case "restricted":
      if (typeof member.is_member === "boolean") {
        return member.is_member;
      }
      return true;
    case "left":
    case "kicked":
    case "banned":
      return false;
    default:
      return null;
  }
}

async function enrichWithChatDetails(channels: ChannelRecord[], botToken: string) {
  await Promise.all(
    channels.map(async (channel) => {
      try {
        const chatDetailsResponse = await fetch(
          `${TELEGRAM_BASE_URL}/bot${botToken}/getChat`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: channel.chatId }),
            cache: "no-store",
          }
        );

        const chatPayload = await safeJson<TelegramApiEnvelope<TelegramChatDetails>>(chatDetailsResponse);
        if (!chatDetailsResponse.ok || !chatPayload?.ok) {
          return;
        }

        const details = chatPayload.result;
        channel.title = details.title ?? channel.title;
        channel.username = details.username ?? channel.username;
        channel.description = details.description ?? channel.description ?? null;
        channel.inviteLink = details.invite_link ?? channel.inviteLink ?? null;
      } catch (error) {
        console.warn(`Failed to load chat details for ${channel.chatId}`, error);
      }
    })
  );
}

async function safeJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch (error) {
    console.warn("Failed to parse JSON from Telegram API", error);
    return null;
  }
}
