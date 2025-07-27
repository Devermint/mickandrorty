import { Metadata } from "next";
import AgentsPage from "./page";

export const metadata: Metadata = {
  title: "Home | Aptoslayer.ai",
};

export default function HomeLayout() {
  return <AgentsPage />;
}
