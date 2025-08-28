"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Card,
  Badge,
  Alert,
  Flex,
  Container,
  Heading,
  IconButton,
} from "@chakra-ui/react";
import { IoClose, IoChatbubble, IoWarning } from "react-icons/io5";
import io from "socket.io-client";

/* ---------------------- Types and Interfaces ---------------------- */
interface ChatMessage {
  id: string;
  _id?: string;
  content: string;
  timestamp: string;
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

/* ---------------------- Constants ---------------------- */
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKETS_URL ?? "http://localhost:8000";
const MAX_MESSAGE_LENGTH = 1000;

/* ---------------------- Custom hook for socket management ---------------------- */
const useSocket = () => {
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const connect = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        timeout: 5000,
      });
    }
    return socketRef.current;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { connect, disconnect, socketRef };
};

/* ---------------------- Main Component ---------------------- */
const SocketChatTest: React.FC = () => {
  /* ---------------- State management ---------------- */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("Connecting...");

  /* ---------------- Hooks and refs ---------------- */
  const { connect, disconnect, socketRef } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ---------------- Utilities ---------------- */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const clearError = useCallback(() => setError(""), []);

  /* ---------------- Socket event handlers ---------------- */
  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setConnectionStatus("Connected");

    // Auto-join the chat with anonymous user
    const socket = socketRef.current;
    if (socket) {
      socket.emit("join_chat", {
        user_id: "anon",
        username: "Anonymous",
      });
    }
  }, [socketRef]);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setConnectionStatus("Disconnected");
  }, []);

  const handleJoinSuccess = useCallback((data: JoinSuccessData) => {
    console.info("Joined chat:", data.message);
  }, []);

  const handleServerError = useCallback((data: ServerError) => {
    setError(data.message || "An error occurred");
  }, []);

  const handleMessageHistory = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleNewMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleConnectionError = useCallback(() => {
    setError("Failed to connect. Make sure server is running on port 8000.");
    setConnectionStatus("Connection Failed");
  }, []);

  /* ---------------- Auto-connect on mount ---------------- */
  useEffect(() => {
    const socket = connect();

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
    connect,
    handleConnect,
    handleDisconnect,
    handleJoinSuccess,
    handleServerError,
    handleMessageHistory,
    handleNewMessage,
    handleConnectionError,
  ]);

  /* ---------------- Message sending ---------------- */
  const sendMessage = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const socket = socketRef.current;
      if (!input.trim() || !socket) return;

      const localMessage: ChatMessage = {
        id: Date.now().toString(),
        content: input.trim(),
        timestamp: new Date().toISOString(),
        type: "text",
      };

      setMessages((prev) => [...prev, localMessage]);
      socket.emit("send_message", { content: input.trim() });
      setInput("");
    },
    [input, socketRef]
  );

  /* ---------------- Input handling ---------------- */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    },
    []
  );

  /* ---------------- Manual disconnect ---------------- */
  const handleDisconnectClick = useCallback(() => {
    disconnect();
    setIsConnected(false);
    setMessages([]);
    setConnectionStatus("Disconnected");
  }, [disconnect]);

  /* ---------------- Effects ---------------- */
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /* ---------------- Render ---------------- */
  return (
    <Container maxW="2xl" py={4}>
      <Card.Root height="600px" display="flex" flexDirection="column">
        <Card.Header py={3} borderBottom="1px" borderColor="gray.200">
          <Flex align="center">
            <HStack>
              <Box color="blue.500">
                <IoChatbubble />
              </Box>
              <Heading size="md">Chat</Heading>
              <Badge
                colorPalette={isConnected ? "green" : "red"}
                variant="solid"
              >
                {connectionStatus}
              </Badge>
            </HStack>
            <IconButton
              size="sm"
              colorPalette="red"
              variant="ghost"
              onClick={handleDisconnectClick}
              ml="auto"
            >
              <IoClose />
            </IconButton>
          </Flex>
        </Card.Header>

        {error && (
          <Alert.Root status="error" size="sm">
            <HStack>
              <IoWarning />
              <Alert.Description flex="1">{error}</Alert.Description>
              <IconButton size="xs" variant="ghost" onClick={clearError}>
                <IoClose />
              </IconButton>
            </HStack>
          </Alert.Root>
        )}

        <Box flex="1" p={4} overflowY="auto" bg="gray.50">
          <VStack gap={3} align="stretch">
            {messages.map((message, index) => (
              <Box
                key={message.id || message._id || index}
                bg="white"
                p={3}
                borderRadius="lg"
                shadow="sm"
                borderLeft="3px solid"
                borderLeftColor="blue.400"
              >
                <Text fontSize="sm" mb={1}>
                  {message.content}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Text>
              </Box>
            ))}

            {!isConnected && messages.length === 0 && (
              <Box textAlign="center" py={8}>
                <Text color="gray.500">
                  {connectionStatus === "Connecting..."
                    ? "Connecting to chat..."
                    : "Not connected to chat"}
                </Text>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </VStack>
        </Box>

        <Card.Footer p={4} borderTop="1px" borderColor="gray.200">
          <form onSubmit={sendMessage} style={{ width: "100%" }}>
            <HStack gap={2}>
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                maxLength={MAX_MESSAGE_LENGTH}
                size="lg"
                flex="1"
                disabled={!isConnected}
              />
              <Button
                type="submit"
                colorPalette="blue"
                disabled={!input.trim() || !isConnected}
                size="lg"
              >
                Send
              </Button>
            </HStack>
          </form>
        </Card.Footer>
      </Card.Root>
    </Container>
  );
};

export default SocketChatTest;
