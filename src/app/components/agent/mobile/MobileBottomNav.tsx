"use client";

import { Box, Button, Grid, Icon, IconProps, Text } from "@chakra-ui/react";
import { InfoIcon } from "../../icons/info";
import { ChartIcon } from "../../icons/chart";
import { ChatIcon } from "../../icons/chat";
import { colorTokens } from "../../theme/theme";

export type TabKey = "info" | "chart" | "chat";

type Item = {
  key: TabKey;
  label: string;
  icon: (props: IconProps) => JSX.Element;
};

const ITEMS: Item[] = [
  { key: "info", label: "Info", icon: InfoIcon },
  { key: "chart", label: "Chart", icon: ChartIcon },
  { key: "chat", label: "Chat", icon: ChatIcon },
];

export default function MobileBottomNav({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (key: TabKey, index: number) => void;
}) {
  return (
    <Box position="fixed" left={0} right={0} bottom={0} zIndex={20}>
      <Box
        bg={colorTokens.blackCustom.a1}
        color="whiteAlpha.900"
        borderTopWidth="1px"
        borderColor={colorTokens.green.dark}
        px={3}
        py={2}
        pb="calc(env(safe-area-inset-bottom) + 10px)" // notch safe
        w="100%"
        maxW="100dvw"
      >
        <Grid templateColumns="repeat(3, 1fr)" gap={2} alignItems="center">
          {ITEMS.map(({ key, label, icon }, i) => {
            const isActive = active === key;
            const tint = isActive
              ? colorTokens.green.erin
              : colorTokens.gray.platinum;
            return (
              <Button
                key={key}
                h="56px"
                w="100%"
                display="flex"
                flexDir="column"
                gap="2px"
                justifyContent="center"
                bg="transparent"
                _hover={{ bg: "whiteAlpha.100" }}
                onClick={() => onChange(key, i)}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon as={icon} color={tint} boxSize="18px" />
                <Text fontSize="xs" color={tint}>
                  {label}
                </Text>
              </Button>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
}
