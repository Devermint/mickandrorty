import { Box, Flex, Image, Text, Button } from "@chakra-ui/react";
import { X } from "../icons/x";
import { Telegram } from "../icons/telegram";

export const AgentCard = () => {
  return (
    <Flex
      direction="column"
      align="center"
      position="relative"
      width="fit-content"
    >
      <Box w="195px" h="195px" borderRadius="full" overflow="hidden">
        <Image
          src="agents/agent-bg.gif"
          alt="swirl"
          width="100%"
          height="100%"
          objectFit="contain"
          scale={2}
        />
        <Image
          src="agents/agent-bg.gif"
          alt="swirl"
          width="100%"
          height="100%"
          objectFit="contain"
          scale={2}
        />
      </Box>

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
        zIndex={0}
      >
        <Box>
          <Text fontSize="sm" fontWeight="bold" color="black">
            Jane Doe
          </Text>
          <Text fontSize="xs" color="gray.600">
            AI Strategist
          </Text>
        </Box>

        <Flex gap={2}>
          <Button borderRadius={22} p={4} h={11} w={11} border="none">
            <X h={13} w={13} />
          </Button>
          <Button borderRadius={22} p={4} h={11} w={11} border="none">
            <Telegram h={13} w="14px" mr={0.5} />
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};
