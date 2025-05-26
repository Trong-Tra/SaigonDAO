"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";

export default function Header() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const [selectedNetwork, setSelectedNetwork] = useState("BSC");
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);

  // Add effect to handle connection state changes
  useEffect(() => {
    if (!isConnected) {
    }
  }, [isConnected]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleWalletAction = () => {
    open();
  };

  const handleNetworkSelect = (network: string) => {
    setSelectedNetwork(network);
    setShowNetworkDropdown(false);
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

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
            className="flex items-center gap-2 py-3 px-4 rounded-full bg-slate-800 border-2 border-amber-500 hover:bg-slate-700 transition-colors"
          >
            <div className="w-6 h-6 relative">
              <Image
                src={`/images/networks/${selectedNetwork.toLowerCase()}.png`}
                alt={`${selectedNetwork} Network`}
                fill
                className="object-contain"
              />
            </div>
            <span className="text-white font-medium">{selectedNetwork}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 text-white transition-transform ${
                showNetworkDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showNetworkDropdown && (
            <div className="absolute top-full mt-4 w-full bg-slate-800 border-2 border-amber-500 rounded-lg overflow-hidden shadow-lg z-10">
              <ul>
                <li
                  className={`flex items-center gap-2 p-3 hover:bg-slate-700 cursor-pointer ${
                    selectedNetwork === "BSC"
                      ? "bg-slate-700 border-l-4 border-teal-200"
                      : ""
                  }`}
                  onClick={() => handleNetworkSelect("BSC")}
                >
                  <div className="w-5 h-5 relative">
                    <Image
                      src="/images/networks/bsc.png"
                      alt="BSC Network"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-white">BSC</span>
                </li>
                <li
                  className={`flex items-center gap-2 p-3 hover:bg-slate-700 cursor-pointer ${
                    selectedNetwork === "TON"
                      ? "bg-slate-700 border-l-4 border-teal-200"
                      : ""
                  }`}
                  onClick={() => handleNetworkSelect("TON")}
                >
                  <div className="w-5 h-5 relative">
                    <Image
                      src="/images/networks/ton.png"
                      alt="TON Network"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-white">TON</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={handleWalletAction}
          className={`py-4 px-14 rounded-full font-medium min-w-[240px] text-center ${
            isConnected
              ? "bg-gradient-to-r from-amber-400 to-red-600 text-white"
              : "bg-gradient-to-r from-red-600 to-amber-400 text-white"
          }`}
        >
          {isConnected && address ? (
            <span className="truncate block w-full">
              {formatAddress(address)}
            </span>
          ) : (
            "Connect Wallet"
          )}
        </button>
      </div>
    </header>
  );
}
