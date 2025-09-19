"use client";

import React from "react";
import Image from "next/image";
import {
  Box,
  Flex,
  Text,
  Button,
  SimpleGrid,
  Image as ChakraImage,
  Clipboard,
  useClipboard,
} from "@chakra-ui/react";
import { colorTokens } from "@/app/components/theme/theme";
import { CheckmarkIcon } from "@/app/components/icons/checkmark";
import { TelegramIcon } from "@/app/components/icons/telegram";

const demoTasks = [
  { name: "Share your story", reward: 1000, isComplete: false },
  { name: "Invite a friend", reward: 1500, isComplete: false },
  { name: "Record a testimonial", reward: 800, isComplete: true },
  { name: "Post on social media", reward: 1200, isComplete: false },
  { name: "Host a webinar", reward: 2200, isComplete: false },
  { name: "Publish a blog review", reward: 1800, isComplete: true },
  { name: "Share the referral link", reward: 900, isComplete: false },
  { name: "Introduce us to a partner", reward: 2500, isComplete: false },
  { name: "Submit feedback", reward: 600, isComplete: true },
  { name: "Create a video shoutout", reward: 2000, isComplete: false },
  { name: "Host a webinar", reward: 2200, isComplete: false },
  { name: "Publish a blog review", reward: 1800, isComplete: true },
  { name: "Share the referral link", reward: 900, isComplete: false },
  { name: "Introduce us to a partner", reward: 2500, isComplete: false },
  { name: "Submit feedback", reward: 600, isComplete: true },
  { name: "Create a video shoutout", reward: 2000, isComplete: false },
];

