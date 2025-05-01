"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

// Define the structure for account info from Petra
interface PetraAccountInfo {
  address: string;
  publicKey: string;
}

// Define a basic structure for network info (adjust as needed based on actual data)
interface PetraNetworkInfo {
  name?: string;
  chainId?: string;
  // Add other relevant network properties if known
}

// Define the structure for the Petra wallet object if needed
// We'll mainly interact with window.aptos directly
interface PetraWallet {
  connect: () => Promise<{ address: string; publicKey: string }>;
  account: () => Promise<PetraAccountInfo>;
  disconnect: () => Promise<void>;
  isConnected: () => Promise<boolean>;
  // Add event listeners if available and needed
  onAccountChange: (listener: (newAccount: PetraAccountInfo) => void) => void;
  onNetworkChange: (listener: (network: PetraNetworkInfo) => void) => void;
  signAndSubmitTransaction: (payload: unknown) => Promise<{
    hash: string;
  }>;
  // Add other methods if needed
}

interface AptosWalletContextType {
  account: PetraAccountInfo | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  wallet: PetraWallet | null; // Keep wallet instance if needed, or remove if always using window.aptos
}

const AptosWalletContext = createContext<AptosWalletContextType | undefined>(undefined);

// Helper to get the Petra wallet instance from window
const getPetraWallet = (): PetraWallet | null => {
  if ("aptos" in window) {
    // Use 'unknown' first, then assert type for better safety
    return (window as unknown as { aptos: PetraWallet }).aptos;
  }
  return null;
};

export function AptosWalletProvider({
  children,
  sessionDuration,
}: {
  children: ReactNode;
  sessionDuration: number;
}) {
  console.log("sessionDuration", sessionDuration);
  const [account, setAccount] = useState<PetraAccountInfo | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [wallet, setWallet] = useState<PetraWallet | null>(null);

  const updateConnectionStatus = useCallback(async () => {
    const petraWallet = getPetraWallet();
    if (!petraWallet) {
      setIsConnected(false);
      setAccount(null);
      setWallet(null);
      return;
    }
    setWallet(petraWallet); // Store the wallet instance

    try {
      // Check if already connected, Petra might have an isConnected method
      const connected = await petraWallet.isConnected();
      if (connected) {
        const accountInfo = await petraWallet.account();
        setAccount(accountInfo);
        setIsConnected(true);
      } else {
        setAccount(null);
        setIsConnected(false);
      }
    } catch (error) {
      console.warn("Could not check initial Petra connection:", error);
      // Assume not connected if there's an error checking
      setAccount(null);
      setIsConnected(false);
    }
  }, []);

  // Initialize connection status and set up listeners
  useEffect(() => {
    const petraWallet = getPetraWallet();
    if (petraWallet) {
      setWallet(petraWallet); // Ensure wallet state is set
      updateConnectionStatus(); // Check initial status

      // --- Event Listeners ---
      const handleAccountChange = (newAccount: PetraAccountInfo) => {
        console.log("Petra account changed:", newAccount);
        setAccount(newAccount);
        setIsConnected(!!newAccount?.address); // Update connected status based on account presence
      };

      const handleNetworkChange = (network: PetraNetworkInfo) => {
        console.log("Petra network changed:", network);
        // Optionally, update state or re-fetch data based on network
        // Force a refresh of account info in case network change requires it
        updateConnectionStatus();
      };

      // Add listeners if the methods exist
      if (typeof petraWallet.onAccountChange === "function") {
        petraWallet.onAccountChange(handleAccountChange);
      } else {
        console.warn("window.aptos.onAccountChange is not available.");
        // Fallback: might need to poll or rely on user action
      }

      if (typeof petraWallet.onNetworkChange === "function") {
        petraWallet.onNetworkChange(handleNetworkChange);
      } else {
        console.warn("window.aptos.onNetworkChange is not available.");
      }

      // Cleanup listeners on unmount
      // Note: Petra's API might not provide a way to *remove* listeners.
      // If it does, implement the cleanup here.
      // return () => {
      //   // petraWallet.removeListener?.('accountChanged', handleAccountChange); // Example cleanup
      //   // petraWallet.removeListener?.('networkChanged', handleNetworkChange); // Example cleanup
      // };
    } else {
      // Handle case where Petra is not installed initially
      setIsConnected(false);
      setAccount(null);
      setWallet(null);
    }
    // Run only once on mount, updateConnectionStatus handles updates
  }, [updateConnectionStatus]);

  const connect = useCallback(async () => {
    const petraWallet = getPetraWallet();
    if (!petraWallet) {
      // Prompt user to install Petra
      alert("Petra wallet not found. Please install the Petra extension.");
      window.open("https://petra.app/", "_blank");
      throw new Error("Petra wallet not found");
    }
    setWallet(petraWallet); // Store instance

    try {
      // The connect method might return account info directly
      await petraWallet.connect();
      // Fetch account info after successful connection
      const accountInfo = await petraWallet.account();
      setAccount(accountInfo);
      setIsConnected(true);
      console.log("Petra wallet connected:", accountInfo);
    } catch (error) {
      console.error("Failed to connect Petra wallet:", error);
      // Reset state on failure
      setAccount(null);
      setIsConnected(false);
      // Rethrow or handle error appropriately
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    const petraWallet = wallet; // Use stored wallet instance
    if (!petraWallet) {
      console.warn("Attempted to disconnect when Petra wallet instance is not available.");
      // Ensure state is cleared even if instance is lost
      setAccount(null);
      setIsConnected(false);
      return;
    }
    try {
      await petraWallet.disconnect();
      setAccount(null);
      setIsConnected(false);
      console.log("Petra wallet disconnected");
    } catch (error) {
      console.error("Failed to disconnect Petra wallet:", error);
      // Even on error, try to reset the state
      setAccount(null);
      setIsConnected(false);
      // Rethrow or handle error appropriately
      throw error;
    }
  }, [wallet]); // Depend on the stored wallet state

  // Memoize the context value
  const contextValue = useMemo(
    () => ({
      account,
      wallet,
      isConnected,
      connect,
      disconnect,
    }),
    [account, wallet, isConnected, connect, disconnect]
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
