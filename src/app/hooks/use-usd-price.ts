import { useQuery } from "@tanstack/react-query";

const APTOS_DEFI_LLAMA_ID = "coingecko:aptos"; // or "defillama:aptos" if LLAMA changes

const fetchAptosUsdPrice = async () => {
  const res = await fetch(
    `https://coins.llama.fi/prices/current/${APTOS_DEFI_LLAMA_ID}`
  );

  if (!res.ok) throw new Error("Failed to fetch Aptos price");

  const data = await res.json();

  return data["coins"]?.[APTOS_DEFI_LLAMA_ID]?.price ?? null;
};

export const useAptosUsdPrice = () => {
  const { data: aptosUsd, isLoading, error } = useQuery({
    queryKey: ["aptos-usd-price"],
    queryFn: fetchAptosUsdPrice,
    refetchInterval: 60 * 1000,
  });

  return {
    price: aptosUsd ?? 0,
    isLoading,
    isError: !!error,
  };
};
