import { Metadata } from "next";
import HomePage from "./page";

export const metadata: Metadata = {
  title: "Home | Aptoslayer.ai",
};

export default function HomeLayout() {
  return <HomePage />;
}
