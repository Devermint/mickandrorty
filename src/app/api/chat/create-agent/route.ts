import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { tools } from "./agentCreationTools";
import z from "zod";
import { SubmitAgentSchema } from "@/app/types/AgentCreationSchema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const OutputSchema = z.object({
  title: z.string().optional(),
  action: z.enum(["TEXT", "GENERATE_VIDEO"]).default("TEXT"),
  markdown: z.string().default(""),
});
type Output = z.infer<typeof OutputSchema>;

type Envelope<T = unknown> = {
  kind: "text" | "error" | "image-upload" | "signature-required";
  title?: string;
  action?: "TEXT" | "GENERATE_VIDEO";
  markdown?: string;
  notice?: string;
  data?: T;
  errors?: unknown;
  redirectTo?: string;
};

type UploadArgs = {
  prompt?: string;
  accept?: string[];
  maxSizeBytes?: number;
  minWidth?: number;
  minHeight?: number;
};

function formatContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          return (part as { text?: string }).text ?? "";
        }
        return JSON.stringify(part);
      })
      .join("");
  }
  if (content == null) return "null";
  return JSON.stringify(content);
}

function logTranscript(label: string, messages: any[]) {
  console.log(
    `[agent:create] ${label} transcript --------------------------------`
  );
  (messages ?? []).forEach((message: any, index: number) => {
    if (!message) return;
    const { role, type, content, data } = message;
    console.log(
      `[agent:create] [${index}] role=${role ?? "unknown"} type=${
        type ?? "n/a"
      } content=${formatContent(content)}${
        data ? ` data=${JSON.stringify(data)}` : ""
      }`
    );
  });
  console.log(
    `[agent:create] ${label} transcript end ----------------------------`
  );
}

function logAssistantResponse(
  message: OpenAI.Chat.Completions.ChatCompletionMessage
) {
  if (!message) return;
  const { role, content, refusal, tool_calls } = message;
  console.log(
    "[agent:create] assistant response ---------------------------------"
  );
  console.log(
    `[agent:create] role=${role} content=${formatContent(content)} refusal=${
      refusal ? JSON.stringify(refusal) : "null"
    }`
  );
  tool_calls?.forEach((tc, index) => {
    const name = tc.type === "function" ? tc.function?.name : tc.type;
    const args = tc.type === "function" ? tc.function?.arguments : undefined;
    console.log(
      `[agent:create] tool_call[${index}] name=${name} args=${args ?? ""}`
    );
  });
  console.log(
    "[agent:create] assistant response end ----------------------------"
  );
}

const SYSTEM = `
You are a helpful assistant that guides users through creating Aptos agents. Your goal is to collect required information naturally through conversation, validate it, and submit the agent once confirmed.

## Required Fields

Collect these fields through natural conversation:
- **tokenName**: 1-100 characters
- **tokenTicker**: 2-5 uppercase letters only
- **tokenDescription**: 10-500 characters describing the project
- **tokenImage**: Image URL (you'll request upload)
- **telegramBotToken**: Optional

## Conversation Flow

1. **Gather basic info**: Ask for token name, ticker, and description. Be conversational and ask follow-up questions if anything is unclear or invalid.

2. **Handle Telegram bot token**: Ask once if they'd like to link a Telegram bot. If yes, collect and validate the token. If no or they don't have one, proceed without it.

3. **Request token image**: Once you have name, ticker, and description, immediately call \`request_token_image\` without any explanation or announcement. Just call the tool directly.

4. **Handle image responses**:
   - If user provides an https:// URL directly, extract it, validate format, and use it silently
   - When tool returns an image result, validate it silently in the background
   - Do NOT announce validation steps, show the URL, or explain what you're checking
   - If validation succeeds, proceed directly to confirmation
   - Only if validation fails, briefly explain the issue and request again

5. **Confirm before submitting**: Once all fields are collected (including tokenImage), show a summary ONLY ONCE with the image preview and ask for explicit confirmation. Do not repeat the details before this confirmation:

   Here's your agent configuration:
   - **Token Name**: {tokenName}
   - **Token Ticker**: {tokenTicker}
   - **Token Description**: {tokenDescription}
   - **Telegram Bot**: {telegramBotToken or "Not linked"}
   
   ![Token Image]({tokenImage})
   
   Does everything look correct? Reply "yes" to create your agent.

6. **Submit**: Only after explicit "yes", call \`submit_agent\` with all values and \`requiresSignature: true\`.

## Validation Rules

Apply these as you collect information:
- **tokenName**: Not empty, max 100 characters
- **tokenTicker**: 2-5 characters, uppercase letters only (A-Z)
- **tokenDescription**: 10-500 characters minimum
- **telegramBotToken**: Optional. If provided, must match format: numbers, colon, alphanumeric
- **tokenImage**: Must be a valid https:// URL after upload/submission

If validation fails, explain the issue clearly and ask the user to try again.

## Image Upload Details

- Call \`request_token_image\` with: \`{ prompt: "Please upload your token image" }\`
- Only request image once all other required fields are collected
- Don't request image again unless user explicitly wants to change it
- Show image preview when confirming final details

## Response Formatting

- Use clear, friendly language
- Format responses with Markdown (headings, lists, code blocks where appropriate)
- Don't show raw JSON or technical details of tool calls to users
- Be concise but complete
- **Avoid repeating information** - when moving from one step to the next, acknowledge what was collected but don't list everything again until the final confirmation

## Edge Cases

- If user provides incomplete info, ask specific follow-up questions
- If user wants to change a field after providing it, allow updates before final submission
- If user provides all info in first message, acknowledge and proceed through each step (validate, request image, confirm)
- Never submit without explicit "yes" confirmation
`;

