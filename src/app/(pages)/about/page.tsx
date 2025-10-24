"use client";

import { type ReactNode } from "react";
import { NextPage } from "next";
import {
  Box,
  Accordion,
  Flex,
  Heading,
  Icon,
  Text,
  VStack,
  type BoxProps,
  type FlexProps,
  type HeadingProps,
  type TextProps,
  useAccordionItemContext,
} from "@chakra-ui/react";
import {
  FiInfo,
  FiMinus,
  FiMinusCircle,
  FiPlus,
  FiPlusCircle,
  FiXCircle,
} from "react-icons/fi";
import { colorTokens } from "@/app/components/theme/theme";

const SectionCard = ({
  children,
  ...boxProps
}: BoxProps & { children: ReactNode }) => (
  <Box
    bg={colorTokens.gray.tertiaryDark}
    borderRadius={23}
    p={{ base: 6, md: 8 }}
    boxShadow="0 20px 60px rgba(0, 0, 0, 0.25)"
    {...boxProps}
  >
    {children}
  </Box>
);

const SectionHeading = ({
  children,
  ...headingProps
}: HeadingProps & { children: ReactNode }) => (
  <Heading
    fontFamily="Inter, sans-serif"
    fontWeight="500"
    fontSize={{ base: "xl", md: "2xl" }}
    color="white"
    {...headingProps}
  >
    {children}
  </Heading>
);

const SectionText = ({
  children,
  ...textProps
}: TextProps & { children: ReactNode }) => (
  <Text
    fontWeight={300}
    fontFamily="Inter"
    fontSize={{ base: "sm", md: "md" }}
    color="#e5e5e5"
    lineHeight="tall"
    {...textProps}
  >
    {children}
  </Text>
);

const SectionBullet = ({
  children,
  showDivider = true,
  accentColor = "#51FE53",
  ...flexProps
}: FlexProps & {
  children: ReactNode;
  showDivider?: boolean;
  accentColor?: string;
}) => (
  <Flex
    align="center"
    gap={4}
    py={3}
    px={{ base: 4, md: 5 }}
    borderBottomWidth={showDivider ? "1px" : "0"}
    borderColor={colorTokens.gray[500]}
    {...flexProps}
  >
    <Box w="6px" h="6px" borderRadius="full" bg={accentColor} flexShrink={0} />
    <SectionText flex="1" m={0}>
      {children}
    </SectionText>
  </Flex>
);

const DetailBullet = ({
  children,
  color = colorTokens.gray.tertiary,
}: {
  children: ReactNode;
  color?: string;
}) => (
  <Flex align="flex-start" gap={3}>
    <Box
      mt="10px"
      w="6px"
      h="6px"
      borderRadius="full"
      bg="#51FE53"
      flexShrink={0}
    />
    <SectionText color={color} m={0}>
      {children}
    </SectionText>
  </Flex>
);

const AccordionToggleIcon = () => {
  const { expanded } = useAccordionItemContext();
  return (
    <Icon
      as={expanded ? FiXCircle : FiPlusCircle}
      color={expanded ? "Red" : "#51FE53"}
      boxSize={5}
      flexShrink={0}
      transition="transform 0.5s ease"
    />
  );
};

type ExpandableListItem = {
  title: string;
  content: ReactNode;
};

const ExpandableList = ({ items }: { items: ExpandableListItem[] }) => (
  <Accordion.Root multiple collapsible overflow="hidden" mt={8}>
    {items.map((item, index) => (
      <Accordion.Item key={item.title} value={item.title} border="none">
        <Accordion.ItemTrigger
          px={{ base: 4, md: 5 }}
          py={4}
          display="flex"
          alignItems="center"
          gap={4}
          w="full"
          bg="transparent"
          borderTop="1px solid"
          borderColor={colorTokens.gray[500]}
          borderRadius={0}
          cursor="pointer"
        >
          <SectionText flex="1" m={0} textAlign="left">
            {item.title}
          </SectionText>
          <AccordionToggleIcon />
        </Accordion.ItemTrigger>
        <Accordion.ItemContent border="none">
          {typeof item.content === "string" ? (
            <SectionText
              px={{ base: 4, md: 5 }}
              pb={4}
              color={colorTokens.gray.tertiary}
            >
              {item.content}
            </SectionText>
          ) : (
            <Box
              px={{ base: 4, md: 5 }}
              pb={4}
              color={colorTokens.gray.tertiary}
            >
              {item.content}
            </Box>
          )}
        </Accordion.ItemContent>
      </Accordion.Item>
    ))}
  </Accordion.Root>
);

const SectionInfo = ({
  children,
  iconColor = "#575757",
  ...flexProps
}: FlexProps & { children: ReactNode; iconColor?: string }) => (
  <Flex
    px={{ base: 4, md: 5 }}
    py={{ base: 4, md: 5 }}
    borderRadius="xl"
    border="1px solid #575757"
    align="flex-start"
    gap={3}
    {...flexProps}
  >
    <Icon as={FiInfo} color={iconColor} boxSize={5} mt={1} />
    <SectionText color="whiteAlpha.700" m={0} lineHeight={1.5}>
      {children}
    </SectionText>
  </Flex>
);

