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
    <header className="p-12 ml-8 flex justify-between items-center">
      <div className="flex items-center">
        <div className="w-24 h-24 relative mr-4">
          <Image
            src="/images/logo.png"
            alt="SaigonDAO Logo"
            width={128}
            height={128}
            className="object-contain"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/64?text=DAO";
            }}
          />
        </div>
        <span className="text-3xl bg-gradient-to-r from-amber-500 to-red-600 text-transparent bg-clip-text font-jakarta">
          SaigonDAO
        </span>
      </div>

      <button
        onClick={
          isWalletConnected ? handleDisconnectWallet : handleConnectWallet
        }
        className={`py-4 px-14 rounded-full font-medium min-w-[240px] text-center ${
          isWalletConnected
            ? "bg-gradient-to-r from-amber-400 to-red-600 text-white"
            : "bg-gradient-to-r from-red-600 to-amber-400 text-white"
        }`}
      >
        {isWalletConnected ? (
          <span className="truncate block w-full">{walletAddress}</span>
        ) : (
          "Connect Wallet"
        )}
      </button>
    </header>
  );
}
