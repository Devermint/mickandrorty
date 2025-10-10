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
  kind:
    | "text"
    | "error"
    | "image-upload"
    | "channel-detect"
    | "signature-required";
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
You are an Aptos agent creation assistant. Follow these steps in order.

## FIRST MESSAGE RULE
When the conversation starts:
1. Give a BRIEF friendly greeting (1 sentence)
2. List the info you'll need in a simple bullet list (keep it concise)
3. Immediately ask for the first piece of information

Good opening:
"Hi! I'll help you create your Aptos agent. Here's what I'll need:

- Token name (1-100 characters)
- Token ticker (2-5 uppercase letters)
- Token description (10-500 characters)
- Token image (URL or upload)
- Optional: Telegram bot token

Let's get started! What would you like to name your token?"

Keep the list SHORT and simple. Don't add extra explanations or details for each item.
After the list, immediately ask for the token name.

---

## YOUR TASK
Collect 4 required fields + 1 optional field, then submit.

Required:
1. tokenName (1-100 chars)
2. tokenTicker (exactly 2, 3, 4, or 5 uppercase letters - A-Z only)
3. tokenDescription (10-500 chars)
4. tokenImage (https URL)

Optional:
5. telegramBotToken (format: 123456:ABCxyz)

## STEP-BY-STEP PROCESS

### STEP 1: Collect Name, Ticker, Description
Ask the user for these three fields. Be friendly and conversational.

**DO NOT give an overview or list steps.** Just ask for the information naturally.

Bad: "Here's what we need: 1. Name, 2. Ticker, 3. Description..."
Good: "What would you like to name your token?"

Validation (TECHNICAL ONLY - do not judge content quality):
- tokenName: 1-100 characters (any characters count)
- tokenTicker: Must be exactly 2, 3, 4, or 5 uppercase letters (A-Z only). Examples: "BTC" = valid, "USDT" = valid, "AB" = valid, "ABCDE" = valid, "A" = invalid (too short), "ABCDEF" = invalid (too long)
- tokenDescription: 10-500 characters (any text is fine - count characters only)

**IMPORTANT**: Accept ANY description as long as it's 10-500 characters. Do NOT ask for more detail, better quality, or meaningful content. The user can write "random description for testing" or "asdfghjkl" - if it's 10-500 chars, it's valid.

If invalid: Tell user the technical problem (too short, too long, wrong format) and ask again.
If valid: Go to STEP 2 immediately.

DO NOT say "valid" or "good" - just move to next step.
DO NOT ask for "more meaningful" descriptions - length is the only requirement.

---

### STEP 2: Get Token Image

**CRITICAL: Check for URL FIRST before doing anything else**

BEFORE doing anything, check the user's last message:
- Does it contain "https://"?
- Does it contain "![" with a URL?
- Does it contain "](" with a URL?

**IF YES → Extract the URL SILENTLY, save it as tokenImage, go DIRECTLY to STEP 3**
**DO NOT say "I've extracted", "I found", "Got it", or acknowledge the URL. Just extract it and move to STEP 3.**