const AboutPage: NextPage = () => {
  return (
    <Box
      color="white"
      px={{ base: 4, md: 8 }}
      py={{ base: 6, md: 10 }}
      overflowY="auto"
      height="100%"
    >
      <VStack gap={10} align="stretch" maxW="850px" mx="auto">
        <SectionCard>
          <SectionHeading>Connect Your Wallet</SectionHeading>
          <SectionText mt={3} color={colorTokens.gray.tertiary}>
            To get started, connect your Aptos wallet. We recommend using Petra
            Wallet - the official wallet for Aptos.
          </SectionText>

          <ExpandableList
            items={[
              {
                title: "If you already have a wallet:",
                content:
                  "Simply click Connect Wallet, choose Petra, approve the connection - and you're in!",
              },
              {
                title: "How to get Petra wallet",
                content: (
                  <VStack align="stretch" gap={3}>
                    <DetailBullet>
                      <Box as="span">Download Petra Wallet:</Box> Install it as
                      a browser extension (Chrome, Brave, Edge) or on mobile
                      (iOS/Android).
                    </DetailBullet>
                    <DetailBullet>
                      <Box as="span">Create Your Wallet:</Box> Click Create New
                      Wallet and securely save your 12-word recovery phrase.
                      (Already have one? Choose Import Wallet instead.)
                    </DetailBullet>
                    <DetailBullet>
                      <Box as="span">Add APT tokens:</Box> You'll eventually
                      need a small amount of APT for gas fees. You can buy APT
                      on supported exchanges.
                    </DetailBullet>
                    <DetailBullet>
                      <Box as="span">Connect to Aptos AI Layer:</Box> Open our
                      platform, click Connect Wallet, select Petra, and approve
                      the connection.
                    </DetailBullet>
                  </VStack>
                ),
              },
            ]}
          />

          <SectionInfo mt={6}>
            Your wallet is yours. We never access your funds - Petra only allows
            secure interaction with the Aptos AI Layer. This is your key to
            interacting with the platform, deploying agents, and tracking
            activity. Your wallet stays secure - you control your keys, and
            transactions are transparent on-chain.
          </SectionInfo>
        </SectionCard>

        <SectionCard>
          <SectionHeading>Create Your AI Agent</SectionHeading>
          <SectionText mt={3} color={colorTokens.gray.tertiary}>
            Build your agent directly in our chat -{" "}
            <Text as="span" color={colorTokens.green.erin}>
              no coding
            </Text>{" "}
            required.
          </SectionText>

          <Box
            mt={6}
            borderTop="1px solid"
            borderTopColor={colorTokens.gray[500]}
            overflow="hidden"
          >
            <SectionBullet showDivider>
              Give your agent a token name and a token symbol.
            </SectionBullet>
            <SectionBullet showDivider>
              Write a short description and design a custom personality that
              matches your vision.
            </SectionBullet>
            <SectionBullet showDivider={false}>
              Upload a profile photo so your agent has its own identity.
            </SectionBullet>
          </Box>

          <SectionInfo mt={6}>
            Once created, your agent is ready to interact, create content, and
            engage on Telegram or X.
          </SectionInfo>
        </SectionCard>

        <SectionCard>
          <SectionHeading>Deploy and Interact</SectionHeading>
          <SectionText mt={3} color={colorTokens.gray.tertiary}>
            Once deployed, your agent runs on Aptos with{" "}
            <Text as="span" color={colorTokens.green.erin}>
              low-cost
            </Text>
            , real-time execution.
          </SectionText>

          <Box
            mt={6}
            borderTop="1px solid"
            borderTopColor={colorTokens.gray[500]}
            overflow="hidden"
          >
            <SectionBullet showDivider>
              You pay only for verified actions your agent performs - making
              usage transparent and efficient.
            </SectionBullet>
            <SectionBullet showDivider={false}>
              Agents can be deployed instantly to your preferred social
              platforms or community spaces.
            </SectionBullet>
          </Box>

          {/* <SectionInfo mt={6}>
            Keep an eye on interactions and fine-tune your agent's behaviour to
            match your goals.
          </SectionInfo> */}
        </SectionCard>

        <SectionCard mb={4}>
          <SectionHeading>Grow and Scale</SectionHeading>
          <SectionText mt={3} color={colorTokens.gray.tertiary}>
            Use your agents to automate engagement, publish content, run
            campaigns, or experiment with new ideas.
          </SectionText>

          <Box
            mt={6}
            borderTop="1px solid"
            borderTopColor={colorTokens.gray[500]}
            overflow="hidden"
          >
            <SectionBullet showDivider>
              Track results through your dashboard and fine-tune your agents for
              better performance.
            </SectionBullet>
            <SectionBullet showDivider={false}>
              Explore advanced templates, analytics, and monetization options as
              you scale.
            </SectionBullet>
          </Box>

          {/* <SectionInfo mt={6}>
            Growing with data ensures your agents stay effective and aligned
            with your community's expectations.
          </SectionInfo> */}
        </SectionCard>
      </VStack>
    </Box>
  );
};

export default AboutPage;
