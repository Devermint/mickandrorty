import { Metadata } from "next";
import FullHeightLayout from "@/app/components/Layout/FullHeightLayout";
import MyAgentsPage from "./page";

export const metadata: Metadata = {
  title: "Chat | Aptoslayer.ai",
};

export default function ChatLayout() {
  return (
    <FullHeightLayout>
      <MyAgentsPage />;
    </FullHeightLayout>
  );
}
