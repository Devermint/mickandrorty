"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";

type Props = {
  text: string;
  textColor?: string;
  alignItems?: string;
  ml?: number;
  onClick: (id: string) => void;
  isActive?: boolean;
};

export default function NavBarButton({
  text,
  textColor,
  alignItems,
  ml,
  onClick,
  isActive = false,
}: Props) {
  return (
    <Flex
      direction="column"
      alignItems={alignItems ?? "center"}
      ml={ml}
      cursor="pointer"
      onClick={() => onClick(text)}
      py="10px"
      position="relative"
    >
      <Text
        userSelect="none"
        fontWeight="300"
        fontSize={{ base: "14px", md: 15, xl: 16 }}
        color={textColor}
        fontFamily="inter"
      >
        {text}
      </Text>

      <Box
        position="absolute"
        border="2px solid"
        borderColor={colorTokens.green.erin}
        display={isActive ? "block" : "none"}
        borderRadius="full"
        bottom="-2px"
      ></Box>
    </Flex>
  );
}
