"use client";

import { testingGroupChats } from "@/app/lib/data";
import ChatsPageDesktop from "@/app/components/ui/chats/ChatsPageDesktop";
import { ChatsPageMobile } from "@/app/components/ui/chats/ChatsPageMobile";
import { GroupChatEntry } from "@/app/lib/chat";
import { useState } from "react";

export default function ChatsPage() {
  const [activeChat, setActiveChat] = useState<number>(0);

  const selectChat = (chat: GroupChatEntry) => {
    const index = testingGroupChats.findIndex((groupChat) => groupChat.id == chat.id);
    setActiveChat(index);
  };
  return (
    <div>
      {typeof window !== "undefined" && window.innerWidth >= 768 ? (
        <ChatsPageDesktop
          groupChats={testingGroupChats}
          activeChat={activeChat}
          selectChat={selectChat}
        />
      ) : (
        <ChatsPageMobile
          groupChats={testingGroupChats}
          activeChat={activeChat}
          selectChat={selectChat}
        />
      )}
    </div>
  );
}
