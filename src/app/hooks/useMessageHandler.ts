import { useCallback } from "react";
import { MessageContext, ChatEntryProps, ChatState } from "../types/message";
import { Agent, AgentType } from "@/app/types/agent";
import { MessageHandlerFactory } from "../components/Chat/factories/MessageHandlerFactory";

interface UseMessageHandlerProps {
  chatState: ChatState;
  messages: ChatEntryProps[];
  agent: Agent;
  wallet: any;
  account: any;
  isConnected: boolean;
  swapSDK: any;
  inputMessage: React.RefObject<HTMLTextAreaElement>;
  setMessages: React.Dispatch<React.SetStateAction<ChatEntryProps[]>>;
  setChatState: React.Dispatch<React.SetStateAction<ChatState>>;
  socket?: any; // Socket.IO instance
  agentId?: string; // Agent ID for Socket.IO
  sendAgentMessage?: (
    content: string,
    type?: ChatEntryProps["type"],
    data?: any
  ) => boolean;
}

export const useMessageHandler = ({
  chatState,
  messages,
  agent,
  wallet,
  account,
  isConnected,
  swapSDK,
  inputMessage,
  setMessages,
  setChatState,
  socket,
  agentId,
  sendAgentMessage,
}: UseMessageHandlerProps) => {
  const onMessageSend = useCallback(async () => {
    const el = inputMessage.current;
    if (!el) return;

    const text = el.value.trim();
    if (!text) return;

    el.value = "";
    el.blur();

    const context: MessageContext = {
      messages,
      setMessages,
      setChatState,
      wallet,
      account,
      isConnected,
      swapSDK,
      sendAgentMessage: sendAgentMessage
        ? ({ content, type, data }) => {
            sendAgentMessage(content, type, data);
          }
        : undefined,
    };

    const handler = MessageHandlerFactory.createHandler(
      agent.agent_type as AgentType,
      context
    );

    try {
      await handler.handleMessage(text);
    } catch (error) {
      console.error("Message handling failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          type: "error",
        },
      ]);
      setChatState(ChatState.IDLE);
    }
  }, [
    chatState,
    messages,
    agent.agent_type,
    wallet,
    account,
    isConnected,
    swapSDK,
    inputMessage,
    setMessages,
    setChatState,
    socket,
    agentId,
    sendAgentMessage,
  ]);

  return { onMessageSend };
};
