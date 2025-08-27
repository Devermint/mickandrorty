import { useAptosWallet } from "../../context/AptosWalletContext";
import { AptosSwapSDK } from "@/app/hooks/AptosSwapSDK";
import { Aptos, AptosConfig, HexInput } from "@aptos-labs/ts-sdk";
import { Network } from "aptos";
import { useMemo } from "react";

export interface AgentCreationData {
  tokenName: string;
  tokenTicker: string;
  tokenDescription: string;
  tokenImage: string;
}

export interface TransactionResult {
  txHash: string;
  wallet: string;
}

export interface SwapReserves {
  [key: string]: any;
}

export interface LiquidityBalance {
  lpBalance: bigint;
}

export const useTransaction = () => {
  const { wallet, account, isConnected } = useAptosWallet();

  const nodeUrl =
    "https://ultra-withered-patina.aptos-mainnet.quiknode.pro/804be4e05ef290503e6020df7efd44fb2ad52b8c/v1";

  const moduleAddress: HexInput =
    "0xf63d44bb4564c8ccd96916b2800b4fab2917d61f79faa6bfd9d14c2c19d4bf2f";

  const config = new AptosConfig({
    network: Network.MAINNET,
    fullnode: nodeUrl,
  });
  const aptosSDK = new Aptos(config);
  const swapSDK = useMemo(
    () =>
      new AptosSwapSDK({
        nodeUrl,
        moduleAddress,
        aptosSDK,
        defaultSlippageBps: 100,
      }),
    [nodeUrl, moduleAddress]
  );

  return {
    wallet,
    account,
    isConnected,
    swapSDK,
  };
};

export const executeTransaction = async (
  swapSDK: AptosSwapSDK,
  wallet: any,
  userAddress: string
): Promise<string> => {
  if (!wallet || !userAddress) {
    throw new Error("Wallet not connected");
  }

  let baseMeta: string =
    "0xcfdbb0b406add9f3a729d3011bcc1385f6450d864fb9b3f00e64ee6fd2fff23c";
  const quoteMeta: string =
    "0x000000000000000000000000000000000000000000000000000000000000000a";

  const amountIn = 10_000_000n;
  const baseDesired = 10_000_000n;
  const quoteDesired = 10_000_000n;

  const result: TransactionResult = {
    txHash: "",
    wallet: "",
  };
  try {
    const { hash } = await swapSDK.submitWithWallet(wallet, {
      sender: 
      data: {
        function: "",
        typeArguments: undefined,
        functionArguments: [],
        abi: undefined,
      },
    });

    const res = await swapSDK.submitWithWallet(wallet, payload);
    const agentMeta = await swapSDK.fetchCreatedAgentMeta(res.hash);

    result.txHash = hash;
    result.wallet = wallet;

    console.log("create_agent tx:", res.hash, agentMeta);
    console.log({ res });
  } catch (e) {
    console.warn(
      "create_agent  failed (agent may already exist for this wallet):",
      e
    );
    throw e;
  }

  console.log("sequence complete");
  return hash;
};
