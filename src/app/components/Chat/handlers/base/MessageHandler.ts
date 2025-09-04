export interface MessageContext {
  messages: ChatEntryProps[];
  setMessages: React.Dispatch<React.SetStateAction<ChatEntryProps[]>>;
  setChatState: React.Dispatch<React.SetStateAction<ChatState>>;
  setProgress: React.Dispatch<React.SetStateAction<string | null>>;
  wallet?: any;
  account?: any;
  isConnected: boolean;
  swapSDK?: any;
}

export type ChatEntryProps = {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "video" | "video-loader" | "loader" | "error" | "image-upload" | "signature-required";
  _id?: string;
  id?: string;
  agent_id?: string;
  timestamp?: string;
  user_type?: "user" | "agent";
  edited?: boolean;
  job_id?: string;
  last_updated?: string;
  data?: any;
};

export enum ChatState {
  IDLE,
  PROCESSING,
  GENERATING_VIDEO,
}

export abstract class MessageHandler {
  protected context: MessageContext;

  constructor(context: MessageContext) {
    this.context = context;
  }

  abstract handleMessage(text: string): Promise<void>;

  protected addUserMessage(text: string): void {
    this.context.setMessages((prev: ChatEntryProps[]) => [
      ...prev,
      { role: "user", content: text, type: "text" },
    ]);
  }

  protected addAssistantMessage(
    content: string,
    type: ChatEntryProps["type"] = "text",
    data?: any
  ): void {
    this.context.setMessages((prev: ChatEntryProps[]) => [
      ...prev,
      { role: "assistant", content, type, data },
    ]);
  }

  protected replaceLastMessage(
    content: string,
    type: ChatEntryProps["type"] = "text",
    data?: any
  ): void {
    this.context.setMessages((prev: ChatEntryProps[]) => [
      ...prev.slice(0, -1),
      { role: "assistant", content, type, data },
    ]);
  }

  protected addErrorMessage(error: unknown): void {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    this.addAssistantMessage(errorMessage, "error");
  }
}
