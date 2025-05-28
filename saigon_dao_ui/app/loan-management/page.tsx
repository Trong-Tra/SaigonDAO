"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import UserLoansDisplay from "@/components/UserLoansDisplay";
import TokenBalanceDisplay from "@/components/TokenBalanceDisplay";
import { TOKENS } from "@/config/contracts";

export default function LoanManagementPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh all components
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-bl from-amber-100 via-white to-amber-100">
      <Header />

      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row">
        <div className="w-full md:w-72 flex-shrink-0 mb-6 md:mb-0">
          <Sidebar />
        </div>

        <main className="flex-1 pl-4 md:pl-6">
          <div className="w-full max-w-6xl mx-auto">
            <div className="mb-10 pt-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-jakarta bg-gradient-to-r from-amber-500 to-red-600 text-transparent bg-clip-text mb-6 leading-loose py-2">
                Loan Management
              </h1>
              <p className="text-gray-600 mt-5 font-jakarta text-lg max-w-3xl">
                Manage your active loans and repay them to get your collateral
                back.
              </p>
            </div>

            {/* Current Balances */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 font-jakarta">
                Your Current Balances
              </h2>
              <div className="bg-white p-6 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 gap-4">
                <TokenBalanceDisplay
                  tokenAddress={TOKENS.vBTC.address}
                  tokenSymbol="vBTC"
                  decimals={TOKENS.vBTC.decimals}
                  refreshInterval={5000}
                  showRefreshButton={true}
                  className="h-full"
                />
                <TokenBalanceDisplay
                  tokenAddress={TOKENS.VNST.address}
                  tokenSymbol="VNST"
                  decimals={TOKENS.VNST.decimals}
                  refreshInterval={5000}
                  showRefreshButton={true}
                  className="h-full"
                />
                <TokenBalanceDisplay
                  tokenAddress={TOKENS.sgvBTC.address}
                  tokenSymbol="sgvBTC"
                  decimals={18}
                  refreshInterval={5000}
                  showRefreshButton={true}
                  className="h-full"
                />
                <TokenBalanceDisplay
                  tokenAddress={TOKENS.sgVNST.address}
                  tokenSymbol="sgVNST"
                  decimals={18}
                  refreshInterval={5000}
                  showRefreshButton={true}
                  className="h-full"
                />
              </div>
            </div>

            {/* User Loans Display */}
            <UserLoansDisplay
              key={`loan-display-${refreshKey}`}
              className="mb-8"
              onLoanUpdated={handleRefresh}
            />

            {/* Explainer Section */}
            <div className="bg-white p-6 rounded-lg shadow mb-10">
              <h2 className="text-lg font-semibold mb-3">
                About SimpleLending
              </h2>
              <p className="text-gray-600 mb-4">
                The SimpleLending contract provides lending operations for the
                SaigonDAO platform.
              </p>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-medium text-amber-800 mb-2">
                  How it Works
                </h3>
                <ul className="list-disc pl-5 text-sm text-amber-700 space-y-2">
                  <li>
                    <strong>Borrowing:</strong> When you borrow, you send
                    collateral tokens and receive borrowed tokens that are
                    minted directly for you.
                  </li>
                  <li>
                    <strong>Repaying:</strong> When you repay, you return the
                    borrowed tokens plus 1% interest and get your collateral
                    back.
                  </li>
                  <li>
                    <strong>Balances:</strong> Token balances should update
                    automatically after a few seconds. Use the refresh button if
                    needed.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
