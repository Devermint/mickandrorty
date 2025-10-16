import { AgentInput } from "../Agents/AgentInput";

interface ChatInputBarProps {
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
}: ChatInputBarProps) => (
  <AgentInput
    h="17%"
    flexShrink={0}
    m={3}
    w="auto"
    p={0}
    inputRef={inputRef}
    onButtonClick={onSend}
    showAiToggle={showAiToggle}
    aiToggleChecked={aiToggleChecked}
    onAiToggleChange={onAiToggleChange}
    aiToggleDisabled={aiToggleDisabled}
    aiToggleTooltip={aiToggleTooltip}
  />
);
