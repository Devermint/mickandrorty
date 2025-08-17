"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useCallback } from "react";
import type { PetraWallet } from "petra-plugin-wallet-adapter"; // type-only, keeps your exposed shape
import {
  AptosWalletAdapterProvider,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import {HexInput, Network} from "@aptos-labs/ts-sdk";

interface PetraAccountInfo {
  address: HexInput;
  publicKey: HexInput;
}
interface AptosWalletContextType {
  account: PetraAccountInfo | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  wallet: PetraWallet | null; // stays nullable; we don't hand out Petra's client under the standard
}

const AptosWalletContext = createContext<AptosWalletContextType | undefined>(undefined);

/** Bridge adapter -> your context shape */
function WalletBridge({ children }: { children: ReactNode }) {
  const {
    account,
    connected,
    connect: adapterConnect,
    disconnect: adapterDisconnect,
    wallets,
    signAndSubmitTransaction: adapterSignAndSubmitTransaction,
  } = useWallet();

  const accountOut: PetraAccountInfo | null = account
      ? {
        address: account.address?.toString?.() ?? "",
        publicKey: account.publicKey?.toString?.() ?? "",
      }
      : null;

  const connect = useCallback(async () => {
    const target =
        wallets.find((w) => w.name.toLowerCase().includes("petra")) ?? wallets[0];
    if (!target) throw new Error("No wallets detected");
    await adapterConnect(target.name);
  }, [wallets, adapterConnect]);

  const disconnect = useCallback(async () => {
    await adapterDisconnect();
  }, [adapterDisconnect]);

  // ---- Shim: looks like Petra for your SDK, but only implements what you use
  const shimWallet = useMemo(
      () =>
          adapterSignAndSubmitTransaction
              ? ({
                signAndSubmitTransaction: (tx: any) =>
                    // Adapter expects InputTransactionData; if your payload matches, this just works.
                    adapterSignAndSubmitTransaction(tx as any),
              } as unknown as PetraWallet)
              : null,
      [adapterSignAndSubmitTransaction]
  );

  const value: AptosWalletContextType = useMemo(
      () => ({
        account: accountOut,
        isConnected: connected,
        connect,
        disconnect,
        wallet: shimWallet, // <- not null after connect
      }),
      [accountOut, connected, connect, disconnect, shimWallet]
  );

  return (
      <AptosWalletContext.Provider value={value}>
        {children}
      </AptosWalletContext.Provider>
  );
}


/** Public provider (signature unchanged) */
export function AptosWalletProvider({
                                      children,
                                      sessionDuration, // unused; kept for compatibility
                                    }: {
  children: ReactNode;
  sessionDuration: number;
}) {
  return (
      <AptosWalletAdapterProvider
          autoConnect
          dappConfig={{ network: Network.MAINNET }}
      >
        <WalletBridge>{children}</WalletBridge>
      </AptosWalletAdapterProvider>
  );
}

export function useAptosWallet() {
  const ctx = useContext(AptosWalletContext);
  if (!ctx) throw new Error("useAptosWallet must be used within an AptosWalletProvider");
  return ctx;
}
