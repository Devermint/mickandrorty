import { ChatState } from "@/app/types/message";
import { MessageHandler } from "./base/MessageHandler";

export class RegularChatHandler extends MessageHandler {
  async handleMessage(text: string): Promise<void> {
    this.addUserMessage(text);
    this.context.setChatState(ChatState.PROCESSING);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...this.context.messages,
            { role: "user", content: text, type: "text" },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to chat");
      }

      if (!response.body) {
        throw new Error("No response body from chat");
      }

      const { message, action } = await response.json();

      if (action === "GENERATE_VIDEO") {
        const videoPrompt = message;
        const displayContent = `I can generate a video with the following prompt:\n\n> ${videoPrompt}\n\nClick **Generate video** to pay 0.1 APT and start the job.`;

        this.context.setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: displayContent,
            type: "video_request",
            data: { prompt: videoPrompt, isGroupMessage: false },
          },
        ]);

        this.context.sendAgentMessage?.({
          content: displayContent,
          type: "video_request",
          data: { prompt: videoPrompt },
        });

        this.context.setChatState(ChatState.IDLE);
      } else {
        this.addAssistantMessage(message, "text");
        this.context.setChatState(ChatState.IDLE);
      }
    } catch (error) {
      this.addErrorMessage(error);
      this.context.setChatState(ChatState.IDLE);
    }
  }

  // Video generation logic moved to useGroupChat hook
}

