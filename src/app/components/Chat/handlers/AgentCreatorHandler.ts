import { ChatState } from "@/app/types/message";
import { MessageHandler } from "./base/MessageHandler";
import { AgentCreationData, createAgent } from "@/app/lib/utils/agentCreation";

export class AgentCreatorHandler extends MessageHandler {
  async handleMessage(text: string): Promise<void> {
    this.addUserMessage(text);
    this.context.setChatState(ChatState.PROCESSING);

    try {
      const response = await fetch("/api/chat/create-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...this.context.messages,
            { role: "user", content: text, type: "text" },
          ],
        }),
      });

      const body = await response.json();
      const { markdown, notice, kind, data } = body;

      this.addAssistantMessage(markdown ?? notice, kind, data);

      if (kind === "signature-required") {
        this.context.setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            ...prev[prev.length - 1],
            onAgentCreate: this.handleAgentCreation.bind(this),
          },
        ]);
      }
    } catch (error) {
      this.addErrorMessage(error);
    } finally {
      this.context.setChatState(ChatState.IDLE);
    }
  }

  private async handleAgentCreation(
    agentData: AgentCreationData
  ): Promise<void> {
    const { wallet, account, isConnected, swapSDK } = this.context;

    if (!wallet || !account?.address || !isConnected) {
      this.addAssistantMessage(
        "Wallet not connected. Please connect your wallet first.",
        "error"
      );
      return;
    }

    this.addAssistantMessage("", "loader");

    try {
      const result = await createAgent(
        agentData,
        swapSDK,
        wallet,
        account.address.toString()
      );

      const successMessage = this.buildAgentCreationSuccessMessage(
        agentData,
        result
      );
      this.replaceLastMessage(successMessage, "text");

      await this.finalizeAgentCreation(agentData, result, account.address);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Agent creation failed";
      this.replaceLastMessage(
        `Agent creation failed\n\n**Error:** ${errorMessage}\n\nPlease try again or check your wallet connection. If the error persists, the agent may already exist for this wallet.`,
        "error"
      );
      console.error("Agent creation failed:", error);
    }
  }

  private buildAgentCreationSuccessMessage(
    agentData: AgentCreationData,
    result: any
  ): string {
    return `Agent created successfully!\n\n**Token Name:** ${
      agentData.tokenName
    }\n**Symbol:** ${agentData.tokenTicker}\n**Transaction Hash:** \`${
      result.agentHash
    }\`\n\n${
      result.poolHash ? `**Pool Created:** \`${result.poolHash}\`\n` : ""
    }${
      result.liquidityHash
        ? `**Liquidity Added:** \`${result.liquidityHash}\`\n`
        : ""
    }${result.swapHash ? `**Swap Executed:** \`${result.swapHash}\`\n` : ""}${
      result.removeLiquidityHash
        ? `**Liquidity Removed:** \`${result.removeLiquidityHash}\`\n`
        : ""
    }\nYour agent is now live on the Aptos blockchain!`;
  }

  private async finalizeAgentCreation(
    agentData: AgentCreationData,
    result: any,
    address: string
  ): Promise<void> {
    try {
      await fetch("/api/agent/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...agentData,
          txHash: result.agentHash,
          userAddress: address,
          agentMeta: result.agentMeta,
        }),
      });
    } catch (error) {
      console.warn("Failed to finalize on backend:", error);
    }
  }
}
