"use client";
import { Button } from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";
import {ReactNode} from "react";

interface ChatHelperButtonProps {
  label: string | ReactNode;
  onButtonClick?: (value?: string) => void;
  chatEntry?: string;
  disabled?: boolean;
}
export const ChatHelperButton = ({
  label,
  onButtonClick,
  chatEntry,
    disabled
}: ChatHelperButtonProps) => {
  const handleClick = () => {
    if(onButtonClick && chatEntry) {
      onButtonClick(chatEntry);
    }
    else if(onButtonClick){
      onButtonClick()
    }
  };

  return (
    <Button
      onClick={handleClick}
      fontSize={13}
      disabled={disabled}
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
