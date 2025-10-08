import { useCallback, useEffect, useMemo, useRef } from "react";
import { useGroupChat } from "@/app/hooks/useGroupChat";
import { ChatEntryProps } from "@/app/types/message";

interface UseChatGroupSyncParams {
  agentId?: string;
  enableGroupChat?: boolean;
  socketUrl?: string;
  messages: ChatEntryProps[];
  setMessages: React.Dispatch<React.SetStateAction<ChatEntryProps[]>>;
}

interface UseChatGroupSyncResult {
  isGroupConnected: boolean;
  groupError: string;
  sendUserMessage: (content: string) => boolean;
  sendAgentMessage: (
    content: string,
    type?: ChatEntryProps["type"],
    data?: unknown
  ) => boolean;
  socket: ReturnType<typeof useGroupChat>["socket"];
  clearGroupError: () => void;
}

const createMessageIdentifier = (message: ChatEntryProps): string => {
  const data = message.data ?? {};
  if (typeof data === "object" && data !== null) {
    if (typeof data.messageId === "string" && data.messageId.length > 0) {
      return data.messageId;
    }
    if (typeof data._id === "string" && data._id.length > 0) {
      return data._id;
    }
    if (typeof data.job_id === "string" && data.job_id.length > 0) {
      return `${message.type ?? "text"}:${data.job_id}`;
    }
  }

  return `${message.role}:${message.type ?? "text"}:${message.content}`;
};

const shouldBroadcastAssistantMessage = (message: ChatEntryProps): boolean => {
  if (message.role !== "assistant") {
    return false;
  }

  if (message.data?.isGroupMessage) {
    return false;
  }

  const allowedTypes = new Set<ChatEntryProps["type"] | undefined>([
    "text",
    "video",
  ]);

  return allowedTypes.has(message.type ?? "text");
};

export const useChatGroupSync = ({
  agentId,
  enableGroupChat = true,
  socketUrl,
  messages,
  setMessages,
}: UseChatGroupSyncParams): UseChatGroupSyncResult => {
  const handleGroupMessage = useCallback(
    (groupMessage: ChatEntryProps) => {
      setMessages((prev) => {
        if (
          groupMessage.type === "video_request" &&
          groupMessage.data?.isGroupMessage &&
          prev.some(
            (msg) =>
              msg.type === "video_request" &&
              !msg.data?.isGroupMessage &&
              (msg.data?.prompt ?? msg.content) ===
                (groupMessage.data?.prompt ?? groupMessage.content)
          )
        ) {
          return prev;
        }

        return [...prev, groupMessage];
      });
    },
    [setMessages]
  );

  const handleMessageUpdate = useCallback(
    (updatedMessage: ChatEntryProps) => {
      setMessages((prev) =>
        prev.map((msg) => {
          const messageId =
            updatedMessage.data?.messageId || updatedMessage.data?._id;
          const currentMessageId = msg.data?.messageId || msg.data?._id;
          if (messageId && currentMessageId === messageId) {
            return { ...msg, ...updatedMessage };
          }
          if (
            updatedMessage.data?.job_id &&
            msg.data?.job_id === updatedMessage.data.job_id
          ) {
            return { ...msg, ...updatedMessage };
          }
          return msg;
        })
      );
    },
    [setMessages]
  );

  const groupChat = useGroupChat({
    socketUrl,
    enabled: enableGroupChat,
    agentId,
    hasExistingMessages: messages.length > 0,
    onNewMessage: handleGroupMessage,
    onMessageUpdate: handleMessageUpdate,
  });

  const { sendAgentMessage, sendUserMessage, socket } = groupChat;

  const broadcastedMessagesRef = useRef<Set<string>>(new Set());
  const lastMessageCountRef = useRef(messages.length);

  useEffect(() => {
    if (!enableGroupChat || !groupChat.isConnected || !agentId) {
      lastMessageCountRef.current = messages.length;
      return;
    }

    const currentCount = messages.length;
    const previousCount = lastMessageCountRef.current;
    lastMessageCountRef.current = currentCount;

    if (currentCount <= previousCount || currentCount === 0) {
      return;
    }

    const newestMessage = messages[currentCount - 1];

    if (!shouldBroadcastAssistantMessage(newestMessage)) {
      return;
    }

    const identifier = createMessageIdentifier(newestMessage);
    if (broadcastedMessagesRef.current.has(identifier)) {
      return;
    }

    const messageData = newestMessage.data;
    if (
      newestMessage.type === "video" &&
      messageData &&
      typeof messageData === "object" &&
      "job_id" in messageData &&
      typeof messageData.job_id === "string"
    ) {
      if (socket) {
        socket.emit("send_agent_message", {
          content: newestMessage.content ?? "",
          agent_id: agentId,
          user_type: "agent",
          type: "video",
          job_id: messageData.job_id,
        });
      }
    } else if (newestMessage.content.trim().length > 0) {
      sendAgentMessage(
        newestMessage.content,
        newestMessage.type,
        newestMessage.data
      );
    }

    broadcastedMessagesRef.current.add(identifier);
    if (broadcastedMessagesRef.current.size > 100) {
      const entries = Array.from(broadcastedMessagesRef.current);
      broadcastedMessagesRef.current = new Set(entries.slice(-50));
    }
  }, [
    agentId,
    enableGroupChat,
    groupChat.isConnected,
    messages,
    sendAgentMessage,
    socket,
  ]);

  const noopSend = useCallback(() => false, []);
  const noopClear = useCallback(() => undefined, []);

  return useMemo(
    () => ({
      isGroupConnected: enableGroupChat ? groupChat.isConnected : false,
      groupError: enableGroupChat ? groupChat.error : "",
      sendUserMessage: enableGroupChat ? sendUserMessage : noopSend,
      sendAgentMessage: enableGroupChat ? sendAgentMessage : noopSend,
      socket: enableGroupChat ? socket : null,
      clearGroupError: enableGroupChat ? groupChat.clearError : noopClear,
    }),
    [
      enableGroupChat,
      groupChat.clearError,
      groupChat.error,
      groupChat.isConnected,
      noopClear,
      noopSend,
      sendAgentMessage,
      sendUserMessage,
      socket,
    ]
  );
};
