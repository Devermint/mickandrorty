import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { tools } from "./agentCreationTools";
import { AgentSchema } from "@/app/types/AgentCreationSchema";
import z from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const OutputSchema = z.object({
  title: z.string().optional(),
  action: z.enum(["TEXT", "GENERATE_VIDEO"]).default("TEXT"),
  markdown: z.string().default(""),
});
type Output = z.infer<typeof OutputSchema>;

type Envelope<T = unknown> = {
  kind: "assistant" | "final" | "validation_error" | "upload_request";
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
4) Only after explicit "yes", call submit_agent with final values.

Formatting rules for any NON-tool reply (Markdown):
- Do NOT include any repeated fields.
- Use GitHub-flavored Markdown.
- Use headings (#, ##), bullet lists, numbered lists, paragraphs and fenced code blocks with language tags (e.g., \`\`\`ts).
- Do NOT output raw HTML.

- tokenName: {{tokenName or blank}}
- tokenTicker: {{tokenTicker or blank}}
- tokenDescription: {{tokenDescription or blank}}
- tokenImage: {{tokenImage or blank}}

- If tokenName, tokenTicker, and tokenDescription are provided but tokenImage is missing,
  call the tool "request_token_image" with a concise user-facing prompt and constraints.
- Do NOT call submit_agent until tokenImage is provided.
- When the user later provides tokenImage, continue the flow toward single-shot confirmation.
- Allowed image types: image/png, image/jpeg, image/webp. Max 2MB. Min 256×256.
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

type TokenInfo = {
  tokenName: string;
  tokenTicker: string;
};

function makeConfirmation(args: TokenInfo) {
  const name = args?.tokenName ?? "Unnamed Agent";
  const ticker = args?.tokenTicker ? ` (${args.tokenTicker})` : "";
  return `Creating agent **${name}${ticker}**…`;
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

  console.log(msg);

  if (msg.tool_calls?.length) {
    for (const tc of msg.tool_calls) {
      if (tc.type === "function") {
        return await handleToolCall(tc, msg, messages);
      }
    }
    // const call = msg.tool_calls[0];
    // if (call.type === "function" && call.function.name === "submit_agent") {
    //   return await submitAgentToolCall(call, msg, messages);
    // }
  }

  const out: Output = OutputSchema.parse({
    action: "TEXT",
    title: undefined,
    markdown: toMarkdown(msg.content),
  });

  const env: Envelope = {
    kind: "assistant",
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
  // const args = safeParseArgs(tc.function.arguments);

  switch (tc.function.name) {
    case "request_token_image": {
      console.log(
        " ----------------------------------------------------Requesting image ----------------------------------------------------"
      );
      return await uploadImageToolCall(tc, msg, messages);
    }

    case "submit_agent": {
      console.log(
        " ----------------------------------------------------Requesting agent ----------------------------------------------------"
      );
      return await submitAgentToolCall(tc, msg, messages);
    }

    default:
      // Unknown tool -> ignore or log
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
    const env: Envelope = {
      kind: "validation_error",
      notice: "Invalid tool arguments JSON.",
      errors: { formErrors: ["Invalid tool arguments JSON"] },
    };
    return NextResponse.json(env);
  }

  const parsed = AgentSchema.safeParse(args);
  console.log(
    "----------------------------IMAGE----------------------------------"
  );
  console.log(parsed);
  if (!parsed.success) {
    const env: Envelope = {
      kind: "validation_error",
      notice: "Could not finalize — please review the fields.",
      errors: parsed.error.flatten(),
    };
    return NextResponse.json(env);
  }

  // Create agent
  const agentForm: FormData = new FormData();
  agentForm.set("tokenName", parsed.data.tokenName);
  agentForm.set("tokenTicker", parsed.data.tokenTicker);
  agentForm.set("tokenDescription", parsed.data.tokenDescription);
  agentForm.set("imageUrl", parsed.data.tokenImage);

  // const agentRes: Response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/agents`,
  //   {
  //     method: "POST",
  //     body: agentForm,
  //   }
  // );

  const resultPayload = { status: "ok", ...parsed.data };

  const assistantToolCallMsg = {
    role: "assistant" as const,
    content: (msg.content ?? "") as string,
    tool_calls: msg.tool_calls,
  };

  if (!msg.tool_calls) return;

  const toolResults = msg.tool_calls.map((tc) => ({
    role: "tool" as const,
    tool_call_id: tc.id,
    content: JSON.stringify(resultPayload),
  }));

  const followUp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM },
      ...messages,
      assistantToolCallMsg,
      ...toolResults,
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  const followText =
    (followUp.choices[0]?.message?.content ?? "").toString().trim() ||
    makeConfirmation(parsed.data);

  const env: Envelope<typeof parsed.data> = {
    kind: "final",
    notice: followText,
    data: parsed.data,
  };
  return NextResponse.json(env);
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
    const env: Envelope = {
      kind: "validation_error",
      notice: "Invalid tool arguments JSON.",
      errors: { formErrors: ["Invalid tool arguments JSON"] },
    };
    return NextResponse.json(env);
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
    const env: Envelope = {
      kind: "validation_error",
      notice: "Invalid upload constraints.",
      errors: { fieldErrors: { accept: problems } },
    };
    return NextResponse.json(env);
  }

  const env: Envelope<{
    accept: string[];
    maxSizeBytes: number;
    minWidth: number;
    minHeight: number;
  }> = {
    kind: "upload_request",
    notice: prompt,
    data: { accept, maxSizeBytes, minWidth, minHeight },
  };

  console.log(env);
  return NextResponse.json(env);
};
// function safeParseArgs(s: string) {
//   try {
//     return JSON.parse(s || "{}");
//   } catch {
//     return {};
//   }
// }
