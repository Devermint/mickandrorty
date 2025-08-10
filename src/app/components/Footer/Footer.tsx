"use client";

import { Flex, Box, Button } from "@chakra-ui/react";
import Link from "next/link";
import { colorTokens } from "../theme/theme";
import { GlobeIcon } from "../icons/globe";

export default function Footer() {
  return (
    <Flex
      display={{ base: "none", md: "flex" }}
      position="absolute"
      bottom={0}
      w="100%"
      mt={{ md: 5, lg: 10 }}
    >
      <Flex
        wrap={{ base: "nowrap", md: "wrap", lg: "nowrap" }}
        mx="1rem"
        background="transparent"
        w="100%"
        position="relative"
      >
        <Flex
          w={{ base: "100%", md: "50%", lg: "auto" }}
          order={{ md: 1 }}
          justify="flex-start"
          h={{ md: "auto", lg: "100%" }}
          maxH="100%"
          position={{ md: "relative", lg: "absolute" }}
          left={0}
        >
          <Button
            fontSize={13}
            color={colorTokens.green.darkErin}
            borderRadius={33}
            borderColor={colorTokens.green.dark}
            bg="transparent"
            gap={5}
          >
            <GlobeIcon h="1.5rem" w="auto" /> Visit AptosLayerAI
          </Button>
        </Flex>

        <Flex
          order={{ md: 3 }}
          w="100%"
          align="center"
          justify="center"
          padding="0.5rem"
          gap="0.6rem"
          h={{ md: "auto", lg: "100%" }}
          mt={{ md: 4, lg: 0 }}
        >
          <Box
            fontSize={{ base: 13, lg: 13 }}
            lineHeight={1.5}
            textAlign="center"
            color={colorTokens.gray.platinum}
          >
            <span>By messaging Aptos Layer, you agree to our </span>
            <Link href="">
              <Box as="span" color={colorTokens.gray.timberwolf}>
                Terms
              </Box>
            </Link>
            <Box as="span"> and have read our </Box>
            <Link href="" target="_blank">
              <Box as="span" color={colorTokens.gray.timberwolf}>
                Privacy Policy
              </Box>
            </Link>
            .<br />
            <Box as="span"> See cookie preferences.</Box>
          </Box>
        </Flex>

        <Flex
          w={{ base: "100%", md: "50%", lg: "auto" }}
          order={{ md: 2 }}
          justify="flex-end"
          h={{ md: "auto", lg: "100%" }}
          maxH="100%"
          position={{ md: "relative", lg: "absolute" }}
          right={0}
        >
          <Box
            fontSize={{ base: 13, lg: 13 }}
            lineHeight={1.5}
            textAlign={{ base: "left", md: "right", lg: "right" }}
            color={colorTokens.gray.platinum}
          >
            © Copyrights reserved by blabla <br /> 2025
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
}
