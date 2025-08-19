import { Box, BoxProps } from "@chakra-ui/react";

export const Chart = ({agent }: any) => {
  return (
    <Box
      overflowX="hidden"
      bgImage="url(/img/chart.png)"
      minH="100%"
      minW="100%"
      bgSize="cover"
      bgPos="center"
      bgRepeat="no-repeat"
     
    >
      <TradingViewWidget token={agent}></TradingViewWidget>
    </Box>
  );
};
