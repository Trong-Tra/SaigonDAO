"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAccount, useBalance } from "wagmi";
import { TOKENS } from "@/config/contracts";
import { formatEther, parseEther } from "viem";
import toast from "react-hot-toast";
import { useContracts } from "@/hooks/useContracts";

interface LendingAssetProps {
  asset: {
    id: string;
    name: string;
    logo: string;
    interestRate: string;
    apy: string;
    totalSupply: string;
    utilization: string;
  };
}

export default function LendingAssetCard({ asset }: LendingAssetProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  
  const { address, isConnected } = useAccount();
  const {
    borrowFromCompound,
    isBorrowPending,
  } = useContracts();

  // Get token config
  const tokenConfig = TOKENS[asset.name as keyof typeof TOKENS];
  
  // Fetch token balance
  const { data: tokenBalance } = useBalance({
    address,
    token: tokenConfig?.address,
  });

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return "0.000";
    return parseFloat(formatEther(balance)).toFixed(6);
  };

  const handleBorrow = async () => {
    if (!amount || !isConnected || !tokenConfig) {
      toast.error("Please connect wallet and enter amount");
      return;
    }

    try {
      const amountParsed = parseEther(amount);
      await borrowFromCompound(tokenConfig.address as `0x${string}`, amountParsed);
      setAmount("");
      setShowModal(false);
    } catch (error) {
      console.error("Borrow error:", error);
    }
  };

  const openBorrowModal = () => {
    // Only functional for VNST and vBTC
    if (asset.name !== "VNST" && asset.name !== "vBTC") {
      toast.error(`${asset.name} lending coming soon! Use VNST or vBTC for now.`);
      return;
    }
    
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    setShowModal(true);
  };

  return (
    <div
      className="bg-white/30 backdrop-blur-sm border rounded-2xl shadow-lg p-6 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex items-start mb-4">
        <div className="w-14 h-14 relative mr-4">
          <Image
            src={asset.logo}
            alt={`${asset.name} Logo`}
            width={56}
            height={56}
            className="object-contain"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
            onError={(e) => {
              e.currentTarget.src = `https://via.placeholder.com/56?text=${asset.name}`;
            }}
          />
        </div>
        <div>
          <h3 className="text-2xl font-bold font-orbitron">{asset.name}</h3>
          <p className="text-gray-600 text-sm font-jakarta">
            Available for borrowing against supplied assets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white/50 rounded-xl p-3 border border-black/20">
          <p className="text-gray-500 text-xs font-jakarta">
            Interest Rate per Block
          </p>
          <p className="text-xl font-bold font-orbitron bg-gradient-to-r from-amber-500 to-red-600 text-transparent bg-clip-text">
            {asset.interestRate}
          </p>
        </div>
        <div className="bg-white/50 rounded-xl p-3 border border-black/20">
          <p className="text-gray-500 text-xs font-jakarta">APY</p>
          <p className="text-xl font-bold font-orbitron bg-gradient-to-r from-amber-500 to-red-600 text-transparent bg-clip-text">
            {asset.apy}
          </p>
        </div>
        <div className="bg-white/50 rounded-xl p-3 border border-black/20">
          <p className="text-gray-500 text-xs font-jakarta">Total Supply</p>
          <p className="text-xl font-bold font-orbitron">{asset.totalSupply}</p>
        </div>
        <div className="bg-white/50 rounded-xl p-3 border border-black/20">
          <p className="text-gray-500 text-xs font-jakarta">Utilization</p>
          <p className="text-xl font-bold font-orbitron">{asset.utilization}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button 
          onClick={openBorrowModal}
          className="py-3 px-8 rounded-full font-medium transition-all duration-300 ease-in-out bg-gradient-to-r from-amber-400 to-red-600 text-white shadow-md hover:shadow-lg hover:scale-105"
        >
          Borrow
        </button>
      </div>

      {/* Modal for Borrow */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-90vw">
            <h3 className="text-xl font-bold font-orbitron mb-4">
              Borrow {asset.name}
            </h3>
            
            {isConnected && tokenBalance && (
              <p className="text-sm text-gray-600 mb-4 font-jakarta">
                Wallet Balance: {formatBalance(tokenBalance.value)} {asset.name}
              </p>
            )}

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter ${asset.name} amount to borrow`}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-orbitron mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={handleBorrow}
                disabled={isBorrowPending || !amount}
                className="flex-1 py-3 px-6 rounded-lg font-medium transition-all font-orbitron text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBorrowPending ? "Borrowing..." : "Borrow"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 px-6 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-all font-orbitron"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
