import { ChatState } from "@/app/types/message";
import { MessageHandler } from "./base/MessageHandler";

export class RegularChatHandler extends MessageHandler {
  async handleMessage(text: string): Promise<void> {
    this.addUserMessage(text);
    const context = this.getContext();
    context.setChatState(ChatState.PROCESSING);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...context.messages,
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

      const { message, action, data } = await response.json();

      if (action === "GENERATE_VIDEO") {
        const videoPrompt = message;
        const displayContent = `I can generate a video with the following prompt:\n\n> ${videoPrompt}\n\nClick **Generate video** to pay 0.1 APT and start the job.`;

        context.setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: displayContent,
            type: "video_request",
            data: { prompt: videoPrompt, isGroupMessage: false },
          },
        ]);

        context.sendAgentMessage?.({
          content: displayContent,
          type: "video_request",
          data: { prompt: videoPrompt },
        });

        this.getContext().setChatState(ChatState.IDLE);
      } else if (action === "GENERATE_TELEGRAM_POST") {
        const videoUrl =
          data && typeof data.videoUrl === "string" ? data.videoUrl : undefined;

        context.setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: message,
            type: "telegram_post",
            data: { videoUrl, post: message, isGroupMessage: false },
          },
        ]);

        context.sendAgentMessage?.({
          content: message,
          type: "telegram_post",
          data: { videoUrl, post: message },
        });

        this.getContext().setChatState(ChatState.IDLE);
      } else if (action === "GENERATE_X_POST") {
        const videoUrl =
            data && typeof data.videoUrl === "string" ? data.videoUrl : undefined;

        context.setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: message,
            type: "twitter_post",
            data: { videoUrl, post: message, isGroupMessage: false },
          },
        ]);

        context.sendAgentMessage?.({
          content: message,
          type: "twitter_post",
          data: { videoUrl, post: message },
        });

        this.getContext().setChatState(ChatState.IDLE);
      } else {
        this.addAssistantMessage(message, "text");
        this.getContext().setChatState(ChatState.IDLE);
      }
    } catch (error) {
      this.addErrorMessage(error);
      this.getContext().setChatState(ChatState.IDLE);
    }
  }

  // Video generation logic moved to useGroupChat hook
}
