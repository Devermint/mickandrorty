import { AgentType } from "@/app/types/agent";
import { MessageContext } from "@/app/types/message";
import { MessageHandler } from "../handlers/base/MessageHandler";
import { AgentCreatorHandler } from "../handlers/AgentCreatorHandler";
import { RegularChatHandler } from "../handlers/RegularChatHandler";
export class MessageHandlerFactory {
  static createHandler(
    agentType: AgentType,
    contextSupplier: () => MessageContext
  ): MessageHandler {
    switch (agentType) {
      case AgentType.AgentCreator:
        return new AgentCreatorHandler(contextSupplier);
      default:
        return new RegularChatHandler(contextSupplier);
    }
  }
}
