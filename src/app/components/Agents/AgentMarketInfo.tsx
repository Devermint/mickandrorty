import { SimpleGrid, SimpleGridProps } from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";
import { AgentMarketCard } from "./AgentMarketCard";

interface Props extends SimpleGridProps {
  priceUsd: string;
  price: string;
  liquidity: string;
  mktCap: string;
}
export const AgentMarketInfo = ({
  priceUsd,
  price,
  liquidity,
  mktCap,
  ...rest
}: Props) => {
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
      <AgentMarketCard title={"PRICE USD"} value={priceUsd} />
      <AgentMarketCard title={"PRICE"} value={price} />
      <AgentMarketCard title={"LIQUIDITY"} value={liquidity} />
      <AgentMarketCard title={"MKT CAP"} value={mktCap} />
    </SimpleGrid>
  );
};
