"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import LendingAssetCard from "@/components/LendingAssetCard";
import { useContracts } from "@/hooks/useContracts";
import { useAccount } from "wagmi";

export default function LendingPage() {
  const { address } = useAccount();
  const contracts = useContracts();
  const setupStatus = contracts.checkLendingSetup();

  // Get real data from contracts
  const vnstAvailable = contracts.getAvailableLendingAmount(
    contracts.tokens.VNST.token.address
  );
  const vbtcAvailable = contracts.getAvailableLendingAmount(
    contracts.tokens.vBTC.token.address
  );

  // Keep all assets for UI design - only VNST and vBTC will have functional contract integration
  const lendingAssets = [
    {
      id: "vnst",
      name: "VNST",
      logo: "/images/tokens/vnst.png",
      interestRate: "3.5%",
      apy: "12.8%",
      totalSupply: vnstAvailable || "0", // Real data from contract
      utilization: "76%",
    },
    {
      id: "vbtc",
      name: "vBTC",
      logo: "/images/tokens/vbtc.png",
      interestRate: "2.8%",
      apy: "10.2%",
      totalSupply: vbtcAvailable || "0", // Real data from contract
      utilization: "82%",
    },
    {
      id: "pengu",
      name: "PENGU",
      logo: "/images/tokens/pengu.png",
      interestRate: "5.2%",
      apy: "18.9%",
      totalSupply: "9,876,543",
      utilization: "62%",
    },
    {
      id: "shib",
      name: "SHIB",
      logo: "/images/tokens/shib.png",
      interestRate: "6.1%",
      apy: "22.3%",
      totalSupply: "21,345,678,901",
      utilization: "58%",
    },
    {
      id: "dot",
      name: "DOT",
      logo: "/images/tokens/dot.png",
      interestRate: "3.2%",
      apy: "11.7%",
      totalSupply: "5,432,109",
      utilization: "79%",
    },
    {
      id: "lsk",
      name: "LSK",
      logo: "/images/tokens/lsk.png",
      interestRate: "3.0%",
      apy: "10.9%",
      totalSupply: "4,321,098",
      utilization: "81%",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-bl from-amber-100 via-white to-amber-100">
      <Header />

      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row">
        <div className="w-full md:w-72 flex-shrink-0 mb-6 md:mb-0">
          <Sidebar />
        </div>

        <main className="flex-1 pl-4 md:pl-6">
          <div className="w-full max-w-6xl mx-auto">
            <div className="mb-14 pt-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-jakarta bg-gradient-to-r from-amber-500 to-red-600 text-transparent bg-clip-text mb-6 leading-loose py-2">
                Lending Markets
              </h1>
              <p className="text-gray-600 mt-5 font-jakarta text-lg max-w-3xl">
                Borrow assets against your supplied collateral. To supply assets
                and earn interest, visit the{" "}
                <span className="text-amber-600 font-medium">Liquidity</span>{" "}
                page to get LST tokens. Manage your existing loans on the{" "}
                <Link
                  href="/loan-management"
                  className="text-amber-600 font-medium underline"
                >
                  My Loans
                </Link>{" "}
                page.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-8">
              {lendingAssets.map((asset) => (
                <LendingAssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
