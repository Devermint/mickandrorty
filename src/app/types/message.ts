import type { Dispatch, SetStateAction } from "react";
import { AgentCreationData } from "../lib/utils/agentCreation";
import { ClientRef } from "../lib/clientImageStore";
import type { UploadConstraints } from "./file";

export type TelegramChannelInfo = {
  chatId: number;
  type: string;
  title: string | null;
  username: string | null;
  status: string | null;
  description?: string | null;
  inviteLink?: string | null;
};

export type TelegramChannelDetectionResult = {
  botToken: string;
  channels: TelegramChannelInfo[];
};

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
    | "channel-detect"
    | "signature-required"
    | "video_request";
  data?: any;
  onAgentCreate?: (agentData: AgentCreationData) => Promise<void>;
  onTokenImageUploaded?: (
    ref: ClientRef,
    constraints?: Partial<UploadConstraints>
  ) => void | Promise<void>;
  onChannelsDetected?: (
    payload: TelegramChannelDetectionResult
  ) => void | Promise<void>;
};

export interface MessageContext {
  messages: ChatEntryProps[];
  setMessages: Dispatch<SetStateAction<ChatEntryProps[]>>;
  setChatState: Dispatch<SetStateAction<ChatState>>;
  wallet?: any;
  account?: any;
  isConnected: boolean;
  swapSDK?: any;
  userId?: string | null;
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



