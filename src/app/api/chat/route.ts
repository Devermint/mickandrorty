import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import z from "zod";
import {
  agentCreationSystemPrompt,
  decisionSystemPrompt,
  tldrSystemPrompt,
  getAgentPrompt,
} from "./systemPrompts";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
  type?: "text" | "video";
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const filteredMessages = messages.filter(
      (msg: { type: string }) => msg.type !== "video"
    );

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

    const agentAction = await getAgentAction(filteredMessages);
    if (agentAction.action === "") {
      return NextResponse.json(
        { error: "Unknown action to take" },
        { status: 500 }
      );
    }

    if (agentAction.action === "GENERATE_VIDEO") {
      const tldr = await getTldr(filteredMessages);
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

    let agentResponse;

    if (agentAction.action === "AGENT_CREATION") {
      agentResponse = await getAgentResponse(
        filteredMessages,
        baseUrl,
        agentCreationSystemPrompt(baseUrl),
        0.5
      );
    } else if (agentAction.action === "TEXT") {
      const videoCreationSystemPrompt = getAgentPrompt(baseUrl);
      agentResponse = await getAgentResponse(
        filteredMessages,
        baseUrl,
        videoCreationSystemPrompt,
        0.8
      );
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
  action: z.enum(["TEXT", "GENERATE_VIDEO", "AGENT_CREATION"]),
});

async function getAgentAction(messages: Message[]) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: decisionSystemPrompt }, ...messages],
    temperature: 0.1,
    max_tokens: 300,
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
    temperature: 0.7,
    max_tokens: 300,
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
    temperature: temperature ?? 0.5,
    max_tokens: 350,
  });

  return completion.choices[0]?.message?.content;
}
