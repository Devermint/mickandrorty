import { Metadata } from "next";
import CreatePage from "./page";

export const metadata: Metadata = {
  title: "Create | Aptoslayer.ai",
};

export default function CreateLayout() {
  return <CreatePage />;
}
