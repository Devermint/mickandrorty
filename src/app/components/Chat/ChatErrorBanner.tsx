import { Flex, Text } from "@chakra-ui/react";

interface ChatErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export const ChatErrorBanner = ({
  message,
  onDismiss,
}: ChatErrorBannerProps) => {
  if (!message) return null;

  return (
    <Flex
      bg="red.900"
      px={3}
      py={1}
      align="center"
      justify="space-between"
      color="red.200"
    >
      <Text fontSize="sm">{message}</Text>
      <Text fontSize="sm" color="red.300" cursor="pointer" onClick={onDismiss}>
        ✕
      </Text>
    </Flex>
  );
};
