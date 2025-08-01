"use client";

import { Flex, Text } from "@chakra-ui/react";

type Props = {
  text: string;
  textColor?: string;
  alignItems?: string;
  ml?: number;
  onClick: (id: string) => void;
};

export default function NavBarButton({
  text,
  textColor,
  alignItems,
  ml,
  onClick,
}: Props) {
  return (
    <Flex
      direction="column"
      alignItems={alignItems ?? "center"}
      ml={ml}
      cursor="pointer"
      onClick={() => onClick(text)}
    >
      <Text
        userSelect="none"
        fontWeight="400"
        fontSize={{ base: "14px", xl: "20px" }}
        color={textColor}
      >
        {text}
      </Text>
    </Flex>
  );
}
