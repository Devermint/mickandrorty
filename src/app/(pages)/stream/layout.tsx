import { Metadata } from "next";
import StreamPage from "./page";

export const metadata: Metadata = {
  title: "Stream | Aptoslayer.ai",
};

export default function StreamLayout() {
  return <StreamPage />;
}
