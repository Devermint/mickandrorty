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

export interface AgentCreationResult {
  agentHash: string;
  agentMeta: any;
  poolHash?: string;
  liquidityHash?: string;
  swapHash?: string;
  removeLiquidityHash?: string;
}

export interface SwapReserves {
  [key: string]: any;
}

export interface LiquidityBalance {
  lpBalance: bigint;
}

export const useAgentCreation = () => {
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

export const createAgent = async (
  agentData: AgentCreationData,
  swapSDK: AptosSwapSDK,
  wallet: any,
  userAddress: string
): Promise<AgentCreationResult> => {
  if (!wallet || !userAddress) {
    throw new Error("Wallet not connected");
  }

  // Constants
  let baseMeta: string =
    "0xcfdbb0b406add9f3a729d3011bcc1385f6450d864fb9b3f00e64ee6fd2fff23c";
  const quoteMeta: string =
    "0x000000000000000000000000000000000000000000000000000000000000000a";
  const amountIn = 10_000_000n;
  const baseDesired = 10_000_000n;
  const quoteDesired = 10_000_000n;

  const result: AgentCreationResult = {
    agentHash: "",
    agentMeta: null,
  };

  console.log("Wallet connected:", userAddress);

  try {
    const { payload } = await swapSDK.buildCreateAgentTx(
      agentData.tokenName,
      agentData.tokenTicker,
      agentData.tokenImage,
      userAddress
    );
    console.log(payload, wallet);
    const res = await swapSDK.submitWithWallet(wallet, payload);
    const agentMeta = await swapSDK.fetchCreatedAgentMeta(res.hash);

    result.agentHash = res.hash;
    result.agentMeta = agentMeta;

    if (agentMeta) {
      baseMeta = agentMeta;
    }

    console.log("create_agent tx:", res.hash, agentMeta);
    console.log({ res });
  } catch (e) {
    console.warn(
      "create_agent  failed (agent may already exist for this wallet):",
      e
    );
    throw e;
  }

  // try {
  //   const payload = swapSDK.buildRegisterPoolTx(
  //     baseMeta,
  //     quoteMeta,
  //     userAddress
  //   );
  //   console.log(payload, wallet);
  //   const res = await swapSDK.submitWithWallet(wallet, payload);
  //   result.poolHash = res.hash;
  //   console.log("create_pool tx:", res.hash);
  // } catch (e) {
  //   console.warn("create_pool skipped or failed (pool may already exist):", e);
  // }

  try {
    const { payload, computed } = await swapSDK.buildAddLiquidityTx(
      baseMeta,
      quoteMeta,
      baseDesired,
      quoteDesired,
      userAddress
    );
    console.log("add_liquidity computed:", computed);
    console.log({ payload, computed });
    const res = await swapSDK.submitWithWallet(wallet, payload);
    result.liquidityHash = res.hash;
    console.log("add_liquidity tx:", res.hash);
  } catch (e) {
    console.error("add_liquidity failed:", e);
  }

  try {
    const { reserves } = await swapSDK.getReserves(baseMeta, quoteMeta, {
      refresh: true,
    });
    console.log("reserves (after add):", reserves);
  } catch (e) {
    console.error("reserves fetch failed:", e);
  }

  // try {
  //   const { payload, computed } = await swapSDK.buildSwapTx(
  //     baseMeta,
  //     quoteMeta,
  //     amountIn,
  //     userAddress
  //   );
  //   console.log({ payload, computed });
  //   console.log("swap expectedOut/minOut:", computed);
  //   const res = await swapSDK.submitWithWallet(wallet, payload);
  //   result.swapHash = res.hash;
  //   console.log("swap tx:", res.hash);
  // } catch (e) {
  //   console.error("swap failed:", e);
  // }

  try {
    const { reserves } = await swapSDK.getReserves(baseMeta, quoteMeta, {
      refresh: true,
    });
    console.log("reserves (after swap):", reserves);
  } catch (e) {
    console.error("reserves fetch failed:", e);
  }

  // try {
  //   const lpBalance = await swapSDK.getWalletLPBalance(
  //     userAddress,
  //     baseMeta,
  //     quoteMeta
  //   );
  //   const { payload, computed } = await swapSDK.buildRemoveLiquidityTx(
  //     baseMeta,
  //     quoteMeta,
  //     lpBalance.lpBalance,
  //     userAddress
  //   );
  //   console.log(":", payload);
  //   console.log("remove_liquidity expected/min:", computed);
  //   const res = await swapSDK.submitWithWallet(wallet, payload);
  //   result.removeLiquidityHash = res.hash;
  //   console.log("remove_liquidity tx:", res.hash);
  // } catch (e) {
  //   console.error("remove_liquidity failed:", e);
  // }

  console.log("sequence complete");
  return result;
};
