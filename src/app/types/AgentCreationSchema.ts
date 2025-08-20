import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const ImageUrl = z
  .string()
  .url()
  .refine((url) => url.startsWith("https://"), {
    message: "Image URL must be an HTTPS URL",
  });

export const AgentSchema = z.object({
  tokenName: z.string().min(1).max(100),
  tokenTicker: z
    .string()
    .regex(/^[A-Z]{2,5}$/, "Ticker must be 2-5 uppercase letters"),
  tokenDescription: z.string().min(10).max(500),
  tokenImage: ImageUrl,
});

// Extended schema for tool submission
export const SubmitAgentSchema = AgentSchema.extend({
  requiresSignature: z
    .boolean()
    .default(true)
    .describe(
      "Whether this submission requires blockchain transaction signature from the user"
    ),
  confirmationMessage: z
    .string()
    .default("Please double check your token details and sign the transaction")
    .describe("Message to show user before signing"),
});

export type AgentForm = z.infer<typeof AgentSchema>;
export type SubmitAgentForm = z.infer<typeof SubmitAgentSchema>;

export const AgentJsonSchema = zodToJsonSchema(AgentSchema, "Agent");
export const SubmitAgentJsonSchema = zodToJsonSchema(
  SubmitAgentSchema,
  "SubmitAgent"
);
