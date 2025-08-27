import { AgentCreationData } from "@/app/lib/utils/agentCreation";
import { ClientRef } from "@/app/lib/clientImageStore";

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
  type?:
    | "text"
    | "video"
    | "video-loader"
    | "loader"
    | "error"
    | "image-upload"
    | "signature-required";
  data?: any;
  onAgentCreate?: (agentData: AgentCreationData) => Promise<void>;
  onTokenImageUploaded?: (ref: ClientRef) => void | Promise<void>;
};

export enum ChatState {
  IDLE,
  PROCESSING,
  GENERATING_VIDEO,
}
