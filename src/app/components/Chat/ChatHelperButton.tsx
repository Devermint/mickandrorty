"use client";
import { Button } from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";

interface ChatHelperButtonProps {
  label: string;
  onButtonClick: (value: string) => void;
  chatEntry: string;
}
export const ChatHelperButton = ({
  label,
  onButtonClick,
  chatEntry,
}: ChatHelperButtonProps) => {
  const handleClick = () => {
    onButtonClick(chatEntry);
  };

  return (
    <Button
      onClick={handleClick}
      fontSize={13}
      fontWeight={300}
      color={colorTokens.gray.timberwolf}
      bg="transparent"
      borderWidth={1}
      borderColor={colorTokens.blue.dark}
      borderRadius={30}
      px={3}
      py={1}
      h="auto"
      display="inline-block"
      flexGrow={0}
      flexShrink={0}
      w="auto"
    >
      {label}
    </Button>
  );
};
