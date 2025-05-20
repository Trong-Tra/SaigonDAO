"use client";

import { useState } from "react";
import Image from "next/image";

export default function Header() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const handleConnectWallet = () => {
    // Temp, will be replaced with actual wallet connection logic
    setIsWalletConnected(true);
    setWalletAddress("0x1234...abcd");
  };

  const handleDisconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress("");
  };

  return (
    <header className="p-12 flex justify-end">
      <button
        onClick={
          isWalletConnected ? handleDisconnectWallet : handleConnectWallet
        }
        className={`py-4 px-14 rounded-full font-medium ${
          isWalletConnected
            ? "bg-amber-100 text-amber-800"
            : "bg-gradient-to-r from-amber-400 to-red-600 text-white"
        }`}
      >
        {isWalletConnected ? walletAddress : "Connect Wallet"}
      </button>
    </header>
  );
}
