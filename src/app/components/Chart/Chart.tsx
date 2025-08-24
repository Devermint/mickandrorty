import { Box } from "@chakra-ui/react";
import TradingViewWidget from "./trading-view-widget";

export const Chart = ({ agent }: any) => {
  return (
    <Box
      overflowX="hidden"
      minH="100%"
      minW="100%"
      bgSize="cover"
      bgPos="center"
      bgRepeat="no-repeat"
    >
      <TradingViewWidget token={agent} isMobile></TradingViewWidget>
    </Box>
  );
};
