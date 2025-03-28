"use client";

import { AccountInfo, useWallet, AdapterWallet } from "@aptos-labs/wallet-adapter-react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

interface AptosWalletContextType {
  account: AccountInfo | { address: string; publicKey: string } | null;
  isConnected: boolean;
  connect: (walletName: string) => void;
  disconnect: () => void;
  refreshSession: () => void;
  sessionExpiresAt: number | null;
  wallet: AdapterWallet | null;
}

const AptosWalletContext = createContext<AptosWalletContextType | undefined>(undefined);

const getConnectedAccount = () => {
  try {
    const connectedAccount = localStorage.getItem("@aptos-connect/connectedAccount");
    return connectedAccount ? JSON.parse(connectedAccount) : null;
  } catch (error) {
    console.error("Error parsing connected account:", error);
    return null;
  }
};

export function AptosWalletProvider({
  children,
  sessionDuration = 24 * 60 * 60 * 1000, // Default 24 hours in milliseconds
}: {
  children: ReactNode;
  sessionDuration?: number;
}) {
  const {
    account,
    connected,
    connect: walletConnect,
    disconnect: walletDisconnect,
    wallet,
  } = useWallet();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [accountFromStorage, setAccountFromStorage] = useState<{
    address: string;
    publicKey: string;
  } | null>(null);
  // Memoize the checkConnection function
  const checkConnection = useCallback(() => {
    const connectedAccount = getConnectedAccount();
    const isConnectedNow = !!connectedAccount;
    setAccountFromStorage(connectedAccount);
    setIsConnected((prev) => {
      if (prev !== isConnectedNow) {
        // Only update sessionExpiresAt if connection state changes
        if (isConnectedNow) {
          const currentTime = Date.now();
          setSessionExpiresAt(currentTime + sessionDuration);
        } else {
          setSessionExpiresAt(null);
        }
        return isConnectedNow;
      }
      return prev;
    });
  }, [sessionDuration]);

  // Initialize and update connection state
  useEffect(() => {
    checkConnection();

    // Check less frequently (every 5 seconds) to reduce updates
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  // Auto-connect if needed
  useEffect(() => {
    const autoConnect = async () => {
      const connectedAccount = getConnectedAccount();
      if (connectedAccount && !connected && wallet?.name) {
        try {
          await walletConnect(wallet.name);
        } catch (error) {
          console.error("Error auto-connecting wallet:", error);
        }
      }
    };

    autoConnect();
  }, [connected, wallet, walletConnect]);

  const connect = useCallback(
    async (walletName: string) => {
      try {
        await walletConnect(walletName);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        throw error;
      }
    },
    [walletConnect]
  );

  const disconnect = useCallback(async () => {
    try {
      // First clear all states
      setIsConnected(false);
      setAccountFromStorage(null);
      setSessionExpiresAt(null);

      // Clear all Aptos-related storage items
      localStorage.removeItem("@aptos-connect/connectedAccount");
      localStorage.removeItem("@aptos-connect/dapp-local-state");
      localStorage.removeItem("WK__LAST_CONNECT_WALLET_NAME");

      // Then disconnect the wallet
      await walletDisconnect();

      // Force an immediate connection check
      checkConnection();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      throw error;
    }
  }, [walletDisconnect, checkConnection]);

  const refreshSession = useCallback(() => {
    const connectedAccount = getConnectedAccount();
    if (connectedAccount && wallet?.name) {
      connect(wallet.name);
    }
  }, [connect, wallet?.name]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      account: account ? account : accountFromStorage,
      wallet,
      isConnected,
      connect,
      disconnect,
      refreshSession,
      sessionExpiresAt,
    }),
    [
      account,
      accountFromStorage,
      wallet,
      isConnected,
      connect,
      disconnect,
      refreshSession,
      sessionExpiresAt,
    ]
  );

  return <AptosWalletContext.Provider value={contextValue}>{children}</AptosWalletContext.Provider>;
}

export function useAptosWallet() {
  const context = useContext(AptosWalletContext);
  if (context === undefined) {
    throw new Error("useAptosWallet must be used within an AptosWalletProvider");
  }
  return context;
}
