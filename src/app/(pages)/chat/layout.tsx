import { Metadata } from "next";
import ChatPage from "../chat/page";

export const metadata: Metadata = {
  title: "Home | Aptoslayer.ai",
};

export default function HomeLayout() {
  return <ChatPage />;
}
