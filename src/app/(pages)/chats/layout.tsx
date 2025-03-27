import { Metadata } from "next";
import ChatsPage from "./page";

export const metadata: Metadata = {
  title: "My Chats | Aptoslayer.ai",
};

export default function ChatsLayout() {
  return <ChatsPage />;
}
