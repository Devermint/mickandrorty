// hooks/useAuthToken.ts
"use client";

import * as React from "react";
import {useAptosWallet} from "@/app/context/AptosWalletContext";
import {Signature} from "@aptos-labs/ts-sdk";

const JWT_KEY = "jwt";
const ADDR_KEY = "wallet_address";

export function useAuthToken() {
  const { account, wallet, signMessage } = useAptosWallet();
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  const [jwt, setJwt] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = localStorage.getItem(JWT_KEY);
    const a = localStorage.getItem(ADDR_KEY);
    setJwt(t);
    setAddress(a);
  }, []);

  function setSession(token: string, addr: string) {
    localStorage.setItem(JWT_KEY, token);
    localStorage.setItem(ADDR_KEY, addr);
    setJwt(token);
    setAddress(addr);
  }

  function clearSession() {
    localStorage.removeItem(JWT_KEY);
    localStorage.removeItem(ADDR_KEY);
    setJwt(null);
    setAddress(null);
  }
  function normalizeSignature(sig: string | string[] | Signature | undefined): string {
    if (!sig) throw new Error("No signature provided");

    // Already hex string
    if (typeof sig === "string") return sig;

    // If wallet (rarely) returns multiple strings
    if (Array.isArray(sig)) return sig[0];

    return sig.toString()
  }

  async function signIn() {
    setLoading(true);
    setError(null);
    try {
      const addr = account?.address.toString().toLowerCase();
      if (!addr) throw new Error("Connect wallet first");

      // 1) get nonce
      const nonceRes = await fetch(`${apiBase}/auth/nonce?address=${addr}`);
      const nonceBody = await nonceRes.json();
      if (!nonceRes.ok || !nonceBody?.nonce) throw new Error("Failed to get nonce");

      const nonce = nonceBody.nonce as string;

      // 2) sign message via wallet
      const message = {
        message: `Sign in to Aptos Agent Factory\nNonce: ${nonce}`,
        nonce,
      };
      const signed = await signMessage(message);

      const signature = normalizeSignature(signed?.signature);
      const public_key = account?.publicKey;



      if (!signature) throw new Error("Wallet did not return signature");
      if (!public_key) throw new Error("Wallet did not return public key");

      // 3) verify with backend → JWT
      const verRes = await fetch(`${apiBase}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: addr,
          public_key: public_key,
          message: signed.fullMessage,
          signature,
        }),
      });
      const verBody = await verRes.json();
      if (!verRes.ok || !verBody?.ok || !verBody?.token) {
        throw new Error(verBody?.description || verBody?.error || "Verify failed");
      }


      setSession(verBody.token, addr);
      return verBody.token as string;
    } catch (e: any) {
      setError(e?.message || "Auth failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  const authHeader = React.useCallback(() => {
    const t =
        (typeof window !== "undefined" ? localStorage.getItem(JWT_KEY) : null) || jwt;
    return { Auth: t ? `Bearer ${t}` : "" };
  }, [jwt]);

  return { jwt, address, loading, error, signIn, clearSession, authHeader };
}
