import { Box, BoxProps, Text } from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";
import {ReactNode} from "react";

interface Props extends BoxProps {
  title: string;
  value: ReactNode;
}
export const AgentMarketCard = ({ title, value, ...rest }: Props) => {
  return (
    <Box
      borderRadius={8}
      borderColor={colorTokens.green.dark}
      borderWidth={1}
      textAlign="center"
      px={3}
      py={{ base: 1, xl: 2 }}
      fontSize={{ base: 16, md: 14, lg: 15, xl: 16 }}
      {...rest}
    >
      <Text color={colorTokens.gray.platinum}>{title}</Text>
      <Text color={colorTokens.green.erin}>{value}</Text>
    </Box>
  );
};
