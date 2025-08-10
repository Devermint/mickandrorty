import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const AgentSchema = z.object({
  tokenName: z.string().min(1).max(100),
  tokenTicker: z
    .string()
    .regex(/^[A-Z]{2,5}$/, "Ticker must be 2-5 uppercase letters"),
  tokenDescription: z.string().min(10).max(500),
});

export type AgentForm = z.infer<typeof AgentSchema>;
export const AgentJsonSchema = zodToJsonSchema(AgentSchema, "Agent");
