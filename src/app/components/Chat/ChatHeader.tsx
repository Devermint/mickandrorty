import { Box, Flex, HStack, Icon, Tabs, Text } from "@chakra-ui/react";
import { IoChatbubble } from "react-icons/io5";
import { StarsIcon } from "../icons/stars";
import { colorTokens } from "../theme/theme";

interface ChatHeaderProps {
  chatName?: string;
  agentDisplayName: string;
  enableGroupChat?: boolean;
  isGroupConnected: boolean;
  activeTab: "chat" | "media";
  onTabChange: (tab: "chat" | "media") => void;
}

export const ChatHeader = ({
  chatName,
  agentDisplayName,
  enableGroupChat = true,
  isGroupConnected,
  activeTab,
  onTabChange,
}: ChatHeaderProps) => {
  const title = chatName || `${agentDisplayName || "Agent"} group chat`.trim();

  const handleTabChange = (value: string) => {
    if (value === "chat" || value === "media") {
      onTabChange(value);
    }
  };

  return (
    <Flex direction="column">
      <Flex
        bg={
          chatName
            ? colorTokens.blackCustom.a2
            : { base: colorTokens.blackCustom.a2, md: "unset" }
        }
        align="center"
        px={3}
        py={1}
        display={{ base: "none", md: "flex" }}
        justify="space-between"
      >
        <HStack>
          <Icon size="md" mb="2px">
            <StarsIcon color={colorTokens.green.erin} />
          </Icon>

          <Text px={{ base: 1, md: 2 }} py={{ base: 1, md: 2 }} fontSize="lg">
            {title}
          </Text>
        </HStack>

        {enableGroupChat && (
          <HStack
            gap={2}
            color={
              isGroupConnected
                ? colorTokens.green.erin
                : colorTokens.gray.timberwolf
            }
          >
            <IoChatbubble size="16" />
          </HStack>
        )}
      </Flex>

      <Tabs.Root
        value={activeTab}
        onValueChange={({ value }) => handleTabChange(value)}
        variant="plain"
        size="md"
        px={{ base: 2, md: 3 }}
        pt={0}
        pb={0}
      >
        <Tabs.List
          pb={1}
          gap={2}
          justifyContent={{ base: "center", md: "flex-start" }}
        >
          <TabTrigger value="chat" label="Chat" />
          <TabTrigger value="media" label="Media" />
        </Tabs.List>
      </Tabs.Root>
    </Flex>
  );
};

const TabTrigger = ({
  value,
  label,
}: {
  value: "chat" | "media";
  label: string;
}) => (
  <Tabs.Trigger
    value={value}
    px={0}
    py={0}
    h="100%"
    fontSize="sm"
    fontWeight="medium"
    letterSpacing="normal"
    color={colorTokens.gray.timberwolf}
    _hover={{
      color: colorTokens.green.erin,
    }}
    _selected={{
      color: colorTokens.green.erin,
    }}
    transition="all 0.2s ease"
  >
    <Box as="span">{label}</Box>
  </Tabs.Trigger>
);
