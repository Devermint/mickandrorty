import { Metadata } from "next";
import { ReactNode } from "react";
import FullHeightLayout from "@/app/components/Layout/FullHeightLayout";

export const metadata: Metadata = {
  title: "Predictions | Aptoslayer.ai",
};

export default function PredictionsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <FullHeightLayout>{children}</FullHeightLayout>;
}
