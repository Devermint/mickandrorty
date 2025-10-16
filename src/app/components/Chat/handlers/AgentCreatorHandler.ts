import { ChatState } from "@/app/types/message";
import { MessageHandler } from "./base/MessageHandler";
import { AgentCreationData, createAgent } from "@/app/lib/utils/agentCreation";

export class AgentCreatorHandler extends MessageHandler {
  async handleMessage(text: string): Promise<void> {
    this.addUserMessage(text);
    const context = this.getContext();
    context.setChatState(ChatState.PROCESSING);

    try {
      const response = await fetch("/api/chat/create-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...context.messages,
            { role: "user", content: text, type: "text" },
          ],
        }),
      });

      const body = await response.json();
      const { markdown, notice, kind, data } = body;

      this.addAssistantMessage(markdown ?? notice, kind, data);

      if (kind === "signature-required") {
        context.setMessages((prev) => [
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
      this.getContext().setChatState(ChatState.IDLE);
    }
  }

  private async handleAgentCreation(
    agentData: AgentCreationData
  ): Promise<void> {
    const { wallet, account, isConnected, swapSDK } = this.getContext();

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
    const telegramBotLine = `**Telegram Bot:** ${
      agentData.telegramBotToken ?? "Not linked"
    }`;
    const telegramChannelsLine = `**Telegram Channels:** ${
      agentData.telegramChannelIds && agentData.telegramChannelIds.length
        ? agentData.telegramChannelIds.join(", ")
        : "None linked"
    }`;

    return `Agent created successfully!\n\n**Token Name:** ${
      agentData.tokenName
    }\n**Symbol:** ${agentData.tokenTicker}\n**Transaction Hash:** \`${
      result.agentHash
    }\`\n${telegramBotLine}\n${telegramChannelsLine}\n\n${
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
      const finalizeResponse = await fetch("/api/agent/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...agentData,
          txHash: result.agentHash,
          userAddress: address,
          agentMeta: result.agentMeta,
        }),
      });

      let finalizePayload: unknown = null;
      try {
        const finalizeText = await finalizeResponse.text();
        finalizePayload = finalizeText ? JSON.parse(finalizeText) : null;
      } catch {
        finalizePayload = null;
      }

      if (!finalizeResponse.ok) {
        console.warn(
          "Finalizing agent failed:",
          finalizeResponse.status,
          finalizePayload
        );
      }

      if (
        agentData.telegramBotToken !== undefined ||
        agentData.telegramChannelIds !== undefined
      ) {
        const agentId = this.extractAgentIdentifier(
          finalizePayload,
          result.agentMeta
        );

        if (!agentId) {
          console.warn(
            "Unable to determine agent id for telegram update",
            finalizePayload
          );
          return;
        }

        const updatePayload: Record<string, unknown> = {};

        if (agentData.telegramBotToken !== undefined) {
          updatePayload.telegram_bot_token =
            (agentData.telegramBotToken ?? "").trim();
        }

        if (agentData.telegramChannelIds !== undefined) {
          updatePayload.telegram_channel_ids =
            agentData.telegramChannelIds ?? [];
        }

        try {
          const updateResponse = await fetch(`/api/agents/${agentId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatePayload),
          });

          if (!updateResponse.ok) {
            const errorText = await updateResponse.text().catch(() => "");
            console.warn(
              "Failed to update agent telegram settings:",
              updateResponse.status,
              errorText
            );
          }
        } catch (error) {
          console.warn("Telegram update request failed:", error);
        }
      }
    } catch (error) {
      console.warn("Failed to finalize on backend:", error);
    }
  }

  private extractAgentIdentifier(
    payload: unknown,
    fallback?: unknown
  ): string | null {
    const candidates = [payload, fallback];
    const keys = ["agent_id", "agentId", "id", "fa_id", "faId"];

    for (const candidate of candidates) {
      if (!candidate || typeof candidate !== "object") continue;
      for (const key of keys) {
        const value = (candidate as Record<string, unknown>)[key];
        if (typeof value === "string" && value.trim().length > 0) {
          return value.trim();
        }
      }

      if ("agent" in (candidate as Record<string, unknown>)) {
        const agent = (candidate as Record<string, unknown>).agent;
        if (agent && typeof agent === "object") {
          for (const key of keys) {
            const value = (agent as Record<string, unknown>)[key];
            if (typeof value === "string" && value.trim().length > 0) {
              return value.trim();
            }
          }
        }
      }

      if ("data" in (candidate as Record<string, unknown>)) {
        const dataNode = (candidate as Record<string, unknown>).data;
        if (dataNode && typeof dataNode === "object") {
          for (const key of keys) {
            const value = (dataNode as Record<string, unknown>)[key];
            if (typeof value === "string" && value.trim().length > 0) {
              return value.trim();
            }
          }
        }
      }
    }

    return null;
  }
}
