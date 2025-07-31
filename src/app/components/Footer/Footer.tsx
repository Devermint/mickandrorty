"use client";

import { Flex, Box, Button } from "@chakra-ui/react";
import { useMobileBreak } from "../responsive";
import Link from "next/link";
import { colorTokens } from "../theme";
import { GlobeIcon } from "../icons/globe";

export default function Footer() {
  const isMobile = useMobileBreak();

  return (
    <div>
      <Flex display={isMobile ? "none" : "flex"} position="absolute" bottom={0} w="100%">
        <Flex
          h="55px"
          py="5px"
          mx="1rem"
          position="relative"
          background="transparent"
          w="100%"
        >
          <Flex position="absolute" left={0} h="100%" maxH="100%">
            <Button
              fontSize={13}
              color={colorTokens.green.darkErin}
              borderRadius={33}
              borderColor={colorTokens.green.dark}
              bg="transparent"
              gap={5}
            >
              <GlobeIcon h="1.5rem" /> Visit AptosLayerAI
            </Button>
          </Flex>
          <Flex
            align="center"
            justify="center"
            w="100%"
            h="100%"
            padding="0.5rem"
            gap="0.6rem"
          >
            <Box
              fontSize={{ base: 13, lg: 13 }}
              lineHeight={1.5}
              textAlign={{ base: "left", lg: "center" }}
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
          <Flex flexGrow={1} position="absolute" right={0} maxH="100%">
            <Box
              fontSize={{ base: 13, lg: 13 }}
              lineHeight={1.5}
              textAlign={{ base: "left", lg: "right" }}
              color={colorTokens.gray.platinum}
            >
              © Copyrights reserved by blabla <br /> 2025
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
}
