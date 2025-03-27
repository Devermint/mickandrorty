import AgentSelect from "../components/ui/agent/AgentSelect";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Select Agent | Aptoslayer.ai",
};

export default function SelectPage() {
  return <AgentSelect />;
}
