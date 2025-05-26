"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAccount, useBalance } from "wagmi";
import { formatEther, parseEther } from "viem";
import toast from "react-hot-toast";
import { useContracts } from "@/hooks/useContracts";
import { contracts } from "@/config/contracts";

interface LendingManagerProps {
  tokenSymbol: "vBTC" | "VNST";
}

export default function LendingManager({ tokenSymbol }: LendingManagerProps) {
  const { address, isConnected } = useAccount();
  const [supplyAmount, setSupplyAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"supply" | "borrow">("supply");

  const tokenConfig = contracts.tokens[tokenSymbol];

  const { data: tokenBalance } = useBalance({
    address,
    token: tokenConfig.address as `0x${string}`,
  });

  const {
    supplyToCompound,
    borrowFromCompound,
    withdrawFromCompound,
    repayCompound,
    getSuppliedBalance,
    getBorrowedBalance,
    isSupplyPending,
    isBorrowPending,
    isWithdrawPending,
    isRepayPending,
  } = useContracts();

  const { data: suppliedBalance } = getSuppliedBalance(
    tokenConfig.address as `0x${string}`
  );
  const { data: borrowedBalance } = getBorrowedBalance(
    tokenConfig.address as `0x${string}`
  );

  const handleSupply = async () => {
    if (!supplyAmount || !isConnected) {
      toast.error("Please connect wallet and enter amount");
      return;
    }

    try {
      const amount = parseEther(supplyAmount);
      await supplyToCompound(tokenConfig.address as `0x${string}`, amount);
      toast.success(`Successfully supplied ${supplyAmount} ${tokenSymbol}`);
      setSupplyAmount("");
    } catch (error) {
      console.error("Supply error:", error);
      toast.error("Supply failed");
    }
  };

  const handleBorrow = async () => {
    if (!borrowAmount || !isConnected) {
      toast.error("Please connect wallet and enter amount");
      return;
    }

    try {
      const amount = parseEther(borrowAmount);
      await borrowFromCompound(tokenConfig.address as `0x${string}`, amount);
      toast.success(`Successfully borrowed ${borrowAmount} ${tokenSymbol}`);
      setBorrowAmount("");
    } catch (error) {
      console.error("Borrow error:", error);
      toast.error("Borrow failed");
    }
  };

  const handleWithdraw = async () => {
    if (!supplyAmount || !isConnected) {
      toast.error("Please connect wallet and enter amount");
      return;
    }

    try {
      const amount = parseEther(supplyAmount);
      await withdrawFromCompound(tokenConfig.address as `0x${string}`, amount);
      toast.success(`Successfully withdrew ${supplyAmount} ${tokenSymbol}`);
      setSupplyAmount("");
    } catch (error) {
      console.error("Withdraw error:", error);
      toast.error("Withdraw failed");
    }
  };

  const handleRepay = async () => {
    if (!borrowAmount || !isConnected) {
      toast.error("Please connect wallet and enter amount");
      return;
    }

    try {
      const amount = parseEther(borrowAmount);
      await repayCompound(tokenConfig.address as `0x${string}`, amount);
      toast.success(`Successfully repaid ${borrowAmount} ${tokenSymbol}`);
      setBorrowAmount("");
    } catch (error) {
      console.error("Repay error:", error);
      toast.error("Repay failed");
    }
  };

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return "0.000";
    return parseFloat(formatEther(balance)).toFixed(6);
  };

  // Mock APY data (in production, fetch from contracts)
  const mockData = {
    supplyAPY: tokenSymbol === "vBTC" ? "2.45%" : "3.21%",
    borrowAPY: tokenSymbol === "vBTC" ? "4.67%" : "5.89%",
    utilization: tokenSymbol === "vBTC" ? "67%" : "73%",
    totalSupplied: tokenSymbol === "vBTC" ? "156.789" : "2,345,678",
    totalBorrowed: tokenSymbol === "vBTC" ? "104.527" : "1,712,345",
  };

  if (!isConnected) {
    return (
      <div className="bg-white/30 backdrop-blur-sm border rounded-2xl shadow-lg p-8 text-center">
        <p className="text-gray-600 font-jakarta">
          Please connect your wallet to access lending features
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/30 backdrop-blur-sm border rounded-2xl shadow-lg p-6">
      {/* Token Header */}
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 relative mr-4">
          <Image
            src={tokenConfig.logo}
            alt={`${tokenSymbol} Logo`}
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
        <div>
          <h3 className="text-2xl font-bold font-orbitron">{tokenSymbol}</h3>
          <p className="text-gray-600 text-sm font-jakarta">
            Supply • Borrow • Earn
          </p>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/50 rounded-xl p-3 border border-black/20">
          <p className="text-gray-500 text-xs font-jakarta">Supply APY</p>
          <p className="text-lg font-bold font-orbitron text-green-600">
            {mockData.supplyAPY}
          </p>
        </div>
        <div className="bg-white/50 rounded-xl p-3 border border-black/20">
          <p className="text-gray-500 text-xs font-jakarta">Borrow APY</p>
          <p className="text-lg font-bold font-orbitron text-red-600">
            {mockData.borrowAPY}
          </p>
        </div>
        <div className="bg-white/50 rounded-xl p-3 border border-black/20">
          <p className="text-gray-500 text-xs font-jakarta">Total Supplied</p>
          <p className="text-lg font-bold font-orbitron">
            {mockData.totalSupplied}
          </p>
        </div>
        <div className="bg-white/50 rounded-xl p-3 border border-black/20">
          <p className="text-gray-500 text-xs font-jakarta">Utilization</p>
          <p className="text-lg font-bold font-orbitron">
            {mockData.utilization}
          </p>
        </div>
      </div>

      {/* User Balances */}
      <div className="bg-white/50 rounded-xl p-4 mb-6 border border-black/20">
        <h4 className="font-semibold font-orbitron mb-3">Your Positions</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500 font-jakarta">Wallet Balance</p>
            <p className="font-bold font-orbitron">
              {tokenBalance ? formatBalance(tokenBalance.value) : "0.000"}{" "}
              {tokenSymbol}
            </p>
          </div>
          <div>
            <p className="text-gray-500 font-jakarta">Supplied</p>
            <p className="font-bold font-orbitron text-green-600">
              {formatBalance(suppliedBalance)} {tokenSymbol}
            </p>
          </div>
          <div>
            <p className="text-gray-500 font-jakarta">Borrowed</p>
            <p className="font-bold font-orbitron text-red-600">
              {formatBalance(borrowedBalance)} {tokenSymbol}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex mb-4 bg-white/50 rounded-xl p-1 border border-black/20">
        <button
          onClick={() => setActiveTab("supply")}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === "supply"
              ? "bg-green-500 text-white shadow-md"
              : "text-gray-600 hover:bg-white/50"
          }`}
        >
          Supply
        </button>
        <button
          onClick={() => setActiveTab("borrow")}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === "borrow"
              ? "bg-red-500 text-white shadow-md"
              : "text-gray-600 hover:bg-white/50"
          }`}
        >
          Borrow
        </button>
      </div>

      {/* Supply Tab */}
      {activeTab === "supply" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-jakarta">
              Amount to Supply/Withdraw
            </label>
            <input
              type="number"
              value={supplyAmount}
              onChange={(e) => setSupplyAmount(e.target.value)}
              placeholder={`Enter ${tokenSymbol} amount`}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-orbitron"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSupply}
              disabled={isSupplyPending || !supplyAmount}
              className="flex-1 py-3 px-6 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-orbitron"
            >
              {isSupplyPending ? "Supplying..." : "Supply"}
            </button>
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawPending || !supplyAmount}
              className="flex-1 py-3 px-6 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-orbitron"
            >
              {isWithdrawPending ? "Withdrawing..." : "Withdraw"}
            </button>
          </div>
        </div>
      )}

      {/* Borrow Tab */}
      {activeTab === "borrow" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-jakarta">
              Amount to Borrow/Repay
            </label>
            <input
              type="number"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(e.target.value)}
              placeholder={`Enter ${tokenSymbol} amount`}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-orbitron"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBorrow}
              disabled={isBorrowPending || !borrowAmount}
              className="flex-1 py-3 px-6 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-orbitron"
            >
              {isBorrowPending ? "Borrowing..." : "Borrow"}
            </button>
            <button
              onClick={handleRepay}
              disabled={isRepayPending || !borrowAmount}
              className="flex-1 py-3 px-6 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-orbitron"
            >
              {isRepayPending ? "Repaying..." : "Repay"}
            </button>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700 font-jakarta">
          <span className="font-semibold">Note:</span> This is a testnet demo.
          Get test tokens from the{" "}
          <a href="/demo" className="underline hover:text-blue-900">
            mint page
          </a>{" "}
          before using lending features.
        </p>
      </div>
    </div>
  );
}
