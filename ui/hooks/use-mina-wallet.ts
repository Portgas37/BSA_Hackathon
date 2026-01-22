"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "MINA_WALLET";
const STORAGE_KEY_RAW = "MINA_WALLET_RAW";

export function useMinaWallet() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [rawAddress, setRawAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(STORAGE_KEY);
    const storedRaw = localStorage.getItem(STORAGE_KEY_RAW);

    if (stored) {
      setAddress(JSON.parse(stored));
      setConnected(true);
    }
    if (storedRaw) {
      setRawAddress(JSON.parse(storedRaw));
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.mina) {
      alert("Mina wallet extension not found. Please install Auro Wallet.");
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.mina.requestAccounts();
      const raw = accounts[0];
      const display = `${raw.slice(0, 6)}...${raw.slice(-4)}`;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(display));
      localStorage.setItem(STORAGE_KEY_RAW, JSON.stringify(raw));

      setAddress(display);
      setRawAddress(raw);
      setConnected(true);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY_RAW);
    setAddress(null);
    setRawAddress(null);
    setConnected(false);
  }, []);

  return {
    connected,
    address,
    rawAddress,
    isConnecting,
    connect,
    disconnect,
  };
}
