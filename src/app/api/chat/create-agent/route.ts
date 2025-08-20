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

const SYSTEM = `
You are a careful form assistant for creating Aptos agents.
1) Ask only for missing/ambiguous fields (tokenName, tokenTicker, tokenDescription).
2) Validate constraints as you go.
3) When all fields are known, present them ONCE and ask for confirmation.
4) Only after explicit "yes", call submit_agent with final values and requiresSignature=true.

Formatting rules for any NON-tool reply (Markdown):
- Do NOT include any repeated fields.
- Use GitHub-flavored Markdown.
- Use headings (#, ##), bullet lists, numbered lists, paragraphs and fenced code blocks with language tags (e.g., \`\`\`ts).
- Do NOT output raw HTML.

- tokenName: {{tokenName or blank}}
- tokenTicker: {{tokenTicker or blank}}
- tokenDescription: {{tokenDescription or blank}}
- tokenImage: {{tokenImage or blank}}

CRITICAL IMAGE UPLOAD RULES:
- If tokenName, tokenTicker, and tokenDescription are provided but tokenImage is missing,
  you MUST ALWAYS call the "request_token_image" function with these exact parameters:
  {
    "name": "request_token_image",
    "arguments": {
      "prompt": "Please upload your token image",
      "accept": ["image/png", "image/jpeg", "image/webp"],
      "maxSizeBytes": 2097152,
      "minWidth": 256,
      "minHeight": 256
    }
  }
- NEVER ask for an image upload without calling the request_token_image function
- Do NOT call submit_agent until tokenImage is provided
- When the user later provides tokenImage, continue the flow toward single-shot confirmation
- When confirming and tokenImage is present, include:
  ![Token image](url)

Confirm? (yes/no)
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

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: SYSTEM }, ...messages],
    tools,
    tool_choice: "auto",
    temperature: 0.7,
    max_tokens: 300,
  });

  const msg = resp.choices[0].message;

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
