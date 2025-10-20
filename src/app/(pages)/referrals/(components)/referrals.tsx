import { colorTokens } from "@/app/components/theme/theme";
import {
  Box,
  Button,
  Color,
  Flex,
  IconButton,
  Text,
  useClipboard,
} from "@chakra-ui/react";
import Image from "next/image";
import { LuCheck, LuCopy } from "react-icons/lu";
import type { MouseEvent } from "react";
import { Referral } from "@/app/types/user";
import { getEllipsisAddress } from "@/app/lib/utils/formatters";
import { PointsIcon } from "@/app/components/icons/points";

interface ReferalsProps {
  referalLink: string;
  referrals: Referral[];
}

export default function Referrals({ referalLink, referrals }: ReferalsProps) {
  const clipboard = useClipboard({ value: referalLink, timeout: 2000 });

  const handleCopy = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    try {
      clipboard.copy();
    } catch (error) {
      console.warn("Copy to clipboard failed:", error);
    }
  };

  return (
    <>
      <Box
        borderRadius={27}
        bg={colorTokens.gray.tertiaryDark}
        py={3}
        px={4}
        overflow="hidden"
      >
        <Text color="white" fontSize={14}>
          Referral link:
        </Text>
        <Flex align="center" justify="space-between" mt={4} gap={3}>
          <Flex
            border="1px dashed"
            borderRadius={19}
            borderColor={colorTokens.gray.platinum}
            w="full"
            justifyContent="space-between"
            pl={4}
            pr={2}
            align="center"
          >
            <Text>
              {referalLink.includes("=")
                ? referalLink.split("=")[1]
                : referalLink}
            </Text>
            <IconButton
              aria-label={clipboard.copied ? "Copied" : "Copy wallet address"}
              size="xs"
              variant="ghost"
              color={colorTokens.gray.tertiary}
              onClick={handleCopy}
              border="none"
              _hover={{ color: colorTokens.gray.disabled, bg: "transparent" }}
              _active={{ color: colorTokens.gray.disabled, bg: "transparent" }}
            >
              {clipboard.copied ? <LuCheck size={12} /> : <LuCopy size={12} />}
            </IconButton>
          </Flex>
          <Button
            bg="white"
            borderRadius={19}
            color="black"
            fontWeight="medium"
            fontSize={13}
          >
            Share
          </Button>
        </Flex>
      </Box>
      <Box
        borderRadius={27}
        bg={colorTokens.gray.tertiaryDark}
        py={3}
        px={4}
        mt={3}
        overflow="hidden"
      >
        <Flex gap={2} mb={3}>
          <Text color="white" fontSize={14}>
            Friends list:
          </Text>
          <Box
            borderRadius={24}
            bg="white"
            color="black"
            w={5}
            h={5}
            textAlign="center"
            fontSize={14}
          >
            {referrals.length}
          </Box>
        </Flex>
        {referrals
          .sort((a, b) => b.score - a.score)
          .map((referral) => (
            <Flex
              justify="space-between"
              mb={2}
              bg={colorTokens.gray[400]}
              borderRadius={15}
              p="7px"
              key={referral.wallet_address}
            >
              <Flex align="center" gap={3}>
                <Image
                  width={33}
                  height={33}
                  src="/img/user-icon.png"
                  alt="User avatar"
                />
                <Text color={colorTokens.gray.disabled} lineHeight={1}>
                  {getEllipsisAddress(referral.wallet_address)}
                </Text>
              </Flex>
              <Flex
                bg={colorTokens.gray.tertiaryDark}
                borderRadius={19}
                align="center"
                px={5}
                gap={2}
              >
                <PointsIcon w="12px" h="12px" />
                <Text lineHeight={1}>{referral.score}</Text>
              </Flex>
            </Flex>
          ))}
      </Box>
    </>
  );
}
