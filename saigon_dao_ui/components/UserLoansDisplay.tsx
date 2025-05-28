"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { formatUnits, formatEther } from "viem";
import { useContracts } from "@/hooks/useContracts";
import TokenBalanceDisplay from "./TokenBalanceDisplay";
import { TOKENS } from "@/config/contracts";
import toast from "react-hot-toast";

interface UserLoansDisplayProps {
  className?: string;
  onLoanUpdated?: () => void;
}

export default function UserLoansDisplay({
  className = "",
  onLoanUpdated,
}: UserLoansDisplayProps) {
  const { address } = useAccount();
  const contracts = useContracts();
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch all loans for the current user
  const fetchUserLoans = useCallback(async () => {
    if (!address) {
      setLoans([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Get loan count from the contract
      const loanCountResponse = await contracts.getUserLoanCount();
      const loanCount = Number(loanCountResponse.data || 0);

      if (loanCount === 0) {
        setLoans([]);
        setIsLoading(false);
        return;
      }

      // Fetch all loans
      const userLoans = [];

      for (let i = 0; i < loanCount; i++) {
        const loanDetails = await contracts.getLoanDetails(i);
        const repaymentAmount = await contracts.calculateRepaymentAmount(i);

        if (loanDetails.data) {
          const loan = loanDetails.data;

          // Only include active loans
          if (loan.isActive) {
            const collateralSymbol =
              loan.collateralToken.toLowerCase() ===
              TOKENS.vBTC.address.toLowerCase()
                ? "vBTC"
                : "VNST";

            const borrowSymbol =
              loan.borrowToken.toLowerCase() ===
              TOKENS.vBTC.address.toLowerCase()
                ? "vBTC"
                : "VNST";

            userLoans.push({
              id: i,
              collateralToken: loan.collateralToken,
              collateralSymbol,
              collateralAmount: loan.collateralAmount,
              borrowToken: loan.borrowToken,
              borrowSymbol,
              borrowAmount: loan.borrowAmount,
              repaymentAmount: repaymentAmount.data || loan.borrowAmount,
              timestamp: Number(loan.timestamp) * 1000, // Convert to milliseconds
              isActive: loan.isActive,
            });
          }
        }
      }

      setLoans(userLoans);
    } catch (error) {
      console.error("Error fetching user loans:", error);
    } finally {
      setIsLoading(false);
    }
  }, [address, contracts]);

  // Refresh loans when component mounts or refreshKey changes
  useEffect(() => {
    fetchUserLoans();
  }, [fetchUserLoans, refreshKey]);

  // Handle loan repayment
  const handleRepay = async (loanId: number) => {
    try {
      const loan = loans.find((l) => l.id === loanId);
      if (!loan) return;

      // Check if user has enough balance to repay
      const tokenBalance = await contracts.getTokenBalance(loan.borrowToken);
      const requiredAmount = loan.repaymentAmount;

      if (tokenBalance.data && tokenBalance.data < requiredAmount) {
        toast.error(
          `Insufficient ${loan.borrowSymbol} balance to repay this loan`
        );
        return;
      }

      // Execute repayment
      await contracts.repayCompound(loan.borrowToken, BigInt(loanId));

      // Refresh loans and notify parent
      setTimeout(() => {
        setRefreshKey((prev) => prev + 1);
        if (onLoanUpdated) onLoanUpdated();
      }, 2000);
    } catch (error) {
      console.error("Error repaying loan:", error);
      toast.error("Failed to repay loan");
    }
  };

  if (!address) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
        <p className="text-center text-gray-500">
          Connect wallet to view your loans
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
        <h3 className="text-lg font-semibold mb-2">Your Active Loans</h3>
        <p className="text-gray-500 text-center py-4">
          You don't have any active loans
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Your Active Loans</h3>
        <button
          onClick={() => setRefreshKey((prev) => prev + 1)}
          className="text-sm text-amber-600 hover:text-amber-800 flex items-center"
        >
          <span className="mr-1">↻</span> Refresh
        </button>
      </div>

      <div className="space-y-6">
        {loans.map((loan) => (
          <div
            key={`loan-${loan.id}`}
            className="bg-gray-50 p-4 rounded-lg border"
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Loan ID</p>
                <p className="font-medium">{loan.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium">
                  {new Date(loan.timestamp).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Collateral</p>
                <p className="font-medium">
                  {formatUnits(
                    loan.collateralAmount,
                    TOKENS[loan.collateralSymbol].decimals
                  )}{" "}
                  {loan.collateralSymbol}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Borrowed</p>
                <p className="font-medium">
                  {formatUnits(
                    loan.borrowAmount,
                    TOKENS[loan.borrowSymbol].decimals
                  )}{" "}
                  {loan.borrowSymbol}
                </p>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm">Repayment Amount:</p>
                <p className="font-bold text-amber-600">
                  {formatUnits(
                    loan.repaymentAmount,
                    TOKENS[loan.borrowSymbol].decimals
                  )}{" "}
                  {loan.borrowSymbol}
                </p>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">
                  Your {loan.borrowSymbol} Balance:
                </p>
                <TokenBalanceDisplay
                  tokenAddress={loan.borrowToken}
                  tokenSymbol={loan.borrowSymbol}
                  decimals={TOKENS[loan.borrowSymbol].decimals}
                  showRefreshButton={true}
                  refreshInterval={10000}
                />
              </div>

              <button
                onClick={() => handleRepay(loan.id)}
                className="w-full bg-gradient-to-r from-amber-400 to-red-600 text-white py-2 rounded-lg font-medium hover:from-amber-500 hover:to-red-700"
              >
                Repay Loan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
