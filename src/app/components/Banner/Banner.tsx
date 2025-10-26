"use client";

import NextLink from "next/link";
import { Flex, Text } from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";

interface Props {
  text: string;
  buttonText: string;
  image: string;
  href?: string;
}

export const Banner = ({ text, buttonText, image, href = "/agent" }: Props) => {
  return (
    <NextLink href={href} passHref legacyBehavior>
      <Flex
        as="a"
        position="relative"
        w="full"
        px={{ base: 6, md: 6 }}
        py={18}
        borderRadius="2xl"
        color="whiteAlpha.900"
        overflow="hidden"
        backgroundImage={`url(${image})`}
        backgroundRepeat="no-repeat"
        backgroundSize="cover"
        backgroundPosition="right"
        minH={120}
        cursor="pointer"
        _hover={{ textDecoration: "none" }}
      >
        <Flex
          direction="column"
          gap={{ base: 2, md: 2 }}
          maxW={{ base: "100%", md: "60%" }}
          zIndex={1}
        >
          <Text
            fontSize={{ base: 14, md: 14 }}
            fontFamily="inter"
            color="white"
            maxW={{ base: 150, md: "unset" }}
          >
            {text}
          </Text>
          <Text
            fontSize={{ base: 13, md: 14 }}
            fontFamily="inter"
            color={colorTokens.gray.tertiary}
            maxW={{ base: 180, md: "unset" }}
          >
            {buttonText}
          </Text>
        </Flex>
      </Flex>
    </NextLink>
  );
};
