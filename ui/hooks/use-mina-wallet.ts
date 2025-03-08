"use client"; // required if you are using Next.js App Router

import { useEffect, useState } from "react";

// Key used in localStorage
const LOCAL_STORAGE_KEY = "MINA";

export function useMinaWallet() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // On mount, fetch any stored wallet address from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setAddress(JSON.parse(stored));
        setConnected(true);
      }
    }
  }, []);

  // ---- connectWallet function ----
  async function connect() {
    // If the user doesn't have Auro Wallet
    if (!window.mina) {
      alert("Mina wallet extension not found. Please install Auro Wallet.");
      return;
    }
    try {
      setIsConnecting(true);
      const accounts = await window.mina.requestAccounts();
      const rawAddress = accounts[0];
      // Truncate address for user display
      const displayAddress = `${rawAddress.slice(0, 6)}...${rawAddress.slice(-4)}`;

      // Persist in localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(displayAddress));
      
      // Update React state
      setAddress(displayAddress);
      setConnected(true);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error; // Re-throw to allow component to handle error
    } finally {
      setIsConnecting(false);
    }
  }

  // ---- disconnect function ----
  function disconnect() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setAddress(null);
    setConnected(false);
  }

  return {
    connected,
    address,
    isConnecting,
    connect,
    disconnect,
  };
}