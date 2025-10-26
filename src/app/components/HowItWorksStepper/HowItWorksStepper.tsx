"use client";

import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { colorTokens } from "../theme/theme";
import { RxDividerHorizontal } from "react-icons/rx";

export interface StepDefinition {
  title: string;
  description: string;
}

export interface HowItWorksStepperProps {
  steps: StepDefinition[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  title?: string;
  nextLabel?: string;
  doneLabel?: string;
}

export const HowItWorksStepper = ({
  steps,
  isOpen,
  onClose,
  onComplete,
  title = "How it works",
  nextLabel = "Next",
  doneLabel = "Done",
}: HowItWorksStepperProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (activeIndex < steps.length - 1) {
      setActiveIndex((prev) => prev + 1);
      return;
    }
    if (onComplete) onComplete();
    onClose();
  };

  const currentStep = steps[activeIndex] ?? steps[0];

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
    >
      <Portal>
        <Dialog.Backdrop
          bg="rgba(9, 10, 11, 0.6)"
          backdropFilter="blur(10px)"
        />
        <Dialog.Positioner mt={20} px={4}>
          <Dialog.Content
            bg={colorTokens.gray.tertiaryDark}
            color={colorTokens.gray.timberwolf}
            border="1px solid"
            borderColor={colorTokens.gray[400]}
            borderRadius="2xl"
            px={{ base: 5, md: 6 }}
            py={{ base: 5, md: 6 }}
            minW={{ base: "92vw", md: "420px" }}
            boxShadow="0px 24px 64px rgba(12, 12, 12, 0.32)"
          >
            <Dialog.Header px={0} pt={0} pb={4}>
              <Flex align="center" justify="center" w="full">
                <Text
                  fontWeight={400}
                  color={colorTokens.gray.timberwolf}
                  fontSize={{ base: 16, md: 20 }}
                >
                  {title}
                </Text>
              </Flex>
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  position="absolute"
                  top={4}
                  right={4}
                  color={colorTokens.gray.timberwolf}
                  _hover={{ bg: colorTokens.blackCustom.a2 }}
                  border="none"
                />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body px={0}>
              <Flex
                border="1px solid"
                borderColor={colorTokens.gray[300]}
                w="90%"
                mx="auto"
              />
              <Flex justify="center" mb={6} gap={2} mt={4}>
                {steps.map((_, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <Box
                      key={index}
                      w={isActive ? 30 : "20px"}
                      h="6px"
                      borderRadius={15}
                      transition="all 0.5s ease"
                      bg={
                        isActive
                          ? colorTokens.green.salad
                          : colorTokens.gray[300]
                      }
                      opacity={isActive ? 1 : 0.32}
                    />
                  );
                })}
              </Flex>

              <Box textAlign="center">
                <Text
                  fontFamily="inter"
                  fontWeight={500}
                  fontSize={{ base: 16, md: 20 }}
                  mb={3}
                >
                  {currentStep.title}
                </Text>
                <Text
                  fontFamily="inter"
                  fontSize="sm"
                  color={colorTokens.gray.platinum}
                >
                  {currentStep.description}
                </Text>
              </Box>
            </Dialog.Body>

            <Dialog.Footer px={0} pt={6}>
              <Button
                w="full"
                borderRadius="full"
                color={colorTokens.gray.timberwolf}
                bg="transparent"
                border="1px solid"
                borderColor={colorTokens.gray[400]}
                _hover={{ bg: colorTokens.blackCustom.a2 }}
                _active={{ bg: colorTokens.blackCustom.a2 }}
                onClick={handleNext}
              >
                {activeIndex === steps.length - 1 ? doneLabel : nextLabel}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default HowItWorksStepper;
