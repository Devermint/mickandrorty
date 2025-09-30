import type { Dispatch, SetStateAction } from "react";
import { AgentCreationData } from "../lib/utils/agentCreation";
import { ClientRef } from "../lib/clientImageStore";

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
    | "signature-required"
    | "video_request";
  data?: any;
  onAgentCreate?: (agentData: AgentCreationData) => Promise<void>;
  onTokenImageUploaded?: (ref: ClientRef) => void | Promise<void>;
};

export interface MessageContext {
  messages: ChatEntryProps[];
  setMessages: Dispatch<SetStateAction<ChatEntryProps[]>>;
  setChatState: Dispatch<SetStateAction<ChatState>>;
  wallet?: any;
  account?: any;
  isConnected: boolean;
  swapSDK?: any;
  sendAgentMessage?: (entry: {
    content: string;
    type?: ChatEntryProps["type"];
    data?: any;
  }) => void;
}

export enum ChatState {
  IDLE,
  PROCESSING,
}



