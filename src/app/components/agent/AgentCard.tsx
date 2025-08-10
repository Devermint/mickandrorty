import { Box, Flex, Image, Text, Button } from "@chakra-ui/react";
import { X } from "../icons/x";
import { Telegram } from "../icons/telegram";
import { Agent } from "@/app/types/agent";
import { colorTokens } from "../theme/theme";

type AgentCardProps = {
  agent: Agent;
  isActive: boolean;
};

export const AgentCard = ({ isActive, agent }: AgentCardProps) => (
  <Flex
    direction="column"
    align="center"
    position="relative"
    width="fit-content"
    overflow="visible"
    mx={10}
  >
    <Box
      position="relative"
      w="195px"
      h="195px"
      borderRadius="full"
      overflow="hidden"
      boxShadow={
        isActive
          ? `
        0 0 15px 5px rgba(81, 254, 83, 0.3),
        0 0 30px 10px rgba(81, 254, 83, 0.3),
        inset 0 0 10px rgba(81, 254, 83, 0.2)
      `
          : `none`
      }
    >
      <Image
        src="agents/agent-bg.gif"
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

    {isActive && (
      <Box
        position="absolute"
        top="180px"
        width="273px"
        height="66px"
        borderRadius="23px"
        bg="rgba(81, 254, 83, 0.05)"
        backdropFilter="blur(42.6px)"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={4}
        zIndex={1}
        overflow="visible"
      >
        <Box>
          <Text
            fontSize="sm"
            fontWeight="bold"
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
            h={11}
            w={11}
            border="none"
            bgColor="#090A0B"
          >
            <X h={13} w={13} />
          </Button>
          <Button
            borderRadius={22}
            p={4}
            h={11}
            w={11}
            border="none"
            bgColor="#090A0B"
          >
            <Telegram h={13} w="14px" mr={0.5} />
          </Button>
        </Flex>
      </Box>
    )}
  </Flex>
);
