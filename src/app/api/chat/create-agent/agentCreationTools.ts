import { AgentJsonSchema } from "@/app/types/AgentCreationSchema";
import OpenAI from "openai";

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
] satisfies OpenAI.Chat.Completions.ChatCompletionTool[];
