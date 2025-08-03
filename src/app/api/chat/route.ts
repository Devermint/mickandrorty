import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
  type?: "text" | "video";
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const decisionPrompt = `
You are a chat analyzer. You are given a chat history and a user prompt. You need to figure out the action to take. The action can be one of the following:
- GENERATE_VIDEO
- TEXT

If you are not sure about the action, return "TEXT".

Here are some examples of actions (user prompt):
- GENERATE_VIDEO:
    - "Generate a video about..."
    - "Generate me a video of that"
- TEXT:
    - "Can you help me generate a video of..."
    - "Help me generate a video of..."
    - "I don't like that"
    - "I want to change the prompt"
    - "I want to add a new scene"
    - "new character"
    - "new background"

The response should be in the following format:
{
  "action": "The action to take"
}
`;

const agentPrompt = `You are a creative video prompt specialist for Veo3, an advanced AI video generation model and you act as a helpful assistant. Your role is to:

1. Help users brainstorm creative video ideas
2. Transform basic ideas into detailed, cinematic video prompts
3. Suggest specific camera angles, lighting, movements, and visual elements
4. Keep prompts concise but descriptive (1-2 sentences)
5. Focus on visual storytelling and cinematic quality
6. Suggest realistic scenarios that would work well with AI video generation

When a user describes their idea, enhance it with:
- Camera movements (pan, tilt, dolly, zoom)
- Lighting conditions (golden hour, dramatic shadows, soft lighting)
- Visual style (cinematic, documentary, artistic)
- Setting details (urban, natural, interior)
- Movement and action within the frame

Always end your response by asking if they'd like you to refine the prompt further or if they're ready to generate the video.

`;

const tldrPrompt = `
You are a chat summarizer for video generation. You are given a chat history and you need to summarize it and prepare a prompt for FAL-AI video generation model.

The response should be in the following format:
{
  "prompt": "The prompt for FAL-AI video generation model"
}
`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const agentAction = await getAgentAction(messages);
    console.log("Agent action", agentAction);
    if (agentAction.action === "") {
      return NextResponse.json(
        { error: "Unknown action to take" },
        { status: 500 }
      );
    }

    if (agentAction.action === "GENERATE_VIDEO") {
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

    const agentResponse = await getAgentResponse(messages);
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

async function getAgentAction(messages: Message[]) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: decisionPrompt }, ...messages],
    temperature: 0.7,
    max_tokens: 300,
  });

  const content = completion.choices[0]?.message?.content;
  return JSON.parse(content || "");
}

async function getTldr(messages: Message[]) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: tldrPrompt }, ...messages],
    temperature: 0.7,
    max_tokens: 300,
  });

  const content = completion.choices[0]?.message?.content;
  return JSON.parse(content || "");
}

async function getAgentResponse(messages: Message[]) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: agentPrompt }, ...messages],
    temperature: 0.7,
    max_tokens: 300,
  });

  return completion.choices[0]?.message?.content;
}
