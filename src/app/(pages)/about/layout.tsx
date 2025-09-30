import { Metadata } from "next";
import FullHeightLayout from "@/app/components/Layout/FullHeightLayout";
import AboutPage from "./page";

export const metadata: Metadata = {
  title: "About | Aptoslayer.ai",
};

export default function AboutLayout() {
  return (
    <FullHeightLayout>
      <AboutPage />
    </FullHeightLayout>
  );
}