function toMarkdown(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (content == null) return "";
  try {
    return "```json\n" + JSON.stringify(content, null, 2) + "\n```";
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  logTranscript("input", messages);

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: SYSTEM }, ...messages],
    tools,
    tool_choice: "auto",
    temperature: 0.7,
    max_tokens: 300,
  });

  const msg = resp.choices[0].message;
  logAssistantResponse(msg);

  console.log(msg);
  if (msg.tool_calls?.length) {
    for (const tc of msg.tool_calls) {
      if (tc.type === "function") {
        return await handleToolCall(tc, msg, messages);
      }
    }
  }

  const out: Output = OutputSchema.parse({
    action: "TEXT",
    title: undefined,
    markdown: toMarkdown(msg.content),
  });

  const env: Envelope = {
    kind: "text",
    title: out.title,
    action: out.action,
    markdown: out.markdown,
  };

  return NextResponse.json(env);
}

async function handleToolCall(
  tc: OpenAI.Chat.Completions.ChatCompletionMessageFunctionToolCall,
  msg: OpenAI.Chat.Completions.ChatCompletionMessage,
  messages: any
) {
  console.log("Function name: ", tc.function.name);
  console.log("------------------------------------------");
  messages.forEach((x: any) => console.log(x));
  console.log("------------------------------------------");
  switch (tc.function.name) {
    case "request_token_image":
      return await uploadImageToolCall(tc, msg, messages);
    case "submit_agent":
      return await submitAgentToolCall(tc, msg, messages);
    default:
      return;
  }
}

const submitAgentToolCall = async (
  call: OpenAI.Chat.Completions.ChatCompletionMessageFunctionToolCall,
  msg: OpenAI.Chat.Completions.ChatCompletionMessage,
  messages: any
) => {
  let args;
  try {
    args = JSON.parse(call.function.arguments || "{}");
  } catch {
    return NextResponse.json({
      kind: "error",
      notice: "Invalid tool arguments JSON.",
      errors: { formErrors: ["Invalid tool arguments JSON"] },
    });
  }

  // Validate with extended schema
  const parsed = SubmitAgentSchema.safeParse(args);
  if (!parsed.success) {
    return NextResponse.json({
      kind: "error",
      notice: "Could not finalize — please review the fields.",
      errors: parsed.error.flatten(),
    });
  }

  // Check if signature is required
  if (parsed.data.requiresSignature) {
    return NextResponse.json({
      kind: "signature-required",
      notice: parsed.data.confirmationMessage,
      data: parsed.data,
    });
  }

  // Direct submission (for non-blockchain features)
  return NextResponse.json({
    kind: "text",
    notice: "Token created successfully!",
    data: parsed.data,
  });
};

const uploadImageToolCall = async (
  call: OpenAI.Chat.Completions.ChatCompletionMessageFunctionToolCall,
  _msg: OpenAI.Chat.Completions.ChatCompletionMessage,
  _messages: any
) => {
  let args: UploadArgs;
  try {
    args = JSON.parse(call.function.arguments || "{}");
  } catch {
    return NextResponse.json({
      kind: "error",
      notice: "Invalid tool arguments JSON.",
      errors: { formErrors: ["Invalid tool arguments JSON"] },
    });
  }

  // Defaults + minimal validation
  const prompt =
    args.prompt?.trim() ||
    "Please upload your token image (PNG/JPEG/WebP, ≤2MB, ≥256×256).";
  const accept =
    Array.isArray(args.accept) && args.accept.length
      ? args.accept
      : ["image/png", "image/jpeg", "image/webp"];
  const maxSizeBytes =
    typeof args.maxSizeBytes === "number" && args.maxSizeBytes > 0
      ? args.maxSizeBytes
      : 2 * 1024 * 1024;
  const minWidth =
    typeof args.minWidth === "number" && args.minWidth > 0
      ? args.minWidth
      : 256;
  const minHeight =
    typeof args.minHeight === "number" && args.minHeight > 0
      ? args.minHeight
      : 256;

  // Basic sanity checks
  const problems: string[] = [];
  if (!accept.every((a) => typeof a === "string" && a.startsWith("image/"))) {
    problems.push("accept must be a list of image/* MIME types");
  }
  if (problems.length) {
    return NextResponse.json({
      kind: "error",
      notice: "Invalid upload constraints.",
      errors: { fieldErrors: { accept: problems } },
    });
  }

  return NextResponse.json({
    kind: "image-upload",
    notice: prompt,
    data: { accept, maxSizeBytes, minWidth, minHeight },
  });
};
