"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useContracts } from "../hooks/useContracts";
import toast from "react-hot-toast";

export default function LiquidityManager() {
  const { isConnected, address } = useAccount();
  const contracts = useContracts();
  const [vBTCAmount, setVBTCAmount] = useState("");
  const [VNSTAmount, setVNSTAmount] = useState("");
  const [removeAmount, setRemoveAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if approvals are needed
  const needsVBTCApproval =
    parseFloat(contracts.tokens.vBTC.vaultAllowance) <
    parseFloat(vBTCAmount || "0");
  const needsVNSTApproval =
    parseFloat(contracts.tokens.VNST.vaultAllowance) <
    parseFloat(VNSTAmount || "0");

  // Handle token approvals
  const handleApproveVBTC = async () => {
    try {
      setIsProcessing(true);
      await contracts.tokens.vBTC.approve(
        contracts.vault.vault.address,
        vBTCAmount || "1000000"
      );
    } catch (error) {
      console.error("vBTC approval error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveVNST = async () => {
    try {
      setIsProcessing(true);
      await contracts.tokens.VNST.approve(
        contracts.vault.vault.address,
        VNSTAmount || "1000000"
      );
    } catch (error) {
      console.error("VNST approval error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle add liquidity
  const handleAddLiquidity = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (
      !vBTCAmount ||
      !VNSTAmount ||
      parseFloat(vBTCAmount) <= 0 ||
      parseFloat(VNSTAmount) <= 0
    ) {
      toast.error("Please enter valid amounts for both tokens");
      return;
    }

    if (parseFloat(vBTCAmount) > parseFloat(contracts.tokens.vBTC.balance)) {
      toast.error("Insufficient vBTC balance");
      return;
    }

    if (parseFloat(VNSTAmount) > parseFloat(contracts.tokens.VNST.balance)) {
      toast.error("Insufficient VNST balance");
      return;
    }

    try {
      setIsProcessing(true);
      await contracts.vault.addLiquidity(vBTCAmount, VNSTAmount);
      setVBTCAmount("");
      setVNSTAmount("");
      toast.success("Liquidity added successfully!");
    } catch (error) {
      console.error("Add liquidity error:", error);
      toast.error("Failed to add liquidity");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle remove liquidity
  const handleRemoveLiquidity = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!removeAmount || parseFloat(removeAmount) <= 0) {
      toast.error("Please enter a valid amount to remove");
      return;
    }

    if (parseFloat(removeAmount) > parseFloat(contracts.vault.userBalance)) {
      toast.error("Insufficient LP token balance");
      return;
    }

    try {
      setIsProcessing(true);
      await contracts.vault.removeLiquidity(removeAmount);
      setRemoveAmount("");
      toast.success("Liquidity removed successfully!");
    } catch (error) {
      console.error("Remove liquidity error:", error);
      toast.error("Failed to remove liquidity");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 text-center">
        <p className="text-white">
          Please connect your wallet to manage liquidity
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Liquidity Section */}
      <div className="p-6 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
        <h3 className="text-xl font-semibold text-white mb-4">Add Liquidity</h3>

        <div className="space-y-4">
          {/* vBTC Input */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-white text-sm">vBTC Amount</label>
              <span className="text-white/80 text-sm">
                Balance: {parseFloat(contracts.tokens.vBTC.balance).toFixed(4)}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={vBTCAmount}
                onChange={(e) => setVBTCAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50"
              />
              <button
                onClick={() => setVBTCAmount(contracts.tokens.vBTC.balance)}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Max
              </button>
            </div>
            {needsVBTCApproval && (
              <button
                onClick={handleApproveVBTC}
                disabled={isProcessing || contracts.tokens.vBTC.isPending}
                className="mt-2 w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-lg"
              >
                {isProcessing ? "Approving..." : "Approve vBTC"}
              </button>
            )}
          </div>

          {/* VNST Input */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-white text-sm">VNST Amount</label>
              <span className="text-white/80 text-sm">
                Balance: {parseFloat(contracts.tokens.VNST.balance).toFixed(2)}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={VNSTAmount}
                onChange={(e) => setVNSTAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50"
              />
              <button
                onClick={() => setVNSTAmount(contracts.tokens.VNST.balance)}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Max
              </button>
            </div>
            {needsVNSTApproval && (
              <button
                onClick={handleApproveVNST}
                disabled={isProcessing || contracts.tokens.VNST.isPending}
                className="mt-2 w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-lg"
              >
                {isProcessing ? "Approving..." : "Approve VNST"}
              </button>
            )}
          </div>

          {/* Add Liquidity Button */}
          <button
            onClick={handleAddLiquidity}
            disabled={
              isProcessing ||
              contracts.vault.isPending ||
              needsVBTCApproval ||
              needsVNSTApproval ||
              !vBTCAmount ||
              !VNSTAmount
            }
            className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg font-medium"
          >
            {isProcessing ? "Adding Liquidity..." : "Add Liquidity"}
          </button>
        </div>
      </div>

      {/* Remove Liquidity Section */}
      <div className="p-6 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
        <h3 className="text-xl font-semibold text-white mb-4">
          Remove Liquidity
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-white text-sm">LP Token Amount</label>
              <span className="text-white/80 text-sm">
                Balance: {parseFloat(contracts.vault.userBalance).toFixed(4)}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={removeAmount}
                onChange={(e) => setRemoveAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50"
              />
              <button
                onClick={() => setRemoveAmount(contracts.vault.userBalance)}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Max
              </button>
            </div>
          </div>

          <button
            onClick={handleRemoveLiquidity}
            disabled={
              isProcessing ||
              contracts.vault.isPending ||
              !removeAmount ||
              parseFloat(removeAmount) <= 0
            }
            className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg font-medium"
          >
            {isProcessing ? "Removing Liquidity..." : "Remove Liquidity"}
          </button>
        </div>
      </div>

      {/* Vault Info */}
      <div className="p-6 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
        <h3 className="text-xl font-semibold text-white mb-4">
          Vault Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/80">vBTC Reserve:</p>
            <p className="text-white font-medium">
              {parseFloat(contracts.vault.reserves.reserveA).toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-white/80">VNST Reserve:</p>
            <p className="text-white font-medium">
              {parseFloat(contracts.vault.reserves.reserveB).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-white/80">Your LP Tokens:</p>
            <p className="text-white font-medium">
              {parseFloat(contracts.vault.userBalance).toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-white/80">Total Supply:</p>
            <p className="text-white font-medium">
              {parseFloat(contracts.vault.totalSupply).toFixed(4)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
