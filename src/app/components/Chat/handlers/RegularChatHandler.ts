import { MessageHandler, ChatState, ChatEntryProps } from "./base/MessageHandler";

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
      
      // Store job_id in message with empty content
      this.addAssistantMessage("", "video", { job_id: jobId });
      
      // Video generation progress will be handled by useGroupChat hook
    } catch (error) {
      this.addErrorMessage(error);
      this.context.setChatState(ChatState.IDLE);
    }
  }

  // Video generation logic moved to useGroupChat hook
}