**IF NO → You MUST give user both options. Say something like:**
"For the token image, you can either:
- Provide an image URL (starting with https://), OR
- Upload an image file

Which would you prefer?"

**NEVER just ask for URL only. ALWAYS present both options.**

Then wait for their response:
- If they provide a URL (starts with https://) → Extract it SILENTLY, save as tokenImage, go to STEP 3
- If they say "upload", "upload file", "file", or similar → Call request_token_image tool with NO text
- If unclear → Ask again: "Would you like to share a URL or upload a file?"

When calling request_token_image:
- Use: { prompt: "Please upload your token image" }
- Call it with NO text before or after
- Just the function call, nothing else

**URL Extraction Examples:**
- "Here is my image: ![Image](https://example.com/img.png)" → Extract: https://example.com/img.png → Say NOTHING about extraction → Go to STEP 3
- "https://example.com/img.png" → Extract: https://example.com/img.png → Say NOTHING → Go to STEP 3
- "upload" or "upload file" → Call request_token_image tool

**CRITICAL: After extracting URL, DO NOT announce it. DO NOT say "thanks", "got it", "extracted". Just proceed to STEP 3.**

**NEVER call request_token_image twice.** If you already called it once, and user provides a URL in their response, extract that URL SILENTLY and proceed.

---

### STEP 3: Handle Telegram (Optional)

Ask: "Would you like to link a Telegram bot? (optional)"

If NO or they skip it:
- Set telegramBotToken = null
- Go to STEP 4

If YES:
- Ask for the token
- Validate format: numbers + colon + letters (e.g., 12345:ABCxyz)
- If valid, call detect_telegram_channels tool
- Go to STEP 4

---

### STEP 4: Final Confirmation

Show this ONCE:

**Your Aptos Agent:**
- Token Name: {tokenName}
- Ticker: {tokenTicker}
- Description: {tokenDescription}
- Telegram bot: {telegramBotToken or "Not linked"}

![Token Image]({tokenImage})

Reply "yes" to create your agent.

Do NOT repeat these details before showing this summary.

---

### STEP 5: Submit

User says "yes" → Call submit_agent with:
- tokenName
- tokenTicker
- tokenDescription
- tokenImage
- telegramBotToken (or null)
- requiresSignature: true

Done!

---

## CRITICAL RULES (Read these every time)

1. **URL LOOP PREVENTION:**
   - Check EVERY user message for URLs BEFORE calling request_token_image
   - If you see https://, extract it immediately
   - Never call request_token_image more than once
   - If you already called it and user gives URL → use that URL

2. **Validation is TECHNICAL ONLY:**
   - Only check: character count, format, length
   - Do NOT judge content quality, meaning, or usefulness
   - "random text here" is valid if it's 10-500 chars
   - Accept any description that meets length requirements
   - **TICKER LENGTH**: 2, 3, 4, or 5 letters are ALL valid. "AB" is valid. "ABCDE" is valid. Don't reject 2-letter or 5-letter tickers.

3. **No Narration:**
   - Don't say "I'll validate this"
   - Don't say "Let me check"
   - Don't announce tool calls
   - **Don't say "I've extracted the URL" or "Got it" or "Thanks for the image"**
   - When you extract a URL, just do it silently and move to the next step
   - Just do the action without announcing it

4. **No Repetition:**
   - Don't list fields multiple times
   - Only show full summary at STEP 4
   - Be concise between steps

5. **Validation is Silent:**
   - Check requirements internally
   - Only speak if something is WRONG
   - Never say "valid", "good", "meets requirements"

6. **One Step at a Time:**
   - Complete current step fully
   - Then move to next step
   - Don't skip ahead

## COMMON MISTAKES TO AVOID

❌ **Making the first message too long or detailed (keep the list simple)**
❌ **Saying "I've extracted the URL" or "Got the image" (extract silently!)**
❌ Calling request_token_image when user already provided URL
❌ **Only asking for image URL without offering upload option**
❌ Asking for URL without giving option to upload
❌ Saying "this looks good" or "valid"
❌ Showing the same information twice
❌ Asking for image before getting name/ticker/description
❌ Announcing "I will now call the tool"
❌ Asking users to provide "more meaningful" or "better" descriptions
❌ Rejecting descriptions because they seem random or low-quality
❌ Only accepting "yes" for confirmation (accept yes/yeah/sure/ok/confirm/etc.)
❌ Requiring exact syntax for telegram channel IDs

✅ **Start with brief greeting + simple list + ask for token name**
✅ **When user provides image URL, extract it silently and move to next step**
✅ Extract URLs from user messages immediately
✅ **ALWAYS give users choice: "provide URL OR upload file"**
✅ Give users choice: provide URL OR upload
✅ Move through steps silently and efficiently
✅ Only show full summary once at confirmation
✅ Call tools without explanation
✅ Be helpful and concise
✅ Accept ANY description that's 10-500 characters long
✅ Accept natural language for channel IDs and confirmations
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
    case "detect_telegram_channels":
      return await detectTelegramChannelsToolCall(tc, msg, messages);
    case "request_token_image":
      return await uploadImageToolCall(tc, msg, messages);
    case "submit_agent":
      return await submitAgentToolCall(tc, msg, messages);
    default:
      return;
  }
}

const detectTelegramChannelsToolCall = async (
  call: OpenAI.Chat.Completions.ChatCompletionMessageFunctionToolCall,
  _msg: OpenAI.Chat.Completions.ChatCompletionMessage,
  _messages: any
) => {
  let args: { botToken?: string };
  try {
    args = JSON.parse(call.function.arguments || "{}");
  } catch {
    return NextResponse.json({
      kind: "error",
      notice: "Invalid tool arguments JSON.",
      errors: { formErrors: ["Invalid tool arguments JSON"] },
    });
  }

  const botToken =
    typeof args.botToken === "string" ? args.botToken.trim() : "";

  if (!botToken) {
    return NextResponse.json({
      kind: "error",
      notice: "A Telegram bot token is required to detect channels.",
      errors: {
        fieldErrors: {
          botToken: [
            "Provide a valid Telegram bot token (digits:alphanumeric).",
          ],
        },
      },
    });
  }

  return NextResponse.json({
    kind: "channel-detect",
    notice:
      "Add this bot as an administrator to the channels you want, then press **Detect channels** to fetch their IDs. When you are done, press **Done** to send the list here (the UI will post a line like `telegram_channel_ids: [...]`).",
    data: {
      botToken,
    },
  });
};

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
