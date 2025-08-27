import { ChatEntryProps, MessageContext } from "@/app/types/message";

export abstract class MessageHandler {
  protected context: MessageContext;

  constructor(context: MessageContext) {
    this.context = context;
  }

  abstract handleMessage(text: string): Promise<void>;

  protected addUserMessage(text: string): void {
    this.context.setMessages((prev: ChatEntryProps[]) => [
      ...prev,
      { role: "user", content: text, type: "text" },
    ]);
  }

  protected addAssistantMessage(
    content: string,
    type: ChatEntryProps["type"] = "text",
    data?: any
  ): void {
    this.context.setMessages((prev: ChatEntryProps[]) => [
      ...prev,
      { role: "assistant", content, type, data },
    ]);
  }

  protected replaceLastMessage(
    content: string,
    type: ChatEntryProps["type"] = "text",
    data?: any
  ): void {
    this.context.setMessages((prev: ChatEntryProps[]) => [
      ...prev.slice(0, -1),
      { role: "assistant", content, type, data },
    ]);
  }

  protected addErrorMessage(error: unknown): void {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    this.addAssistantMessage(errorMessage, "error");
  }
}
