"use client";

import ChatsPageDesktop from "@/app/components/ui/chats/ChatsPageDesktop";
import { ChatsPageMobile } from "@/app/components/ui/chats/ChatsPageMobile";
import { GroupChatEntry } from "@/app/lib/chat";
import { useEffect, useState } from "react";

export default function ChatsPage() {
  const [groupChats, setGroupChats] = useState<GroupChatEntry[]>([]);
  const [activeChat, setActiveChat] = useState<number>();

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
    const index = groupChats.findIndex((groupChat) => groupChat.id == chat.id);
    setActiveChat(index);
  };

  return (
    <div>
      {typeof window !== "undefined" && window.innerWidth >= 768 ? (
        <ChatsPageDesktop groupChats={groupChats} activeChat={activeChat} selectChat={selectChat} />
      ) : (
        <ChatsPageMobile groupChats={groupChats} activeChat={activeChat} selectChat={selectChat} />
      )}
    </div>
  );
}
