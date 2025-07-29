import { BoxProps, Button, Flex, Textarea } from "@chakra-ui/react";
import { colorTokens } from "../theme";
import AnimatedBorderBox from "../AnimatedBorderBox/AnimatedBorderBox";
import { ArrowUp } from "../icons/arrowUp";

interface Props extends BoxProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  onButtonClick: () => void;
}

export const AgentInput = ({ inputRef, onButtonClick, ...rest }: Props) => {
  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onButtonClick();
    }
  };

  return (
    <AnimatedBorderBox
      animationColor="rgba(0, 255, 109, 1)"
      borderColor="rgba(42, 189, 105, 0.6)"
      borderWidth={1}
      borderRadius={13}
      w="100%"
      bgColor={colorTokens.blackCustom.a1}
      onKeyDown={onInputKeyDown}
      {...rest}
    >
      <Flex h="100%" p={3} align="flex-end">
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
          autoFocus
        ></Textarea>

        <Button
          borderRadius={22}
          maxH={35}
          maxW={35}
          p={0}
          border="none"
          onClick={onButtonClick}
        >
          <ArrowUp h="full" w="full" />
        </Button>
      </Flex>
    </AnimatedBorderBox>
  );
};
