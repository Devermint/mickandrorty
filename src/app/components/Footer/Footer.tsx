"use client";

import { Flex, Box, Button } from "@chakra-ui/react";
import Link from "next/link";
import { colorTokens } from "../theme/theme";
import { GlobeIcon } from "../icons/globe";

export default function Footer() {
  return (
    <>
      <Flex
        display={{ base: "none", md: "flex" }}
        w="100%"
        bg="#101010"
        justify="center"
        px={{ base: 3, md: 5, lg: 10 }}
        borderTop="1px solid"
        borderColor={colorTokens.gray[300]}
        py={1}
      >
        <Flex
          wrap={{ base: "nowrap", md: "wrap", lg: "nowrap" }}
          maxW={{ base: "unset", lg: 1620 }}
          w="100%"
          background="transparent"
          position="relative"
          pt={{ md: 5, lg: 0 }}
        >
          <Flex
            w={{ base: "100%", md: "50%", lg: "auto" }}
            order={{ md: 1 }}
            justify="flex-start"
            h={{ md: "auto", lg: "100%" }}
            maxH="100%"
            position={{ md: "relative", lg: "absolute" }}
            left={0}
            align="center"
          >
            <Button
              fontSize={14}
              color={colorTokens.gray.tertiary}
              borderRadius={33}
              bg="transparent"
              gap={5}
              fontFamily="inter"
              px={20}
              border="1px solid"
              borderColor={colorTokens.gray.disabled}
              onClick={() =>
                window.open("https://aptoslayer.ai/", "_blank", "noopener,noreferrer")
              }
            >
              <GlobeIcon
                h={5}
                w="auto"
                color={colorTokens.gray.tertiary}
                lineHeight={1.5}
              />
              Visit AptosLayerAI
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
              fontFamily="inter"
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
            align="center"
          >
            <Box
              fontSize={{ base: 13, lg: 13 }}
              lineHeight={1.5}
              textAlign={{ base: "left", md: "right", lg: "right" }}
              color={colorTokens.gray.platinum}
              fontFamily="inter"
            >
              Copyrights reserved by Aptos AI Layer <br /> 2025
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
