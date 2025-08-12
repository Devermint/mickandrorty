import { Box, BoxProps, Text } from "@chakra-ui/react";
import { colorTokens } from "../../theme/theme";

interface Props extends BoxProps {
  title: string;
  value: string;
}
export const AgentMarketCard = ({ title, value, ...rest }: Props) => {
  return (
    <Box
      borderRadius={8}
      borderColor={colorTokens.green.dark}
      borderWidth={1}
      textAlign="center"
      p={3}
      {...rest}
    >
      <Text color={colorTokens.gray.platinum}>{title}</Text>
      <Text color={colorTokens.green.erin}>{value}</Text>
    </Box>
  );
};
