import { Metadata } from "next";
import ReferralsPage from "./page";
import FullHeightLayout from "@/app/components/Layout/FullHeightLayout";

export const metadata: Metadata = {
  title: "Agents | Aptoslayer.ai",
};

export default function AgentsLayout() {
  return (
    <FullHeightLayout>
      <ReferralsPage />
    </FullHeightLayout>
  );
}
