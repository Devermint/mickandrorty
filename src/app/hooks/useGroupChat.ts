// hooks/useGroupChat.ts
import { useCallback, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { ChatEntryProps } from "@/app/types/message";

interface GroupChatMessage {
  id: string;
  _id?: string;
  content: string;
  timestamp: string;
  user_type: "user" | "agent";
  agent_id?: string;
  type: "text" | "video";
}

interface ServerError {
  message: string;
}

interface JoinSuccessData {
  message: string;
}

type ConnectionStatus =
  | "Disconnected"
  | "Connecting..."
  | "Connected"
  | "Connection Failed";

interface UseGroupChatOptions {
  socketUrl?: string;
  enabled?: boolean;
  agentId?: string; // Agent-specific chat rooms
  hasExistingMessages?: boolean; // Add this to prevent loading history when messages exist
  onNewMessage?: (message: ChatEntryProps, isFromHistory?: boolean) => void;
}

export const useGroupChat = (options: UseGroupChatOptions = {}) => {
  const {
    socketUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
    enabled = true,
    agentId,
    hasExistingMessages = false,
    onNewMessage,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("Disconnected");
  const [error, setError] = useState("");

  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const hasLoadedHistory = useRef(false); // Add this flag

  // Socket connection management
  const connect = useCallback(() => {
    if (!enabled || !agentId || socketRef.current) return socketRef.current;

    setConnectionStatus("Connecting...");
    socketRef.current = io(socketUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000, // Connection timeout: 20 seconds
      forceNew: true, // Force new connection each time
      reconnection: true, // Enable auto-reconnection
      reconnectionDelay: 1000, // Wait 1s before reconnecting
      reconnectionAttempts: 5, // Try 5 times
    });

    return socketRef.current;
  }, [socketUrl, enabled, agentId]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus("Disconnected");
    hasLoadedHistory.current = false; // Reset history flag
  }, []);

  // Convert GroupChatMessage to ChatEntryProps
  const convertToChatEntry = useCallback(
    (message: GroupChatMessage): ChatEntryProps => {
      return {
        role: message.user_type === "agent" ? "assistant" : "user",
        content: message.content,
        type: message.type,
        data: {
          isGroupMessage: true,
          userType: message.user_type,
          agentId: message.agent_id,
          messageId: message._id || message.id, // Include unique ID for duplicate checking
          _id: message._id,
        },
      };
    },
    []
  );

  // Socket event handlers
  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setConnectionStatus("Connected");

    const socket = socketRef.current;
    // Only load history if we haven't loaded it AND we don't have existing messages (prevents hot reload duplicates)
    if (
      socket &&
      agentId &&
      !hasLoadedHistory.current &&
      !hasExistingMessages
    ) {
      hasLoadedHistory.current = true;
      socket.emit("join_agent_chat", {
        agent_id: agentId,
        room: `agent_${agentId}`,
      });
    }
  }, [agentId, hasExistingMessages]);

  const handleDisconnect = useCallback(
    (reason: string) => {
      console.log("Disconnected:", reason);
      setIsConnected(false);
      setConnectionStatus("Disconnected");

      // Reset history flag on any disconnect to prevent duplicates on reconnect
      hasLoadedHistory.current = false;

      // Auto-reconnect for certain disconnect reasons (but not manual disconnects)
      if (
        reason === "io server disconnect" ||
        reason === "transport close" ||
        reason === "ping timeout"
      ) {
        setTimeout(() => {
          console.log("Attempting to reconnect...");
          setConnectionStatus("Connecting...");
          connect();
        }, 2000);
      }
    },
    [connect]
  );

  const handleJoinSuccess = useCallback((data: JoinSuccessData) => {
    console.info("Joined agent chat:", data.message);
    setError("");
  }, []);

  const handleServerError = useCallback((data: ServerError) => {
    setError(data.message || "An error occurred");
  }, []);

  const handleMessageHistory = useCallback(
    (message: GroupChatMessage) => {
      const chatEntry = convertToChatEntry(message);
      onNewMessage?.(chatEntry, true);
    },
    [convertToChatEntry, onNewMessage]
  );

  const handleNewMessage = useCallback(
    (message: GroupChatMessage) => {
      const chatEntry = convertToChatEntry(message);
      onNewMessage?.(chatEntry, false);
    },
    [convertToChatEntry, onNewMessage]
  );

  const handleConnectionError = useCallback(() => {
    setError("Failed to connect to group chat");
    setConnectionStatus("Connection Failed");
  }, []);

  // Initialize connection when enabled and agentId is available
  useEffect(() => {
    if (!enabled || !agentId) {
      disconnect();
      return;
    }

    const socket = connect();
    if (!socket) return;

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("join_success", handleJoinSuccess);
    socket.on("error", handleServerError);
    socket.on("message_history", handleMessageHistory);
    socket.on("new_message", handleNewMessage);
    socket.on("connect_error", handleConnectionError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("join_success", handleJoinSuccess);
      socket.off("error", handleServerError);
      socket.off("message_history", handleMessageHistory);
      socket.off("new_message", handleNewMessage);
      socket.off("connect_error", handleConnectionError);
    };
  }, [
    enabled,
    agentId,
    connect,
    handleConnect,
    handleDisconnect,
    handleJoinSuccess,
    handleServerError,
    handleMessageHistory,
    handleNewMessage,
    handleConnectionError,
  ]);

  // Send user message to group chat
  const sendUserMessage = useCallback(
    (content: string) => {
      if (!enabled || !socketRef.current || !content.trim() || !agentId)
        return false;

      socketRef.current.emit("send_user_message", {
        content: content.trim(),
        agent_id: agentId,
        user_type: "user",
      });
      return true;
    },
    [enabled, agentId]
  );

  // Send agent response to group chat (for AI responses)
  const sendAgentMessage = useCallback(
    (content: string) => {
      if (!enabled || !socketRef.current || !content.trim() || !agentId)
        return false;

      socketRef.current.emit("send_agent_message", {
        content: content.trim(),
        agent_id: agentId,
        user_type: "agent",
      });
      return true;
    },
    [enabled, agentId]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionStatus,
    error,
    sendUserMessage,
    sendAgentMessage,
    clearError: useCallback(() => setError(""), []),
  };
};
