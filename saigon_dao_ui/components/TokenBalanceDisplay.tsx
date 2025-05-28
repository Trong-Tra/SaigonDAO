"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useBalance, useAccount } from "wagmi";
import { formatUnits } from "viem";
import { TOKENS } from "@/config/contracts";

interface TokenBalanceDisplayProps {
  address?: `0x${string}`;
  tokenAddress: `0x${string}`;
  tokenSymbol: string;
  decimals?: number;
  refreshInterval?: number;
  showRefreshButton?: boolean;
  className?: string;
}

export default function TokenBalanceDisplay({
  address,
  tokenAddress,
  tokenSymbol,
  decimals = 18,
  refreshInterval = 5000,
  showRefreshButton = false,
  className = "",
}: TokenBalanceDisplayProps) {
  const { address: connectedAddress } = useAccount();
  const [key, setKey] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Use the provided address or fall back to the connected wallet address
  const targetAddress = address || connectedAddress;

  // Force refresh on demand
  const refreshBalance = useCallback(() => {
    setKey((prev) => prev + 1);
    setLastRefreshed(new Date());
  }, []);

  // Force refresh the balance periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshBalance();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, refreshBalance]);
  
  // Listen for tokenBalancesChanged events
  useEffect(() => {
    const handleTokenBalancesChanged = (event: any) => {
      const changedTokens = event.detail?.tokens || [];
      if (changedTokens.includes(tokenAddress)) {
        console.log(`Token balance change detected for ${tokenSymbol}, refreshing...`);
        refreshBalance();
      }
    };

    window.addEventListener('tokenBalancesChanged', handleTokenBalancesChanged);
    
    return () => {
      window.removeEventListener('tokenBalancesChanged', handleTokenBalancesChanged);
    };
  }, [tokenAddress, tokenSymbol, refreshBalance]);

  // Use key to force re-fetch
  const {
    data: balance,
    isError,
    isLoading,
  } = useBalance({
    address: targetAddress,
    token: tokenAddress,
    query: {
      enabled: !!targetAddress,
      staleTime: 2000,
      gcTime: 1000,
    },
  });

  // Format the balance with appropriate decimal places based on token
  const formattedBalance = balance ? formatUnits(balance.value, decimals) : "0";

  // Adjust decimal places based on token type
  const displayDecimals =
    tokenSymbol === "vBTC" ? 8 : tokenSymbol === "VNST" ? 2 : 4;

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 bg-white/60 rounded-lg border border-gray-200 ${className}`}
    >
      <span className="text-gray-600">{tokenSymbol}:</span>
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold">
          {isLoading ? (
            <span className="animate-pulse">Loading...</span>
          ) : isError ? (
            <span className="text-red-500">Error</span>
          ) : (
            parseFloat(formattedBalance).toLocaleString(undefined, {
              maximumFractionDigits: displayDecimals,
            })
          )}
        </span>
        {showRefreshButton && (
          <button
            onClick={refreshBalance}
            className="text-xs text-amber-600 hover:text-amber-800"
            title={`Last refreshed: ${lastRefreshed.toLocaleTimeString()}`}
          >
            ↻
          </button>
        )}
      </div>
    </div>
  );
}
