import type { ChatEntryProps, MessageContext } from "@/app/types/message";

type MessageContextSupplier = () => MessageContext;

export abstract class MessageHandler {
  protected getContext: MessageContextSupplier;

  constructor(contextSupplier: MessageContextSupplier) {
    this.getContext = contextSupplier;
  }

  abstract handleMessage(text: string): Promise<void>;

  protected addUserMessage(text: string): void {
    const context = this.getContext();
    context.setMessages((prev: ChatEntryProps[]) => [
      ...prev,
      { role: "user", content: text, type: "text" },
    ]);
  }

  protected addAssistantMessage(
    content: string,
    type: ChatEntryProps["type"] = "text",
    data?: any
  ): void {
    const context = this.getContext();
    context.setMessages((prev: ChatEntryProps[]) => [
      ...prev,
      { role: "assistant", content, type, data },
    ]);
  }

  protected replaceLastMessage(
    content: string,
    type: ChatEntryProps["type"] = "text",
    data?: any
  ): void {
    const context = this.getContext();
    context.setMessages((prev: ChatEntryProps[]) => [
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
