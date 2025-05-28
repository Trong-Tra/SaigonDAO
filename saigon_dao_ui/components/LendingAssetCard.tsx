"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { TOKENS, SGLP_ABI, LST_POOLS } from "@/config/contracts";
import { formatEther, parseEther, formatUnits } from "viem";
import toast from "react-hot-toast";
import { useContracts } from "@/hooks/useContracts";
import TokenBalanceDisplay from "./TokenBalanceDisplay";

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
  const [collateralToken, setCollateralToken] = useState<
    "VNST" | "vBTC" | "sgVNST" | "sgvBTC"
  >(asset.name === "VNST" ? "vBTC" : "VNST");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [maxBorrowable, setMaxBorrowable] = useState("0");

  const { address, isConnected } = useAccount();
  const { borrowFromCompound, isBorrowPending } = useContracts();

  // Get token config
  const tokenConfig = TOKENS[asset.name as keyof typeof TOKENS];

  // Get the corresponding SGLP pool for the asset
  const sglpPool = LST_POOLS[asset.name as keyof typeof LST_POOLS];

  // Fetch pool liquidity volume from SGLP contract
  const { data: poolLiquidityVolume } = useReadContract({
    address: sglpPool?.pool,
    abi: SGLP_ABI,
    functionName: "poolLiquidityVolume",
    query: { enabled: !!sglpPool },
  });

  // Fetch token balance
  const { data: tokenBalance } = useBalance({
    address,
    token: tokenConfig?.address,
  });

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return "0.000";
    return parseFloat(formatEther(balance)).toFixed(6);
  };

  useEffect(() => {
    // Calculate available borrowing amount from SGLP pool liquidity
    async function fetchMaxBorrowable() {
      try {
        console.log(`[${asset.name}] Fetching max borrowable...`);
        console.log(`[${asset.name}] SGLP Pool:`, sglpPool);
        console.log(
          `[${asset.name}] Pool Liquidity Volume:`,
          poolLiquidityVolume
        );

        if (poolLiquidityVolume && sglpPool) {
          // Calculate 70% of pool liquidity as available for borrowing
          const poolLiquidityBigInt = poolLiquidityVolume as bigint;
          const availableBorrowPercent =
            (poolLiquidityBigInt * BigInt(70)) / BigInt(100);

          // Format the amount according to token decimals
          const tokenDecimals = sglpPool.underlying.decimals;
          const availableBorrowFormatted = formatUnits(
            availableBorrowPercent,
            tokenDecimals
          );

          // Format to reasonable decimal places for display
          const displayAmount = parseFloat(availableBorrowFormatted).toFixed(
            asset.name === "vBTC" ? 3 : 0
          );

          console.log(
            `[${asset.name}] Pool Liquidity (raw):`,
            poolLiquidityBigInt.toString()
          );
          console.log(
            `[${asset.name}] Available Borrow (70%):`,
            availableBorrowPercent.toString()
          );
          console.log(
            `[${asset.name}] Formatted Amount:`,
            availableBorrowFormatted
          );
          console.log(`[${asset.name}] Display Amount:`, displayAmount);

          setMaxBorrowable(displayAmount);
        } else {
          // Enhanced fallback with mock realistic amounts for testing
          console.warn(
            `[${asset.name}] Pool liquidity data not available, using fallback`
          );
          console.log(
            `[${asset.name}] poolLiquidityVolume:`,
            poolLiquidityVolume
          );
          console.log(`[${asset.name}] sglpPool:`, sglpPool);

          // Use reasonable mock amounts for demonstration until contract is available
          const mockAmount = asset.name === "vBTC" ? "700.000" : "700000";
          setMaxBorrowable(mockAmount);
        }
      } catch (error) {
        console.error(
          `[${asset.name}] Error fetching max borrowable from SGLP pool:`,
          error
        );
        // Fallback to reasonable mock amounts on error
        const fallbackAmount = asset.name === "vBTC" ? "350.000" : "350000";
        setMaxBorrowable(fallbackAmount);
      }
    }
    fetchMaxBorrowable();
  }, [asset.name, poolLiquidityVolume, sglpPool]);

  const handleBorrow = async () => {
    if (!borrowAmount || !collateralAmount || !isConnected) {
      toast.error("Please fill all fields and connect your wallet");
      return;
    }

    try {
      const borrowAmountParsed = parseEther(borrowAmount);
      const collateralAmountParsed = parseEther(collateralAmount);

      await borrowFromCompound(
        TOKENS[collateralToken as keyof typeof TOKENS].address as `0x${string}`,
        collateralAmountParsed,
        tokenConfig.address as `0x${string}`,
        borrowAmountParsed,
        30 // Default duration for MVP
      );

      toast.success(`Successfully borrowed ${borrowAmount} ${asset.name}`);
      setBorrowAmount("");
      setCollateralAmount("");
      setShowModal(false);
    } catch (error) {
      console.error("Borrow error:", error);
      toast.error("Borrow failed");
    }
  };

  return (
    <>
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
            <p className="text-xl font-bold font-orbitron">
              {asset.totalSupply}
            </p>
          </div>
          <div className="bg-white/50 rounded-xl p-3 border border-black/20">
            <p className="text-gray-500 text-xs font-jakarta">Utilization</p>
            <p className="text-xl font-bold font-orbitron">
              {asset.utilization}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="py-3 px-8 rounded-full font-medium transition-all duration-300 ease-in-out bg-gradient-to-r from-amber-400 to-red-600 text-white shadow-md hover:shadow-lg hover:scale-105"
          >
            Borrow
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-90vw max-h-90vh overflow-y-auto">
            <h3 className="text-xl font-bold font-orbitron mb-4">
              Borrow {asset.name}
            </h3>

            {/* Current Balances */}
            <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-sm mb-2">
                Your Current Balances
              </h4>
              <div className="space-y-2">
                {/* Use improved TokenBalanceDisplay component */}
                <TokenBalanceDisplay
                  tokenAddress={TOKENS.vBTC.address}
                  tokenSymbol="vBTC"
                  decimals={TOKENS.vBTC.decimals}
                  refreshInterval={5000}
                  showRefreshButton={true}
                />
                <TokenBalanceDisplay
                  tokenAddress={TOKENS.VNST.address}
                  tokenSymbol="VNST"
                  decimals={TOKENS.VNST.decimals}
                  refreshInterval={5000}
                  showRefreshButton={true}
                />
              </div>
            </div>

            {/* Pool Information */}
            {(asset.name === "VNST" || asset.name === "vBTC") && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border">
                <h4 className="font-semibold text-sm mb-2">Pool Information</h4>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Pool Liquidity:</span>
                    <span className="font-medium">
                      {poolLiquidityVolume
                        ? formatUnits(
                            poolLiquidityVolume,
                            sglpPool?.underlying.decimals || 18
                          )
                        : "Loading..."}{" "}
                      {asset.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Available to Borrow (70%):
                    </span>
                    <span className="font-medium text-green-600">
                      {maxBorrowable} {asset.name}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collateral Token
              </label>
              <select
                value={collateralToken}
                onChange={(e) =>
                  setCollateralToken(
                    e.target.value as "VNST" | "vBTC" | "sgVNST" | "sgvBTC"
                  )
                }
                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 mb-4"
              >
                {asset.name === "VNST" ? (
                  <>
                    <option value="vBTC">vBTC</option>
                    <option value="sgvBTC">sgvBTC</option>
                  </>
                ) : (
                  <>
                    <option value="VNST">VNST</option>
                    <option value="sgVNST">sgVNST</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collateral Amount
              </label>
              <input
                type="text"
                placeholder="Enter collateral amount"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 mb-4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Borrow Amount
              </label>
              <input
                type="text"
                placeholder="Enter borrow amount"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 mb-4"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBorrow}
                disabled={isBorrowPending || !borrowAmount}
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
    </>
  );
}
