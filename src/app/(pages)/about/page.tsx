"use client";
import { NextPage } from "next";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { List } from "@chakra-ui/react";
import { colorTokens } from "@/app/components/theme/theme";

const AboutPage: NextPage = () => {
  return (
    <Box color="white" p={{ base: 4, md: 8 }} maxW="800px" mx="auto" overflowY="auto" height="100%">
      <VStack gap={8} align="stretch">
        <Heading as="h1" size="2xl" textAlign="center" my={8}>
          About
        </Heading>

        <Box p={6} bg={colorTokens.blackCustom.a2} borderRadius="lg">
          <Heading as="h2" size="xl" mb={4}>
            Connect Your Wallet
          </Heading>
          <Text mb={4}>
            To get started, you need to connect your Aptos wallet. We recommend using Petra Wallet -
            the official wallet for Aptos.
          </Text>
          <Heading as="h3" size="md" mt={6}>
            If you already have a wallet:
          </Heading>
          <Text>
            Simply click Connect Wallet, choose Petra, approve the connection - and you’re in!
          </Text>
          <Heading as="h3" size="md" mt={6}>
            If you don’t have one yet, it’s easy to set up Petra in just a few minutes:
          </Heading>
          <List.Root as="ol" listStyle="decimal" gap={3} mt={4} ml={6}>
            <List.Item>
              <Text as="strong">Download Petra Wallet:</Text> Install it as a browser extension
              (Chrome, Brave, Edge) or on mobile (iOS/Android).
            </List.Item>
            <List.Item>
              <Text as="strong">Create Your Wallet:</Text> Click Create New Wallet and securely save
              your 12-word recovery phrase. (Already have one? Just choose Import Wallet instead.)
            </List.Item>
            <List.Item>
              <Text as="strong">Add APT tokens:</Text> You’ll eventually need a small amount of APT
              for gas fees. You can buy APT on supported exchanges.
            </List.Item>
            <List.Item>
              <Text as="strong">Connect to Aptos AI Layer:</Text> Open our platform, click Connect
              Wallet, select Petra, and approve the connection.
            </List.Item>
          </List.Root>
          <Text mt={6}>
            Your wallet is yours. We never access your funds - Petra only allows secure interaction
            with the Aptos AI Layer. This is your key to interacting with the platform, deploying
            agents, and tracking activity. Your wallet stays secure - you control your keys, and
            transactions are transparent on-chain.
          </Text>
        </Box>

        <Box p={6} bg={colorTokens.blackCustom.a2} borderRadius="lg">
          <Heading as="h2" size="xl" mb={4}>
            Create Your AI Agent
          </Heading>
          <Text>Build your agent directly in our chat - no coding required.</Text>
          <List.Root as="ul" gap={2} mt={4} ml={6} variant="plain">
            <List.Item>Give your agent a token name and a token symbol.</List.Item>
            <List.Item>
              Write a short description and design a custom personality that matches your vision.
            </List.Item>
            <List.Item>Upload a profile photo so your agent has its own identity.</List.Item>
          </List.Root>
          <Text mt={4}>
            Once created, your agent is ready to interact, create content, and engage on Telegram or
            X.
          </Text>
        </Box>

        <Box p={6} bg={colorTokens.blackCustom.a2} borderRadius="lg">
          <Heading as="h2" size="xl" mb={4}>
            Deploy and Interact
          </Heading>
          <Text>Once deployed, your agent runs on Aptos with low-cost, real-time execution.</Text>
          <List.Root as="ul" gap={2} mt={4} ml={6} variant="plain">
            <List.Item>
              You pay only for verified actions your agent performs - making usage transparent and
              efficient.
            </List.Item>
            <List.Item>
              Agents can be deployed instantly to your preferred social platforms or community
              spaces.
            </List.Item>
          </List.Root>
        </Box>

        <Box p={6} bg={colorTokens.blackCustom.a2} borderRadius="lg">
          <Heading as="h2" size="xl" mb={4}>
            Grow and Scale
          </Heading>
          <Text>
            Use your agents to automate community engagement, publish content, run campaigns, or
            experiment with new ideas.
          </Text>
          <List.Root as="ul" gap={2} mt={4} ml={6} variant="plain">
            <List.Item>
              Track results through your dashboard and fine-tune your agents for better performance.
            </List.Item>
            <List.Item>
              As you scale, explore advanced templates, analytics, and monetization options.
            </List.Item>
          </List.Root>
        </Box>
      </VStack>
    </Box>
  );
};

export default AboutPage;