export default function ReferralsPage() {
  const score = 123456;
  const balance = 4141;
  const referrals = 10;
  const isTgConnected = false;

  const referralLink = "https://dapp.aptoslayer.ai/";

  const clipboard = useClipboard({ value: referralLink });

  return (
    <Box
      position="relative"
      display="flex"
      flexDirection="column"
      flex={1}
      minH={0}
      overflowY="auto"
    >
      <Box
        maxW="700px"
        w="full"
        mx="auto"
        p={{ base: 4, md: 8 }}
        bg="transparent"
        display="flex"
        flexDirection="column"
      >
        <SimpleGrid
          templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
          rowGap={4}
        >
          <Flex align="center" gap={4}>
            <Image
              src="/img/logo-mobile.png"
              alt="Logo"
              width={80}
              height={80}
            ></Image>
            <Box>
              <Text
                color="white"
                fontSize={25}
                lineHeight={1.3}
                fontWeight="bold"
              >
                {balance.toLocaleString()}
              </Text>
              <Text fontSize={11} lineHeight={1} fontWeight="bold">
                APTOS
              </Text>
            </Box>
          </Flex>

          <Flex align="center" gap={4}>
            <Box
              mt={10}
              w="100%"
              position="relative"
              overflow="visible"
              flexShrink={0}
              px={5}
              py={15}
              borderRadius={14}
            >
              <Box
                position="absolute"
                width="100%"
                height="100%"
                top={0}
                left={0}
                zIndex={0}
              >
                <ChakraImage
                  src="/img/invite-link-bg.webp"
                  alt="Invite link backdrop"
                  style={{ objectFit: "cover" }}
                />
              </Box>
              <Box zIndex={1} position="relative">
                <Text color="white" fontSize={16}>
                  Your invite link
                </Text>
                <Text color="white" fontSize={14} fontWeight={200}>
                  {referralLink}
                </Text>

                <Button
                  mt={4}
                  borderRadius="full"
                  px={8}
                  py={2}
                  h="auto"
                  fontSize={14}
                  color={colorTokens.blackCustom.a1}
                  bg={colorTokens.green.erin}
                  _hover={{
                    bg: colorTokens.green.darkErin,
                  }}
                  _active={{
                    bg: colorTokens.green.dark,
                  }}
                  transition="background 0.2s ease"
                  onClick={clipboard.copy}
                >
                  {clipboard.copied ? "Copied" : "Copy link "}
                </Button>
              </Box>
              <ChakraImage
                position="absolute"
                top={-3}
                right={5}
                zIndex={2}
                src="/img/tg-image.png"
                h={71}
                w={71}
                opacity={1}
              />
            </Box>
          </Flex>

          <Flex gap={3}>
            <Flex
              borderRadius="full"
              h={10}
              w={10}
              bg={colorTokens.blackCustom.a1}
              justify="center"
              align="center"
            >
              <CheckmarkIcon color={colorTokens.green.erin} h={4} w={4} />
            </Flex>
            <Box>
              <Text fontSize={11} lineHeight={1}>
                Your referrals
              </Text>
              <Text
                color="white"
                fontSize={25}
                lineHeight={1.3}
                fontWeight="bold"
              >
                {referrals.toLocaleString()}
              </Text>
            </Box>
          </Flex>

          <Flex gap={3}>
            <Flex
              borderRadius="full"
              h={10}
              w={10}
              bg={colorTokens.blackCustom.a1}
              justify="center"
              align="center"
            >
              <TelegramIcon color={colorTokens.green.erin} h={4} w={4} />
            </Flex>
            <Box>
              <Text fontSize={20} lineHeight={1.3} color="white">
                Telegram
              </Text>
              <Text
                color={isTgConnected ? colorTokens.green.erin : "red"}
                fontSize={12}
              >
                {isTgConnected ? "Connected" : "Not connected"}
              </Text>
            </Box>
          </Flex>
        </SimpleGrid>

        <Box
          mt={10}
          w="100%"
          position="relative"
          overflow="hidden"
          flexShrink={0}
        >
          <Box position="absolute" inset={0} zIndex={0}>
            <Image
              src="/img/green_clouds.webp"
              alt="Green clouds backdrop"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </Box>

          <Flex
            position="relative"
            zIndex={1}
            direction="column"
            align="center"
            justify="center"
            textAlign="center"
            h="100%"
            py={4}
            px={6}
            gap={1}
          >
            <Text
              color={colorTokens.gray.timberwolf}
              fontSize={24}
              lineHeight={1}
              fontWeight="bold"
            >
              {score.toLocaleString()}
            </Text>
            <Text
              fontSize={13}
              lineHeight={1}
              color={colorTokens.gray.timberwolf}
            >
              Your score
            </Text>
          </Flex>
        </Box>

        <Box mt={10} position="relative" display="flex" flexDirection="column">
          <Text
            fontSize={16}
            letterSpacing="wider"
            color={colorTokens.gray.timberwolf}
            mb={4}
          >
            Tasks
          </Text>

          <Flex position="relative" flexDirection="column">
            <Flex flexDirection="column" gap={3}>
              {demoTasks.map((task, idx) => (
                <Flex key={idx} align="center" justify="space-between">
                  <Flex align="center" gap={4}>
                    <Flex
                      align="center"
                      justify="center"
                      w={10}
                      h={10}
                      borderRadius="full"
                      bg={colorTokens.blackCustom.a3}
                      color={colorTokens.gray.timberwolf}
                      fontSize="lg"
                      fontWeight="semibold"
                    >
                      !
                    </Flex>
                    <Box>
                      <Text color="white">{task.name}</Text>
                      <Text color={colorTokens.gray.platinum} fontSize="sm">
                        +{task.reward.toLocaleString()} Aptos
                      </Text>
                    </Box>
                  </Flex>
                  <Button
                    borderRadius="full"
                    px={6}
                    h={10}
                    fontSize="sm"
                    fontWeight="semibold"
                    cursor={task.isComplete ? "default" : "pointer"}
                    color={
                      task.isComplete
                        ? colorTokens.gray.platinum
                        : colorTokens.blackCustom.a1
                    }
                    bg={
                      task.isComplete
                        ? colorTokens.blackCustom.a3
                        : colorTokens.green.erin
                    }
                    _hover={{
                      bg: task.isComplete
                        ? colorTokens.blackCustom.a3
                        : colorTokens.green.darkErin,
                    }}
                    _active={{
                      bg: task.isComplete
                        ? colorTokens.blackCustom.a3
                        : colorTokens.green.dark,
                    }}
                    transition="background 0.2s ease"
                  >
                    {task.isComplete ? "Done" : "Start"}
                  </Button>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
