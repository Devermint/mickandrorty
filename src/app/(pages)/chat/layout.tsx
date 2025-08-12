import { Metadata } from "next";
import ChatPage from "../chat/page";
import FullHeightLayout from "@/app/components/Layout/FullHeightLayout";

export const metadata: Metadata = {
  title: "Chat | Aptoslayer.ai",
};

export default function ChatLayout() {
  return (
    <FullHeightLayout>
      <ChatPage />;
    </FullHeightLayout>
  );
}
