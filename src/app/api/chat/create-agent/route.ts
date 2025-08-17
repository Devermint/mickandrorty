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
  kind: "assistant" | "final" | "validation_error";
  title?: string;
  action?: "TEXT" | "GENERATE_VIDEO";
  markdown?: string;
  notice?: string;
  data?: T;
  errors?: unknown;
  redirectTo?: string;
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
    const call = msg.tool_calls[0];
    if (call.type === "function" && call.function.name === "submit_agent") {
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
      if (!parsed.success) {
        const env: Envelope = {
          kind: "validation_error",
          notice: "Could not finalize — please review the fields.",
          errors: parsed.error.flatten(),
        };
        return NextResponse.json(env);
      }

      const resultPayload = { status: "ok", ...parsed.data };

      const assistantToolCallMsg = {
        role: "assistant" as const,
        content: (msg.content ?? "") as string,
        tool_calls: msg.tool_calls,
      };

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
        temperature: 0.2,
        max_tokens: 300,
      });

      const followText =
        (followUp.choices[0]?.message?.content ?? "").toString().trim() ||
        makeConfirmation(parsed.data);

      const env: Envelope<typeof parsed.data> = {
        kind: "final",
        notice: followText,
        data: parsed.data,
        // redirectTo: `/agent/${created.id}`,
      };
      return NextResponse.json(env);
    }
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
