import { Flex } from "@chakra-ui/react";
import { ChatHelperButton } from "./ChatHelperButton";

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

interface ChatHelperPanelProps {
  onSelect: (message: string) => void;
}

export const ChatHelperPanel = ({ onSelect }: ChatHelperPanelProps) => (
  <Flex
    w="100%"
    gap={2}
    flexWrap="wrap-reverse"
    mx="auto"
    align="flex-end"
    justify="center"
    flexShrink={0}
  >
      {helperOptions.map((option) => (
        <ChatHelperButton
          key={option.label}
          label={option.label}
          onButtonClick={() => onSelect(option.message)}
        />
      ))}
    </Flex>
  );
