import { Metadata } from "next";
import StakePage from "./page";

export const metadata: Metadata = {
  title: "Stake | Aptoslayer.ai",
};

export default function StakeLayout() {
  return <StakePage />;
}
