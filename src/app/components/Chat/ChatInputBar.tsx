import { FlexProps } from "@chakra-ui/react";
import { AgentInput } from "../Agents/AgentInput";

interface ChatInputBarProps extends FlexProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  onSend: () => void;
  showAiToggle?: boolean;
  aiToggleChecked?: boolean;
  onAiToggleChange?: (value: boolean) => void;
  aiToggleDisabled?: boolean;
  aiToggleTooltip?: string;
}

export const ChatInputBar = ({
  inputRef,
  onSend,
  showAiToggle = false,
  aiToggleChecked,
  onAiToggleChange,
  aiToggleDisabled,
  aiToggleTooltip,
  ...props
}: ChatInputBarProps) => (
  <AgentInput
    h="17%"
    minH="60px"
    flexShrink={0}
    m={{ base: 1, md: 2, lg: 3 }}
    w="auto"
    p={0}
    inputRef={inputRef}
    onButtonClick={onSend}
    showAiToggle={showAiToggle}
    aiToggleChecked={aiToggleChecked}
    onAiToggleChange={onAiToggleChange}
    aiToggleDisabled={aiToggleDisabled}
    aiToggleTooltip={aiToggleTooltip}
    {...props}
  />
);
