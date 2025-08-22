import { useQuery } from "@tanstack/react-query";

const fetchAptosUsdPrice = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apt-price`);

  if (!res.ok) throw new Error("Failed to fetch Aptos price");

  const data = await res.json();

  return data?.price ?? null;
};

export const useAptosUsdPrice = () => {
  const {
    data: aptosUsd,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["aptos-usd-price"],
    queryFn: fetchAptosUsdPrice,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    price: aptosUsd ?? 0,
    isLoading,
    isError: !!error,
  };
};
