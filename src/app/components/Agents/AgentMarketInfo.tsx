import { SimpleGrid, SimpleGridProps, Spinner, Text } from "@chakra-ui/react";
import { colorTokens } from "../theme/theme";
import { AgentMarketCard } from "./AgentMarketCard";
import { AptosSwapDemo } from "./AgentMarketInfoSwapDemo";
import { Agent } from "@/app/types/agent";
import { useMarketSummary } from "@/app/hooks/useMarketSummary";

interface Props extends SimpleGridProps {
  agent: Agent;
}

export const AgentMarketInfo = ({
  agent,
  ...rest
}: Props) => {
  const faId = agent?.fa_id?.trim();

  const { data, isLoading, isError } = useMarketSummary(faId ?? "");

  if (!faId) {
    return <Text color="orange.400">Token metadata is missing</Text>;
  }

  if (isLoading) {
    return <Spinner size="lg" color={colorTokens.green.dark} />;
  }

  if (isError || !data) {
    return <Text color="red.500">Failed to load market data</Text>;
  }

  const priceUsd = data.price_usd?.toFixed(4);
  const price = data.price_apt?.toFixed(4);
  const liquidity = data.liquidity_usd?.toLocaleString();
  const mktCap = data.market_cap_usd?.toLocaleString();

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
      <AgentMarketCard title="PRICE USD" value={`$${priceUsd}`} />
      <AgentMarketCard title="PRICE" value={`${price} APT`} />
      <AgentMarketCard title="LIQUIDITY" value={`$${liquidity}`} />
      <AgentMarketCard title="MKT CAP" value={`$${mktCap}`} />
      <AptosSwapDemo />
    </SimpleGrid>
  );
};
