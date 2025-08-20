import { useEffect, useMemo, useRef, useState } from "react";
import { useAptosWallet } from "../../context/AptosWalletContext";
import { AptosSwapSDK } from "@/app/hooks/AptosSwapSDK";
import { Aptos, AptosApiType, AptosConfig, HexInput } from "@aptos-labs/ts-sdk";
import { Network } from "aptos";

export function AptosSwapDemo() {
  const { wallet, account, isConnected } = useAptosWallet();

  // Fullnode URL that works with @aptos-labs/ts-sdk (include /v1)
  const nodeUrl =
    "https://ultra-withered-patina.aptos-mainnet.quiknode.pro/804be4e05ef290503e6020df7efd44fb2ad52b8c/v1";

  // Your deployed swap module account address
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
        defaultSlippageBps: 100, // 1%
      }),
    [nodeUrl, moduleAddress]
  );

  // Example FA metadata object addresses (X / Y)
  let xMeta: string =
    "0xcfdbb0b406add9f3a729d3011bcc1385f6450d864fb9b3f00e64ee6fd2fff23c";
  const yMeta: string =
    "0x000000000000000000000000000000000000000000000000000000000000000a";

  const name = "Name";
  const symbol = "Symbo"; // only one agent can be created for the same symbol + wallet combo. case-insensitive
  const iconUri =
    "https://mir-s3-cdn-cf.behance.net/project_modules/hd/690b4f103757219.5f54032af3b55.png";

  // Demo-sized amounts (raw u64 as bigint)
  const amountIn = 10_000_000n; // for swap
  const xDesired = 10_000_000n;
  const yDesired = 10_000_000n;

  // Ensure the sequence runs only once per connection
  const started = useRef(false);

  useEffect(() => {
    if (!wallet || !isConnected || !account?.address) return;
    if (started.current) return;
    started.current = true;
    //todo
    // !important! to get coin balance use
    // await sdk.getWalletBalance(user, xMeta);
    // await sdk.getWalletBalance(user, yMeta);

    (async () => {
      console.log("[DEMO] Wallet connected:", account.address);
      try {
        const { payload } = await swapSDK.buildCreateAgentTx(
          name,
          symbol,
          iconUri,
          account.address.toString()
        );
        console.log(payload, wallet);
        const res = await swapSDK.submitWithWallet(wallet, payload);
        const agentMeta = await swapSDK.fetchCreatedAgentMeta(res.hash);
        if (agentMeta) {
          // replacing constant meta address with recently created one
          xMeta = agentMeta;
        }

        console.log("[DEMO] create_agent tx:", res.hash, agentMeta);
        console.log({ res });
      } catch (e) {
        console.warn(
          "[DEMO] create_agent  failed (agent may already exist for this wallet):",
          e
        );
      }

      // 1) CREATE POOL
      try {
        const payload = swapSDK.buildRegisterPoolTx(
          xMeta,
          yMeta,
          account.address.toString()
        );
        console.log(payload, wallet);
        const res = await swapSDK.submitWithWallet(wallet, payload);
        console.log("[DEMO] create_pool tx:", res.hash);
      } catch (e) {
        console.warn(
          "[DEMO] create_pool skipped or failed (pool may already exist):",
          e
        );
      }

      // 2) ADD LIQUIDITY
      try {
        const { payload, computed } = await swapSDK.buildAddLiquidityTx(
          xMeta,
          yMeta,
          xDesired,
          yDesired,
          account.address.toString()
        );
        console.log("[DEMO] add_liquidity computed:", computed);
        console.log({ payload, computed });
        const res = await swapSDK.submitWithWallet(wallet, payload);
        console.log("[DEMO] add_liquidity tx:", res.hash);
      } catch (e) {
        console.error("[DEMO] add_liquidity failed:", e);
      }

      // 3) RESERVES (after add)
      try {
        const { reserves } = await swapSDK.getReserves(xMeta, yMeta, {
          refresh: true,
        });
        console.log("[DEMO] reserves (after add):", reserves);
      } catch (e) {
        console.error("[DEMO] reserves fetch failed:", e);
      }

      // 4) SWAP
      try {
        const { payload, computed } = await swapSDK.buildSwapTx(
          xMeta,
          yMeta,
          amountIn,
          account.address.toString()
        );
        console.log({ payload, computed });
        console.log("[DEMO] swap expectedOut/minOut:", computed);
        const res = await swapSDK.submitWithWallet(wallet, payload);
        console.log("[DEMO] swap tx:", res.hash);
      } catch (e) {
        console.error("[DEMO] swap failed:", e);
      }

      // 5) RESERVES (after swap)
      try {
        const { reserves } = await swapSDK.getReserves(xMeta, yMeta, {
          refresh: true,
        });
        console.log("[DEMO] reserves (after swap):", reserves);
      } catch (e) {
        console.error("[DEMO] reserves fetch failed:", e);
      }

      // 6) REMOVE LIQUIDITY
      try {
        const lpBalance = await swapSDK.getWalletLPBalance(
          account.address.toString(),
          xMeta,
          yMeta
        );
        const { payload, computed } = await swapSDK.buildRemoveLiquidityTx(
          xMeta,
          yMeta,
          lpBalance.lpBalance,
          account.address.toString()
        );
        console.log("[DEMO]:", payload);
        console.log("[DEMO] remove_liquidity expected/min:", computed);
        const res = await swapSDK.submitWithWallet(wallet, payload);
        console.log("[DEMO] remove_liquidity tx:", res.hash);
      } catch (e) {
        console.error("[DEMO] remove_liquidity failed:", e);
      }

      console.log("[DEMO] sequence complete");
    })().catch((err) => {
      console.error("[DEMO] sequence error:", err);
    });
  }, [wallet, isConnected, account?.address, swapSDK, xMeta, yMeta]);

  return null;
}
