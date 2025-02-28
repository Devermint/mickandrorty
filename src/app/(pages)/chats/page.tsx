"use client";

import { useMobileBreak } from "@/app/components/responsive";
import ChatsPageDesktop from "@/app/components/ui/chats/ChatsPageDesktop";
import { ChatsPageMobile } from "@/app/components/ui/chats/ChatsPageMobile";
import { GroupChatEntry } from "@/app/lib/chat";
import { useEffect, useState } from "react";

export default function ChatsPage() {
  const [groupChats, setGroupChats] = useState<GroupChatEntry[]>([]);
  const [activeChat, setActiveChat] = useState<number>();
  const isMobile = useMobileBreak();

  useEffect(() => {
    fetch("/api/chats")
      .then((res) => res.json())
      .then((data) => {
        setGroupChats(data);
        if (data.length > 0) {
          setActiveChat(0);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const selectChat = (chat: GroupChatEntry) => {
    console.log(chat, "huh");
    const index = groupChats.findIndex((groupChat) => groupChat.id == chat.id);
    setActiveChat(index);
  };

  return (
    <div>
      {isMobile ? (
        <ChatsPageMobile groupChats={groupChats} activeChat={activeChat} selectChat={selectChat} />
      ) : (
        <ChatsPageDesktop groupChats={groupChats} activeChat={activeChat} selectChat={selectChat} />
      )}
    </div>
  );
}
