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
        await this.handleVideoGeneration(message);
      } else {
        this.addAssistantMessage(message, "text");
        this.context.setChatState(ChatState.IDLE);
      }
    } catch (error) {
      this.addErrorMessage(error);
      this.context.setChatState(ChatState.IDLE);
    }
  }

  private async handleVideoGeneration(prompt: string): Promise<void> {
    this.context.setChatState(ChatState.GENERATING_VIDEO);
    this.addAssistantMessage(
      "Video generation is in progress... (this may take ~5 minutes)",
      "text"
    );

    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate video");
      }

      const { jobId } = await response.json();
      this.setupVideoGenerationEventSource(jobId);
    } catch (error) {
      this.addErrorMessage(error);
      this.context.setChatState(ChatState.IDLE);
    }
  }

  private setupVideoGenerationEventSource(jobId: string): void {
    const es = new EventSource(`/api/generate-video?id=${jobId}`);
    this.context.setChatState(ChatState.PROCESSING);

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log(data);
      switch (data.status) {
        case "IN_QUEUE":
          this.addAssistantMessage("Video is in queue...", "text");
          break;
        case "IN_PROGRESS":
          this.context.setChatState(ChatState.GENERATING_VIDEO);
          this.context.setProgress(data.progress);
          break;
        case "COMPLETED":
          this.addAssistantMessage(data.videoUrl, "video");
          this.context.setProgress(null);
          this.context.setChatState(ChatState.IDLE);
          es.close();
          break;
      }
    };

    es.onerror = (e) => {
      console.error("SSE error", e);
      this.addErrorMessage("Video generation failed");
      this.context.setChatState(ChatState.IDLE);
      es.close();
    };
  }
}
