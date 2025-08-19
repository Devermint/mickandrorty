"use client";

import { SimpleGrid, SimpleGridProps, Box, Spinner } from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";
import { AgentMarketCard } from "./AgentMarketCard";
import { AptosSwapDemo } from "./AgentMarketInfoSwapDemo";
import { StrictMode } from "react";

interface Props extends SimpleGridProps {
  priceUsd: string;
  price: string;
  liquidity: string;
  mktCap: string;
  /** optional: show spinners near values while refreshing */
  loading?: boolean;
}

export const AgentMarketInfo = ({
                                  priceUsd,
                                  price,
                                  liquidity,
                                  mktCap,
                                  loading = false,
                                  ...rest
                                }: Props) => {
  const Tile = ({ title, value }: { title: string; value: string }) => (
      <Box position="relative">
        <AgentMarketCard title={title} value={value} />
        {loading && (
            <Spinner
                size="xs"
                position="absolute"
                top="6px"
                right="8px"
            />
        )}
      </Box>
  );

  return (
      <SimpleGrid
          borderRadius={8}
          borderColor={colorTokens.green.dark}
          width="100%"
          flex={1}
          columns={2}
          gap={3}
          {...rest}
      >
        <Tile title="PRICE USD" value={priceUsd} />
        <Tile title="PRICE" value={price} />
        <Tile title="LIQUIDITY" value={liquidity} />
        <Tile title="MKT CAP" value={mktCap} />

        {/*/!* Keep your demo mount untouched *!/*/}
        {/*<StrictMode>*/}
        {/*  <AptosSwapDemo />*/}
        {/*</StrictMode>*/}
      </SimpleGrid>
  );
};

export default AgentMarketInfo;
