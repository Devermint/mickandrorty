"use client";
import { Agent } from "@/app/types/agent";
import { colorTokens } from "../theme/theme";
import { Box, Button, Flex, IconButton, Image, Text } from "@chakra-ui/react";
import TokenSwapForm from "../Token/TokenSwapForm";
import { IoChevronBackOutline } from "react-icons/io5";
import { Telegram } from "../icons/telegram";
import { X } from "../icons/x";
import { useRouter } from "next/navigation";
import { AgentMarketInfo } from "./AgentMarketInfo";

export const MobileAgentInfoView = ({ agent }: { agent: Agent }) => {
  const router = useRouter();

  const handleBackClick = () => {
    router.push("/agents");
  };
  return (
    <Box p={4} bg={colorTokens.blackCustom.a1} h="100%" overflow="auto">
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
              src={agent.image}
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
              {agent.name}
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
        <AgentMarketInfo
          priceUsd={"Nan"}
          price={"Nan"}
          liquidity={"Nan"}
          mktCap={"Nan"}
          mt={5}
        />
      </Flex>
      <TokenSwapForm agent={agent} />
    </Box>
  );
};
