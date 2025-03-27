import { Metadata } from "next";
import CommunityPage from "./page";

export const metadata: Metadata = {
  title: "Community | Aptoslayer.ai",
};

export default function CommunityLayout() {
  return <CommunityPage />;
}
