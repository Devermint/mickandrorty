"use client";
import { Agent } from "@/app/types/agent";
import { colorTokens } from "../theme/theme";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Image,
  Spacer,
  Text,
} from "@chakra-ui/react";
import TokenSwapForm from "../Token/TokenSwapForm";
import { IoChevronBackOutline } from "react-icons/io5";
import { Telegram } from "../icons/telegram";
import { X } from "../icons/x";
import { useRouter } from "next/navigation";
import { AgentMarketInfo } from "./AgentMarketInfo";
export function formatThousands(num: string | number, sep = ","): string {
  const s = String(num);
  const isNeg = s.startsWith("-");
  const body = isNeg ? s.slice(1) : s;

  const [intPart, fracPart] = body.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sep);

  return (isNeg ? "-" : "") + grouped + (fracPart !== undefined ? "." + fracPart : "");
}
export function formatTinyPrice(numStr?: string) {
  if (!numStr) return <>{numStr}</>;

  // If no decimal, just return grouped integer
  if (!numStr.includes(".")) return <>{formatThousands(numStr)}</>;

  const [intPart, fracPart] = numStr.split(".");

  // Count true leading zeroes in the fractional part
  let trueZeroCount = 0;
  while (fracPart[trueZeroCount] === "0") trueZeroCount++;

  // Next 4 significant digits after the leading zeros
  const significant = fracPart.slice(trueZeroCount).slice(0, 4).padEnd(4, "0");

  const intFmt = formatThousands(intPart); // ← comma group integer part only

  // If there are leading zeros, show 0 + <sup>(additional zeros)</sup>
  if (trueZeroCount > 0) {
    return (
        <>
          {intFmt}.0{trueZeroCount - 1 > 0 && <sup>{trueZeroCount - 1}</sup>}
          {significant}
        </>
    );
  }

  // No leading zeros → normal 4-digit fractional
  return (
      <>
        {intFmt}.{significant}
      </>
  );
}

export const AgentInfoView = ({ agent }: { agent: Agent}) => {
  const router = useRouter();

  const handleBackClick = () => {
    router.push("/agents");
  };
  return (
    <Flex
      flexDir="column"
      p={{ base: 4, md: 0 }}
      bg={{ base: colorTokens.blackCustom.a1, md: colorTokens.blackCustom.a2 }}
      h="100%"
      overflow="auto"
      borderRadius={{ base: "none", md: 11 }}
    >
      <Flex
        direction="column"
        align="flex-start"
        flex={1}
        borderRadius={13}
        bg="linear-gradient(rgba(81, 254, 83, 0.09), rgba(81, 254, 83, 0))"
        p={3}
        maxH="100%"
      >
        <IconButton
          color={colorTokens.gray.timberwolf}
          bg="transparent"
          onClick={handleBackClick}
          display={{ base: "block", md: "none" }}
        >
          <IoChevronBackOutline />
        </IconButton>
        <Flex w="100%" justify="center">
          <Box
            position="relative"
            w={71}
            h={71}
            borderRadius="full"
            overflow="hidden"
          >
            <Image
              src="/agents/agent-bg.gif"
              alt="swirl"
              width="100%"
              height="100%"
              objectFit="cover"
              scale={2}
            />

            <Image
              src={agent.agent_icon_url}
              alt="overlay icon"
              position="absolute"
              top="5"
              left="0"
              width="100%"
              height="100%"
              objectFit="contain"
              pointerEvents="none"
              scale={1.2}
            />
          </Box>
        </Flex>
        <Flex w="100%" justifyContent="space-between" mt={5}>
          <Box>
            <Text
              fontSize={15}
              fontWeight={300}
              color={colorTokens.gray.timberwolf}
            >
              {agent.agent_name}
            </Text>
            <Text fontSize="xs" color={colorTokens.gray.platinum}>
              {agent.tag}
            </Text>
          </Box>

          <Flex gap={2}>
            <Button
              borderRadius={22}
              p={4}
              h={10}
              w={10}
              borderWidth={1}
              borderColor={colorTokens.gray.platinum}
              bgColor="#090A0B"
            >
              <X h={13} w={13} color={colorTokens.gray.timberwolf} />
            </Button>
            <Button
              borderRadius={22}
              p={4}
              h={10}
              w={10}
              borderWidth={1}
              borderColor={colorTokens.gray.platinum}
              bgColor="#090A0B"
            >
              <Telegram
                h={13}
                w="14px"
                mr={0.5}
                color={colorTokens.gray.timberwolf}
              />
            </Button>
          </Flex>
        </Flex>
        <AgentMarketInfo mt={5} agent={agent}/>
      </Flex>
      <Spacer />
      <TokenSwapForm agent={agent} />
    </Flex>
  );
};
