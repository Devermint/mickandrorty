import { Flex, Text } from "@chakra-ui/react";
import { InfoIcon } from "@/app/components/icons/info";
import { colorTokens } from "@/app/components/theme/theme";

interface InfoBannerProps {
  message: string;
}

export function InfoBanner({ message }: InfoBannerProps) {
  return (
    <Flex
      align="center"
      gap={3}
      border="1px solid"
      borderColor={colorTokens.gray[400]}
      borderRadius={17}
      px={4}
      py={3}
      bg={colorTokens.gray.tertiaryDark}
    >
      <InfoIcon color="#D8B56E" width={5} height={5} />
      <Text
        color="white"
        fontSize={{ base: 13, md: 14 }}
        fontFamily="inter"
        fontWeight={300}
      >
        {message}
      </Text>
    </Flex>
  );
}
