"use client";

import { ChatEntry } from "@/app/lib/chat";
import AgentMessage from "./AgentMessage";
import ErrorMessage from "./ErrorMessage";
import PersonMessage from "./PersonMessage";

function ChatMessage({ entry, agentImage }: { entry: ChatEntry; agentImage: string }) {
  return (
    <div>
      {(entry.alignment === "right" && <PersonMessage entry={entry} />) ||
        (entry.alignment === "left" && <AgentMessage entry={entry} agentImage={agentImage} />) ||
        (entry.alignment === "error" && <ErrorMessage entry={entry} />)}
    </div>
  );
}

export default ChatMessage;
