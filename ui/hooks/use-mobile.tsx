"use client";

import { useMinaWallet } from "@/hooks/use-mina-wallet";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function WalletButton() {
  const { connected, address, isConnecting, connectWallet, disconnect } = useMinaWallet();

  // If the user is connected, show their truncated address + disconnect
  if (connected) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium truncate w-32 bg-gray-100 dark:bg-gray-800 py-2 px-3 rounded-md">
          {address}
        </span>
        <Button
          variant="outline"
          onClick={disconnect}
          className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  // Otherwise, show the connect button
  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black font-medium px-6 py-2 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-gray-100"
    >
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        "Connect Wallet"
      )}
    </Button>
  );
}