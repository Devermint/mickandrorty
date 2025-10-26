"use client";
import {
  Box,
  Button,
  Flex,
  FlexProps,
  Switch,
  Text,
  Textarea,
  Tooltip,
} from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";
import { sora } from "../theme/fonts";
import AnimatedBorderBox from "../AnimatedBorderBox/AnimatedBorderBox";
import { ArrowUp } from "../icons/arrowUp";
import { ChangeEvent, useState } from "react";

interface Props extends FlexProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  onButtonClick: () => void;
  disabled?: boolean;
  showAiToggle?: boolean;
  aiToggleChecked?: boolean;
  onAiToggleChange?: (value: boolean) => void;
  aiToggleDisabled?: boolean;
  aiToggleTooltip?: string;
}

export const AgentInput = ({
  inputRef,
  onButtonClick,
  disabled,
  showAiToggle = false,
  aiToggleChecked = false,
  onAiToggleChange,
  aiToggleDisabled = false,
  aiToggleTooltip,
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

  const switchRoot = (
    <Switch.Root
      checked={!!aiToggleChecked}
      onCheckedChange={({ checked }) => {
        if (aiToggleDisabled) return;
        onAiToggleChange?.(checked);
      }}
      aria-label={aiToggleChecked ? "Disable Ask AI" : "Enable Ask AI"}
      size="sm"
      aria-disabled={aiToggleDisabled || undefined}
    >
      <Switch.HiddenInput disabled={aiToggleDisabled} />
      <Switch.Control
        display="flex"
        alignItems="center"
        bg={colorTokens.blackCustom.a2}
        cursor={aiToggleDisabled ? "not-allowed" : "pointer"}
        opacity={aiToggleDisabled ? 0.5 : 1}
        _checked={{
          bg: colorTokens.green.erin,
        }}
        _focusVisible={{
          outline: "2px solid",
          outlineColor: colorTokens.green.erin,
          outlineOffset: "2px",
        }}
      >
        <Switch.Thumb
          borderRadius="full"
          bg={
            aiToggleChecked
              ? colorTokens.blackCustom.a2
              : colorTokens.gray.timberwolf
          }
        />
      </Switch.Control>
    </Switch.Root>
  );

  const switchWrapper = (
    <Box
      as="span"
      display="inline-flex"
      pointerEvents="auto"
      cursor={aiToggleDisabled ? "not-allowed" : "pointer"}
    >
      {switchRoot}
    </Box>
  );

  const renderedSwitch =
    aiToggleDisabled && aiToggleTooltip ? (
      <Tooltip.Root openDelay={200} closeDelay={100}>
        <Tooltip.Trigger asChild>{switchWrapper}</Tooltip.Trigger>
        <Tooltip.Positioner>
          <Tooltip.Content
            bg={colorTokens.blackCustom.a2}
            color={colorTokens.gray.timberwolf}
            px={3}
            py={2}
            borderRadius="md"
            fontSize="xs"
            boxShadow="lg"
            fontFamily={sora.style.fontFamily}
            letterSpacing="0.08em"
          >
            {aiToggleTooltip}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Tooltip.Root>
    ) : (
      switchWrapper
    );

  return (
    <AnimatedBorderBox
      animationColor="rgba(42, 42, 42, 1)"
      borderColor="rgba(42, 42, 42, 0.4)"
      borderWidth={1}
      borderRadius={13}
      bgColor="#212121"
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
        <Flex direction="column" h="100%" w="100%" align="flex-end" mr={3}>
          <Textarea
            h="100%"
            fontFamily="Jetbrains mono"
            placeholder="Ask anything..."
            color={colorTokens.gray.tertiary}
            _placeholder={{ color: colorTokens.gray.tertiary }}
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
          {showAiToggle && (
            <Flex align="center" gap={2}>
              <Text
                fontSize="xs"
                color={colorTokens.gray.platinum}
                letterSpacing="0.08em"
                fontFamily={sora.style.fontFamily}
              >
                Ask AI
              </Text>
              {renderedSwitch}
            </Flex>
          )}
        </Flex>

        <Flex align="center" justify="flex-end" gap={3}>
          <Button
            maxH={6}
            maxW={6}
            p={0}
            border="none"
            onClick={onButtonClick}
            disabled={inputValue.length === 0 || disabled}
            minW={0}
          >
            <ArrowUp h="full" w="full" color={colorTokens.gray.disabled} />
          </Button>
        </Flex>
      </Flex>
    </AnimatedBorderBox>
  );
};
