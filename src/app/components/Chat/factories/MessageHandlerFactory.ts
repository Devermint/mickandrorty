import { AgentType } from "@/app/types/agent";
import { MessageHandler } from "../handlers/base/MessageHandler";
import { AgentCreatorHandler } from "../handlers/AgentCreatorHandler";
import { RegularChatHandler } from "../handlers/RegularChatHandler";
import { MessageContext } from "@/app/types/message";

export class MessageHandlerFactory {
  static createHandler(
    agentType: AgentType,
    context: MessageContext
  ): MessageHandler {
    switch (agentType) {
      case AgentType.AgentCreator:
        return new AgentCreatorHandler(context);
      default:
        return new RegularChatHandler(context);
    }
  }
}
