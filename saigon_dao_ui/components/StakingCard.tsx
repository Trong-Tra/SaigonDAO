"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useContracts } from "../hooks/useContracts";
import { toast } from "react-hot-toast";

type StakingCardProps = {
  tokenType: "VNST" | "vBTC";
};

export default function StakingCard({ tokenType }: StakingCardProps) {
  const [stakeAmount, setStakeAmount] = useState("0.00");
  const [isStaking, setIsStaking] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isConnected, address } = useAccount();
  const { open } = useAppKit();

  // Contract hooks
  const contracts = useContracts();
  const token = contracts.tokens[tokenType];
  const lst = contracts.lst[tokenType];

  // Exchange rate calculation (from LST pool if available)
  const exchangeRate = "1.05"; // This would come from contract in real implementation
  const apy = tokenType === "vBTC" ? "8.2%" : "11.5%";

  const data = {
    balance: isStaking ? token.balance : lst.balances.staked, // Show underlying token balance when staking, LST balance when unstaking
    availableToStake: token.balance, // Use underlying token balance for staking
    stakingToken: `sg${tokenType}`,
    exchangeRate: `${lst.exchangeRate} ${tokenType}`,
    apy,
  };

  // Check if user needs to approve underlying tokens for staking
  // Use a small buffer to handle floating point precision issues
  const stakeAmountNum = parseFloat(stakeAmount || "0");
  const allowanceNum = parseFloat(lst.allowance || "0");

  // If allowance is very large (like max uint256), consider it sufficient
  const hasMaxApproval = allowanceNum > 1e30; // Extremely large number indicates max approval
  const needsApproval =
    isStaking &&
    stakeAmountNum > 0 &&
    !hasMaxApproval &&
    allowanceNum < stakeAmountNum;

  // Debug logging
  console.log(`${tokenType} LST balances:`, lst.balances);
  console.log(`${tokenType} LST token address:`, lst.lstTokenAddress);
  console.log(`${tokenType} Pool address:`, lst.pool?.pool);
  console.log(`${tokenType} Underlying token balance:`, data.availableToStake);
  console.log(`${tokenType} LST token balance (staked):`, lst.balances.staked);
  console.log(`${tokenType} allowance:`, lst.allowance);
  console.log(`${tokenType} stakeAmount:`, stakeAmount);
  console.log(`${tokenType} stakeAmountNum:`, stakeAmountNum);
  console.log(`${tokenType} allowanceNum:`, allowanceNum);
  console.log(`${tokenType} hasMaxApproval:`, hasMaxApproval);
  console.log(`${tokenType} needsApproval:`, needsApproval);

  // Handle max button click
  const handleMaxClick = () => {
    if (isStaking) {
      setStakeAmount(token.balance);
    } else {
      setStakeAmount("0.00");
    }
  };

  // Handle stake/unstake mode toggle
  const handleToggleMode = (mode: boolean) => {
    setIsStaking(mode);
    setStakeAmount("0.00");
  };

  // Format balance to 2 decimal places
  const formatBalance = (balance: string) => {
    const num = parseFloat(balance || "0");
    return num.toFixed(2);
  };

  // Handle wallet connection using AppKit (same as Header)
  const handleConnectWallet = () => {
    open();
  };

  // Handle approve underlying tokens
  const handleApproveUnderlyingTokens = async () => {
    if (!isConnected || !address) {
      // This should not happen since handleMainAction checks connection first
      return;
    }

    try {
      setIsProcessing(true);
      await lst.approveUnderlyingToken(stakeAmount || "1000000");
    } catch (error) {
      console.error("Approval error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle stake action
  const handleStake = async () => {
    if (!isConnected || !address) {
      // This should not happen since handleMainAction checks connection first
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(stakeAmount) > parseFloat(token.balance)) {
      toast.error("Insufficient underlying token balance");
      return;
    }

    try {
      setIsProcessing(true);
      await lst.stake(stakeAmount);
      setStakeAmount("0.00");
    } catch (error) {
      console.error("Stake error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle unstake action
  const handleUnstake = async () => {
    if (!isConnected || !address) {
      // This should not happen since handleMainAction checks connection first
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(stakeAmount) > parseFloat(data.balance)) {
      toast.error("Insufficient staked balance");
      return;
    }

    try {
      setIsProcessing(true);
      await lst.unstake(stakeAmount);
      setStakeAmount("0.00");
    } catch (error) {
      console.error("Unstake error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle main action button click (only for stake/unstake, not wallet connection)
  const handleMainAction = async () => {
    // This should only be called when wallet is connected
    if (!isConnected) {
      return; // Should not happen due to disabled state
    }

    if (isStaking) {
      if (needsApproval) {
        await handleApproveUnderlyingTokens();
      } else {
        await handleStake();
      }
    } else {
      await handleUnstake();
    }
  };

  // Determine button configuration for action button
  const getActionButtonConfig = () => {
    const baseDisabled =
      !isConnected || isProcessing || token.isPending || lst.isPending;

    if (isProcessing || token.isPending || lst.isPending) {
      return {
        text: "Processing...",
        disabled: true,
        className: "bg-gray-400 text-white cursor-not-allowed",
      };
    }

    if (isStaking) {
      if (needsApproval) {
        return {
          text: `Approve ${tokenType}`,
          disabled: baseDisabled,
          className: baseDisabled
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-gradient-to-r from-orange-400 to-red-400 text-white hover:from-orange-500 hover:to-red-500",
        };
      }
      return {
        text: `Stake ${tokenType}`,
        disabled: baseDisabled,
        className: baseDisabled
          ? "bg-gray-400 text-white cursor-not-allowed"
          : "bg-gradient-to-r from-teal-400 to-amber-300 text-white hover:from-teal-500 hover:to-amber-400",
      };
    } else {
      return {
        text: `Unstake sg${tokenType}`,
        disabled: baseDisabled,
        className: baseDisabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-gradient-to-r from-amber-200 to-pink-300 hover:from-amber-300 hover:to-pink-400",
      };
    }
  };

  const actionButtonConfig = getActionButtonConfig();

  return (
    <div className="p-6 rounded-xl bg-white/30 backdrop-blur-sm border border-white/50 shadow-lg font-orbitron">
      {/* Stake/Unstake Toggle */}
      <div className="flex justify-center mb-8 px-3">
        <div
          className={`p-1 rounded-full w-full max-w-md transition-all duration-300 ease-in-out ${
            isStaking
              ? "bg-gradient-to-r from-teal-200 to-amber-200"
              : "bg-gradient-to-r from-amber-200 to-pink-200"
          }`}
        >
          <div className="flex relative">
            <div
              className={`absolute top-0 bottom-0 rounded-full bg-white bg-opacity-80 shadow-sm transition-all duration-300 ease-in-out ${
                isStaking ? "left-0 w-1/2" : "left-1/2 w-1/2"
              }`}
            ></div>
            <button
              className={`flex-1 py-2 px-8 rounded-full text-center font-medium z-10 transition-colors duration-300 ease-in-out ${
                isStaking ? "text-black" : "text-gray-600"
              }`}
              onClick={() => handleToggleMode(true)}
            >
              Stake
            </button>
            <button
              className={`flex-1 py-2 px-8 rounded-full text-center font-medium z-10 transition-colors duration-300 ease-in-out ${
                !isStaking ? "text-black" : "text-gray-600"
              }`}
              onClick={() => handleToggleMode(false)}
            >
              Unstake
            </button>
          </div>
        </div>
      </div>

      {/* Balance Display */}
      <div className="flex items-center mb-4 mr-6">
        <div className="flex items-center">
          <div className="w-16 h-16 relative mr-4 flex items-center justify-center ml-6 transition-all duration-300 ease-in-out">
            <div
              className="absolute inset-0 flex items-center justify-center transform transition-all duration-300 ease-in-out"
              style={{
                transform: isStaking ? "rotateY(0deg)" : "rotateY(180deg)",
                opacity: isStaking ? 1 : 0,
              }}
            >
              <Image
                src={`/images/tokens/${tokenType.toLowerCase()}.png`}
                alt={tokenType}
                width={64}
                height={64}
                className="object-contain"
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              />
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center transform transition-all duration-300 ease-in-out"
              style={{
                transform: isStaking ? "rotateY(-180deg)" : "rotateY(0deg)",
                opacity: isStaking ? 0 : 1,
              }}
            >
              <Image
                src={`/images/tokens/sg${tokenType.toLowerCase()}.png`}
                alt={`sg${tokenType}`}
                width={64}
                height={64}
                className="object-contain"
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              />
            </div>
          </div>
          <div className="relative h-8">
            <span
              className="text-2xl font-bold absolute transition-all duration-300 ease-in-out"
              style={{
                transform: isStaking ? "translateY(0)" : "translateY(-20px)",
                opacity: isStaking ? 1 : 0,
              }}
            >
              {tokenType}
            </span>
            <span
              className="text-2xl font-bold absolute transition-all duration-300 ease-in-out"
              style={{
                transform: isStaking ? "translateY(20px)" : "translateY(0)",
                opacity: isStaking ? 0 : 1,
              }}
            >
              sg{tokenType}
            </span>
          </div>
        </div>

        <div className="ml-auto flex items-center">
          <span className="text-lg transition-all duration-300 ease-in-out">
            Balance:{" "}
            {formatBalance(isStaking ? token.balance : lst.balances.staked)}
          </span>
        </div>
      </div>

      {/* Input Field */}
      <div className="relative mb-6 ml-9">
        <input
          type="number"
          value={stakeAmount}
          onChange={(e) => {
            const value = e.target.value;
            // Only allow numbers and decimal point
            if (value === "" || /^\d*\.?\d*$/.test(value)) {
              setStakeAmount(value);
            }
          }}
          onKeyDown={(e) => {
            // Allow: backspace, delete, tab, escape, enter, decimal point
            if (
              [46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
              // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
              (e.keyCode === 65 && e.ctrlKey === true) ||
              (e.keyCode === 67 && e.ctrlKey === true) ||
              (e.keyCode === 86 && e.ctrlKey === true) ||
              (e.keyCode === 88 && e.ctrlKey === true) ||
              // Allow: home, end, left, right
              (e.keyCode >= 35 && e.keyCode <= 39)
            ) {
              return;
            }
            // Ensure that it is a number and stop the keypress
            if (
              (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
              (e.keyCode < 96 || e.keyCode > 105)
            ) {
              e.preventDefault();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const paste = e.clipboardData.getData("text");
            // Only allow pasted content that matches number pattern
            if (/^\d*\.?\d*$/.test(paste)) {
              setStakeAmount(paste);
            }
          }}
          step="0.01"
          min="0"
          className="w-full text-5xl font-bold text-black py-2 bg-transparent border-none focus:outline-none focus:ring-0 font-orbitron [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="0.00"
        />
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 text-teal-500 text-3xl mr-6"
          onClick={handleMaxClick}
        >
          Max
        </button>
      </div>

      {/* Info Box */}
      <div
        className={`backdrop-blur-sm rounded-lg p-4 mb-6 border border-black/30 mx-8 transition-all duration-300 ease-in-out ${
          isStaking
            ? "bg-white/50"
            : "bg-gradient-to-r from-amber-50/50 to-pink-50/50"
        }`}
      >
        <div className="flex justify-between mb-2">
          <span className="text-gray-700">Exchange Rate</span>
          <span className="font-medium">
            1 sg{tokenType} = {data.exchangeRate}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">APY</span>
          <span className="font-medium">{data.apy}</span>
        </div>
      </div>

      {/* Button Stack - Same Position with Conditional Visibility */}
      <div className="relative">
        {/* Connect Wallet Button - Show when NOT connected */}
        {!isConnected && (
          <button
            onClick={handleConnectWallet}
            className="w-4/5 mx-auto py-3 px-4 rounded-full font-medium font-orbitron block transition-all duration-300 ease-in-out bg-gradient-to-r from-blue-400 to-purple-400 text-white hover:from-blue-500 hover:to-purple-500"
          >
            Connect Wallet
          </button>
        )}

        {/* Action Button (Stake/Unstake) - Show when connected */}
        {isConnected && (
          <button
            onClick={handleMainAction}
            disabled={actionButtonConfig.disabled}
            className={`w-4/5 mx-auto py-3 px-4 rounded-full font-medium font-orbitron block transition-all duration-300 ease-in-out ${actionButtonConfig.className}`}
          >
            {actionButtonConfig.text}
          </button>
        )}
      </div>

      {/* Additional Info for Users */}
      {isConnected && (
        <div className="mt-4 text-center text-sm text-gray-600">
          {needsApproval && (
            <p className="text-orange-600 mt-1">
              Approval required before staking
            </p>
          )}
        </div>
      )}
    </div>
  );
}
