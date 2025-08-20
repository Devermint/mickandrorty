"use client";
import { Button, Flex, FlexProps, Textarea } from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";
import AnimatedBorderBox from "../AnimatedBorderBox/AnimatedBorderBox";
import { ArrowUp } from "../icons/arrowUp";
import { ChangeEvent, useState } from "react";

interface Props extends FlexProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  onButtonClick: () => void;
  disabled?: boolean;
}

export const AgentInput = ({
  inputRef,
  onButtonClick,
  disabled,
  ...rest
}: Props) => {
  const [inputValue, setInputValue] = useState("");

  const onInputKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    const isPlainEnter =
      e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey;

    if (!isPlainEnter) return;

    e.preventDefault();
    onButtonClick();
  };
  return (
    <AnimatedBorderBox
      animationColor="rgba(0, 255, 109, 1)"
      borderColor="rgba(42, 189, 105, 0.6)"
      borderWidth={1}
      borderRadius={13}
      bgColor={colorTokens.blackCustom.a1}
      onKeyDown={(e) => onInputKeyDown(e)}
      {...rest}
    >
      <Flex
        h="100%"
        p={{ base: 2, md: 3 }}
        align="flex-end"
        w="100%"
        maxH="100%"
      >
        <Textarea
          h="100%"
          fontFamily="Jetbrains mono"
          placeholder="Start generating..."
          color={colorTokens.gray.platinum}
          transition="box-shadow 0.3s ease"
          border="none"
          borderRadius={13}
          _focus={{
            outline: "none",
            boxShadow: "none",
          }}
          resize="none"
          p={1}
          ref={inputRef}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setInputValue(e.target.value)
          }
        />

        <Button
          borderRadius={22}
          maxH={35}
          maxW={35}
          p={0}
          border="none"
          onClick={onButtonClick}
          disabled={inputValue.length === 0 || disabled}
        >
          <ArrowUp h="full" w="full" />
        </Button>
      </Flex>
    </AnimatedBorderBox>
  );
};
