import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const ImageUrl = z
  .string()
  .url()
  .refine((url) => url.startsWith("https://") || url.startsWith("blob:"), {
    message: "Image URL must be either an HTTPS URL or a blob URL",
  });

const TempRef = z.object({
  kind: z.literal("temp"),
  id: z.string().min(1),
});

export const AgentSchema = z.object({
  tokenName: z.string().min(1).max(100),
  tokenTicker: z
    .string()
    .regex(/^[A-Z]{2,5}$/, "Ticker must be 2-5 uppercase letters"),
  tokenDescription: z.string().min(10).max(500),
  tokenImage: z.union([ImageUrl, TempRef]),
});

export type AgentForm = z.infer<typeof AgentSchema>;
export const AgentJsonSchema = zodToJsonSchema(AgentSchema, "Agent");
