"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import type { PetraWallet } from "petra-plugin-wallet-adapter"; // type-only, keeps your exposed shape
import {
  AptosWalletAdapterProvider,
  // @ts-ignore
  SignMessagePayload,
  // @ts-ignore
  SignMessageResponse,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { HexInput, Network, Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import api from "@/lib/api";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { User } from "../types/user";

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
  jwt: string | null;
  user: User | null;
  refreshUser: () => Promise<void>;
  balance: string | null; // APT balance in octas (1 APT = 100,000,000 octas)
  balanceInApt: string | null; // APT balance in human-readable format
  isLoadingBalance: boolean;
  refreshBalance: () => Promise<void>;
  login: () => Promise<void>;
  isWalletConnected: boolean;
  signMessage: (message: SignMessagePayload) => Promise<SignMessageResponse>;
}

const AptosWalletContext = createContext<AptosWalletContextType | undefined>(
  undefined
);

// Create Aptos client instance
const aptosConfig = new AptosConfig({ network: Network.MAINNET });
const aptos = new Aptos(aptosConfig);

const normalizeUser = (raw: any): User => {
  const referralSource = Array.isArray(raw?.referrals)
    ? raw.referrals
    : Array.isArray(raw?.friends)
    ? raw.friends
    : [];

  const referrals =
    referralSource.length > 0
      ? referralSource.map((ref: any) => ({
          wallet_address:
            ref?.wallet_address ?? ref?.address ?? ref?.walletAddress ?? "",
          score: ref?.score ?? ref?.points ?? 0,
        }))
      : [];

  const normalized: User = {
    ...(raw ?? {}),
    wallet_address:
      raw?.wallet_address ?? raw?.walletAddress ?? raw?.address ?? undefined,
    points: raw?.points ?? raw?.score ?? 0,
    referral_code: raw?.referral_code ?? raw?.referralCode ?? undefined,
    referral_count:
      raw?.referral_count ??
      raw?.referrals_count ??
      raw?.friends_count ??
      referrals.length,
    referrals,
  };

  return normalized;
};

/** Bridge adapter -> your context shape */
function WalletBridge({ children }: { children: ReactNode }) {
  const {
    account,
    connected,
    connect: adapterConnect,
    disconnect: adapterDisconnect,
    wallets,
    signAndSubmitTransaction: adapterSignAndSubmitTransaction,
    signMessage,
  } = useWallet();

  const isMobile = useIsMobile();
  const [jwt, setJwt] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("jwt");
    }
    return null;
  });
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const address = account?.address?.toString();
  const publicKey = account?.publicKey?.toString();

  // Convert octas to APT (1 APT = 100,000,000 octas)
  const balanceInApt = useMemo(() => {
    if (!balance) return null;
    const aptAmount = parseInt(balance) / 100_000_000;
    return aptAmount.toFixed(8).replace(/\.?0+$/, ""); // Remove trailing zeros
  }, [balance]);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance(null);
      return;
    }

    setIsLoadingBalance(true);
    try {
      const balance = await aptos.getAccountAPTAmount({
        accountAddress: address,
      });

      setBalance(balance.toString());
    } catch (error) {
      try {
        const formattedAddress = address.startsWith("0x")
          ? "0x" + address.slice(2).padStart(64, "0")
          : "0x" + address.padStart(64, "0");

        const resources = await aptos.getAccountResource({
          accountAddress: formattedAddress,
          resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
        });

        const coinBalance = (resources as any)?.coin?.value;
        setBalance(coinBalance || "0");
      } catch {
        setBalance("0");
      }
    } finally {
      setIsLoadingBalance(false);
    }
  }, [address]);

  const fetchUserProfile = useCallback(async () => {
    if (!jwt) {
      setUser(null);
      return;
    }
    try {
      const { data: userData } = await api.get("/users/me");
      setUser(normalizeUser(userData));
    } catch (error) {
      console.error("Error fetching user profile:", error);
      localStorage.removeItem("jwt");
      setJwt(null);
      setUser(null);
    }
  }, [jwt]);

  const login = useCallback(async () => {
    if (!address || !publicKey) return;
    try {
      const messageToSign = {
        message: "Sign this message to authenticate with Aptos Agent Factory.",
        nonce: `nonce-${Math.random().toString(16).substring(2)}`,
      };
      const signedMessage = await signMessage(messageToSign);
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get("referralCode");
      const { data } = await api.post("/auth/wallet-login", {
        walletAddress: address,
        publicKey: publicKey,
        signature: signedMessage.signature,
        fullMessage: signedMessage.fullMessage,
        referralCode: referralCode,
      });

      const { token, user: userData } = data;
      localStorage.setItem("jwt", token);
      setJwt(token);
      setUser(normalizeUser(userData));
    } catch (error) {
      console.error("Error signing message or logging in:", error);
    }
  }, [address, publicKey, signMessage]);

  useEffect(() => {
    if (!isMobile && !jwt && address && publicKey) {
      login();
    }
  }, [address, publicKey, jwt, isMobile, login]);

  // Fetch balance when address changes
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    if (jwt && !user) {
      fetchUserProfile();
    }
  }, [jwt, user, fetchUserProfile]);

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
    localStorage.removeItem("jwt");
    setJwt(null);
    setUser(null);
    setBalance(null);
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
      isConnected: connected && !!jwt,
      isWalletConnected: connected,
      connect,
      disconnect,
      wallet: shimWallet, // <- not null after connect
      jwt,
      user,
      refreshUser: fetchUserProfile,
      balance,
      balanceInApt,
      isLoadingBalance,
      refreshBalance: fetchBalance,
      login,
      signMessage,
    }),
    [
      accountOut,
      connected,
      connect,
      disconnect,
      shimWallet,
      jwt,
      user,
      fetchUserProfile,
      balance,
      balanceInApt,
      isLoadingBalance,
      fetchBalance,
      login,
      signMessage,
    ]
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
  if (!ctx)
    throw new Error(
      "useAptosWallet must be used within an AptosWalletProvider"
    );
  return ctx;
}
