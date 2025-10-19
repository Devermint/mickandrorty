import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import z from "zod";
import {
  agentCreationSystemPrompt,
  decisionSystemPrompt,
  tldrSystemPrompt,
  getAgentPrompt,
  telegramPostSystemPrompt,
} from "./systemPrompts";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
  type?: "text" | "video" | "telegram_post" | "video_request";
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // const filteredMessages = messages.filter(
    //   (msg: { type: string }) => msg.type !== "video"
    // );

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    const agentAction = await getAgentAction(messages);
    const hasPendingTelegramConfirmation =
      hasPendingTelegramPostConfirmation(messages);

    let action = agentAction.action;

    if (hasPendingTelegramConfirmation) {
      action = "GENERATE_TELEGRAM_POST";
    }
    if (action === "") {
      return NextResponse.json(
        { error: "Unknown action to take" },
        { status: 500 }
      );
    }

    if (action === "GENERATE_VIDEO") {
      const tldr = await getTldr(messages);
      if (!tldr.prompt) {
        return NextResponse.json(
          { error: "No tldr prompt to generate video" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: tldr.prompt,
        action: "GENERATE_VIDEO",
      });
    }

    if (action === "GENERATE_TELEGRAM_POST") {
      const latestVideoUrl = getLatestVideoUrl(messages);

      if (!latestVideoUrl) {
        return NextResponse.json({
          message:
            "I couldn't find a generated video to reference for the Telegram post. Please generate a video first or share the link you'd like me to use.",
          action: "TEXT",
        });
      }

      const telegramPost = await getTelegramPost(messages, latestVideoUrl);

      if (!telegramPost?.post) {
        return NextResponse.json(
          { error: "Failed to craft Telegram post content" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: telegramPost.post,
        action: "GENERATE_TELEGRAM_POST",
        data: { videoUrl: latestVideoUrl, post: telegramPost.post },
      });
    }

    let agentResponse;

    if (action === "AGENT_CREATION") {
      agentResponse = await getAgentResponse(
        messages,
        baseUrl,
        agentCreationSystemPrompt(baseUrl),
        0.5
      );
    } else if (action === "TEXT") {
      const videoCreationSystemPrompt = getAgentPrompt(baseUrl);
      agentResponse = await getAgentResponse(
        messages,
        baseUrl,
        videoCreationSystemPrompt,
        0.8
      );

      if (isTelegramPostRequest(messages)) {
        agentResponse = ensureTelegramPostQuestion(agentResponse);
      }
    }

    if (!agentResponse) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: agentResponse, action: "TEXT" });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}

const AgentAction = z.object({
  action: z.enum([
    "TEXT",
    "GENERATE_VIDEO",
    "GENERATE_TELEGRAM_POST",
    "AGENT_CREATION",
  ]),
});

async function getAgentAction(messages: Message[]) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: decisionSystemPrompt }, ...messages],
    max_completion_tokens: 300,
    temperature: 0.1,
    response_format: zodResponseFormat(AgentAction, "agent_action"),
  });
  const content = completion.choices[0]?.message?.content;

  console.log("Agent action", content);
  return JSON.parse(content || "");
}

const TldrObject = z.object({
  prompt: z.string(),
});

async function getTldr(messages: Message[]) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: tldrSystemPrompt }, ...messages],
    max_completion_tokens: 300,
    temperature: 0.7,
    response_format: zodResponseFormat(TldrObject, "tldr_object"),
  });

  const content = completion.choices[0]?.message?.content;
  return JSON.parse(content || "");
}

async function getAgentResponse(
  messages: Message[],
  baseUrl: string,
  systemPrompt: string,
  temperature?: number
) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    max_completion_tokens: 350,
    temperature: temperature ?? 0.5,
  });

  return completion.choices[0]?.message?.content;
}

const TelegramPostObject = z.object({
  post: z.string().min(1),
});

function getLatestVideoUrl(messages: Message[]): string | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i] as Message & { type?: string };
    if (
      message?.role === "assistant" &&
      message.type === "video" &&
      typeof message.content === "string"
    ) {
      const trimmed = message.content.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }
  return null;
}

async function getTelegramPost(
  messages: Message[],
  latestVideoUrl: string
): Promise<{ post: string } | null> {
  const completion = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: telegramPostSystemPrompt(latestVideoUrl),
      },
      ...messages,
    ],
    max_completion_tokens: 400,
    response_format: zodResponseFormat(TelegramPostObject, "telegram_post"),
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    return null;
  }

  return JSON.parse(content);
}

const TELEGRAM_POST_CONFIRMATION_PROMPT =
  "Is this Telegram post good enough, or would you like me to refine it?";

function hasPendingTelegramPostConfirmation(messages: Message[]): boolean {
  if (messages.length < 2) {
    return false;
  }

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== "user") {
    return false;
  }

  for (let i = messages.length - 2; i >= 0; i -= 1) {
    const message = messages[i];
    if (message.role === "assistant") {
      const content = message.content ?? "";
      return content.includes(TELEGRAM_POST_CONFIRMATION_PROMPT);
    }
  }

  return false;
}

function isTelegramPostRequest(messages: Message[]): boolean {
  if (messages.length === 0) {
    return false;
  }

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== "user") {
    return false;
  }

  const text = lastMessage.content?.toLowerCase() ?? "";
  return text.includes("telegram") && text.includes("post");
}

function ensureTelegramPostQuestion(response: string | null): string {
  if (!response) {
    return TELEGRAM_POST_CONFIRMATION_PROMPT;
  }

  if (response.includes(TELEGRAM_POST_CONFIRMATION_PROMPT)) {
    return response;
  }

  const trimmed = response.trim();
  if (trimmed.length === 0) {
    return TELEGRAM_POST_CONFIRMATION_PROMPT;
  }

  return `${trimmed}\n\n${TELEGRAM_POST_CONFIRMATION_PROMPT}`;
}
