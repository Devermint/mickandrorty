import { Box, Flex, Tabs, Text } from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";

interface ChatHeaderProps {
  chatName?: string;
  agentDisplayName: string;
  enableGroupChat?: boolean;
  isGroupConnected: boolean;
  activeTab: "chat" | "media";
  onTabChange: (tab: "chat" | "media") => void;
  showTabs?: boolean;
}

export const ChatHeader = ({
  chatName,
  agentDisplayName,
  enableGroupChat = true,
  isGroupConnected,
  activeTab,
  onTabChange,
  showTabs = true,
}: ChatHeaderProps) => {
  const title = chatName || `${agentDisplayName || "Agent"} group chat`.trim();

  const handleTabChange = (nextValue: string) => {
    if (nextValue === "chat" || nextValue === "media") {
      onTabChange(nextValue);
    }
  };

  return (
    <Flex direction="column">
      {/* <Flex display={{ base: "none", md: "flex" }} px={4} py={3}>
        <Text fontSize="lg" fontWeight="semibold">
          {title}
        </Text>
      </Flex> */}

      {showTabs && (
        <Tabs.Root
          value={activeTab}
          onValueChange={({ value }) => handleTabChange(value)}
          size="md"
          // px={{ base: 4, md: 4 }}
          // pt={{ base: 4, md: 2 }}
          pb={0}
        >
          <Tabs.List
            gap={0}
            position="relative"
            overflow="hidden"
            bg={colorTokens.gray.tertiaryDark}
            borderTopRadius={16}
            borderTop="1px solid"
            borderColor={colorTokens.gray[300]}
            borderBottom="none"
            w="full"
          >
            <TabTrigger value="chat" label="Chat" isFirst />
            <TabTrigger value="media" label="Predictions" />
            <Tabs.Indicator
              position="absolute"
              bottom={0}
              height="4px"
              bg={colorTokens.green.salad}
              transition="all 1s ease"
            />
          </Tabs.List>
        </Tabs.Root>
      )}
    </Flex>
  );
};

const TabTrigger = ({
  value,
  label,
  isFirst = false,
}: {
  value: "chat" | "media";
  label: string;
  isFirst?: boolean;
}) => (
  <Tabs.Trigger
    w="50%"
    value={value}
    px={{ base: 8, md: 10 }}
    py={{ base: 3, md: 4 }}
    fontSize={14}
    fontWeight={400}
    fontFamily="inter"
    color="#575757"
    bg="transparent"
    _selected={{
      color: "white",
    }}
    _hover={{
      color: "white",
    }}
    transition="color 0.2s ease"
    borderRight={isFirst ? "1px solid" : "none"}
    borderRightColor={colorTokens.gray[300]}
  >
    <Flex w="full" justify="center">
      {label}
    </Flex>
  </Tabs.Trigger>
);
