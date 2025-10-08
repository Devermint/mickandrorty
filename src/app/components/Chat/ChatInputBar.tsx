import { AgentInput } from "../Agents/AgentInput";

interface ChatInputBarProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  onSend: () => void;
}

export const ChatInputBar = ({ inputRef, onSend }: ChatInputBarProps) => (
  <AgentInput
    h="17%"
    flexShrink={0}
    m={3}
    w="auto"
    p={0}
    inputRef={inputRef}
    onButtonClick={onSend}
  />
);
