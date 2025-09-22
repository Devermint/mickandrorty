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
  job_id?: string;
  message?: string
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
  onMessageUpdate?: (message: ChatEntryProps) => void;
}

export const useGroupChat = (options: UseGroupChatOptions = {}) => {
  const {
    socketUrl = process.env.NEXT_PUBLIC_SOCKETS_URL ?? "http://localhost:8000",
    enabled = true,
    agentId,
    hasExistingMessages = false,
    onNewMessage,
    onMessageUpdate,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("Disconnected");
  const [error, setError] = useState("");

  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const hasLoadedHistory = useRef(false);
  const reconnectAttempts = useRef(0);
  const isReconnecting = useRef(false);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  // Socket connection management
  const connect = useCallback(() => {
    if (!enabled || !agentId || socketRef.current) return socketRef.current;

    setConnectionStatus("Connecting...");
    socketRef.current = io(socketUrl, {
      transports: ["websocket", "polling"],
      timeout: 10000, // Reduced timeout for mobile
      forceNew: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10, // More attempts for mobile
      // reconnectionAttempts: 10,
      // Mobile-specific optimizations
      upgrade: true,
      rememberUpgrade: false, // Don't remember transport upgrades
    });

    return socketRef.current;
  }, [socketUrl, enabled, agentId]);

  const disconnect = useCallback(() => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus("Disconnected");
    hasLoadedHistory.current = false;
    isReconnecting.current = false;
  }, []);

  // Heartbeat for mobile connection stability
  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) return;
    
    heartbeatInterval.current = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('ping');
      }
    }, 25000); // Ping every 25 seconds
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
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
          job_id: message.job_id,
          message: message.message
        },
      };
    },
    []
  );

  // Socket event handlers
  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setConnectionStatus("Connected");
    reconnectAttempts.current = 0;
    isReconnecting.current = false;
    startHeartbeat();

    const socket = socketRef.current;
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
  }, [agentId, hasExistingMessages, startHeartbeat]);

  const handleDisconnect = useCallback(
    (reason: string) => {
      console.log("Disconnected:", reason);
      setIsConnected(false);
      setConnectionStatus("Disconnected");
      stopHeartbeat();
      hasLoadedHistory.current = false;

      // Enhanced reconnection logic for mobile
      if (!isReconnecting.current && reconnectAttempts.current < 10) {
        isReconnecting.current = true;
        reconnectAttempts.current += 1;
        
        const shouldReconnect = 
          reason === "io server disconnect" ||
          reason === "transport close" ||
          reason === "ping timeout" ||
          reason === "transport error" ||
          reason === "io client disconnect";

        if (shouldReconnect) {
          // Exponential backoff with jitter
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 30000);
          const jitter = Math.random() * 1000;
          
          setTimeout(() => {
            if (enabled && agentId) {
              console.log(`Attempting to reconnect (${reconnectAttempts.current}/10)...`);
              setConnectionStatus("Connecting...");
              connect();
            }
          }, delay + jitter);
        }
      }
    },
    [connect, stopHeartbeat, enabled, agentId]
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

  const handleMessageUpdated = useCallback(
    (updatedMessage: GroupChatMessage) => {
      
      const chatEntry = convertToChatEntry(updatedMessage);
      // Update the existing message in the local state via callback
      console.log("updatedMessage", chatEntry)
      onMessageUpdate?.(chatEntry);
    },
    [convertToChatEntry, onMessageUpdate]
  );

  // Handle page visibility changes (critical for mobile)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page became visible - check connection and reconnect if needed
        if (enabled && agentId && (!socketRef.current || !socketRef.current.connected)) {
          console.log('Page visible - checking connection');
          reconnectAttempts.current = 0; // Reset attempts on manual focus
          connect();
        }
      } else {
        // Page hidden - stop heartbeat to save resources
        stopHeartbeat();
      }
    };

    const handleOnline = () => {
      if (enabled && agentId) {
        console.log('Network online - reconnecting');
        reconnectAttempts.current = 0;
        connect();
      }
    };

    const handleOffline = () => {
      stopHeartbeat();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enabled, agentId, connect, stopHeartbeat]);

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
    socket.on("message_updated", handleMessageUpdated);
    socket.on("connect_error", handleConnectionError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("join_success", handleJoinSuccess);
      socket.off("error", handleServerError);
      socket.off("message_history", handleMessageHistory);
      socket.off("new_message", handleNewMessage);
      socket.off("message_updated", handleMessageUpdated);
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
    handleMessageUpdated,
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
    socket: socketRef.current, // Add socket reference
    clearError: useCallback(() => setError(""), []),
  };
};
