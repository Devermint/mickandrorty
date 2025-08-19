import OpenAI from "openai";
import { AgentJsonSchema } from "@/app/types/AgentCreationSchema";

const AgentJsonParams = AgentJsonSchema.definitions?.Agent ?? AgentJsonSchema;

export const tools = [
  {
    type: "function",
    function: {
      name: "submit_agent",
      description:
        "Finalize and submit the Agent form after the user confirms all fields.",
      parameters: AgentJsonParams,
    },
  },
  {
    type: "function",
    function: {
      name: "request_token_image",
      description:
        "Ask the UI to prompt the user to upload the token image. Use when tokenName, tokenTicker, tokenDescription are known but tokenImage is missing. The uploaded image will be returned as a blob URL that can be displayed inline in markdown.",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "Short, user-facing ask for the image upload.",
          },
          accept: {
            type: "array",
            items: { type: "string" },
            description:
              "Accepted MIME types and blob URLs (e.g., image/png, image/jpeg, image/webp, blob:).",
            default: ["image/png", "image/jpeg", "image/webp", "blob:"],
          },
          maxSizeBytes: {
            type: "integer",
            description: "Max file size in bytes.",
            default: 2097152,
          },
          minWidth: {
            type: "integer",
            description: "Min width in pixels.",
            default: 256,
          },
          minHeight: {
            type: "integer",
            description: "Min height in pixels.",
            default: 256,
          },
          returnFormat: {
            type: "string",
            enum: ["blob", "dataUrl", "both"],
            description:
              "How to return the uploaded image - as blob URL, data URL, or both.",
            default: "blob",
          },
          includeInResponse: {
            type: "boolean",
            description:
              "Whether to include the uploaded image inline in the agent's response using markdown syntax.",
            default: true,
          },
        },
        required: ["prompt"],
      },
    },
  },
] satisfies OpenAI.Chat.Completions.ChatCompletionTool[];
