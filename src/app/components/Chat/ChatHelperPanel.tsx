import { Flex } from "@chakra-ui/react";
import { ChatHelperButton } from "./ChatHelperButton";
import {Agent} from "@/app/types/agent";

interface HelperOption {
  label: string;
  message: string;
}

const helperOptions: HelperOption[] = [
  {
    label: "Agent creation",
    message: "How do I create an agent on Aptos AI Layer?",
  },
  {
    label: "Token creation",
    message: "How is my token created on Aptos AI Layer?",
  },
];


const helperOptionsAgentPage: HelperOption[] = [
  {
    label: "Generate video",
    message: "Could you please generate me a video?",
  },
  {
    label: "Post on X",
    message: "Could you create a post on X?",
  },
  {
    label: "Post on Telegram",
    message: "Could you create a post on Telegram? ",
  },
];
interface ChatHelperPanelProps {
  onSelect: (message: string) => void;
  agent: Agent;
}

export const ChatHelperPanel = ({ onSelect, agent }: ChatHelperPanelProps) => (
  <Flex
    w="100%"
    gap={2}
    flexWrap="wrap-reverse"
    mx="auto"
    align="flex-end"
    justify="center"
    flexShrink={0}
  >
      {(agent.fa_id ? helperOptionsAgentPage : helperOptions).map((option) => (
        <ChatHelperButton
          key={option.label}
          label={option.label}
          onButtonClick={() => onSelect(option.message)}
        />
      ))}
    </Flex>
  );
