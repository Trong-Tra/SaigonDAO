"use client";

import React from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import LendingAssetCard from "@/components/LendingAssetCard";

export default function LendingPage() {
  // Mock assets data - you can replace with your own data later
  const lendingAssets = [
    {
      id: "vnst",
      name: "VNST",
      logo: "/images/tokens/vnst.png",
      interestRate: "3.5%",
      apy: "12.8%",
      totalSupply: "1,234,567",
      utilization: "76%",
    },
    {
      id: "vbtc",
      name: "vBTC",
      logo: "/images/tokens/vbtc.png",
      interestRate: "2.8%",
      apy: "10.2%",
      totalSupply: "543",
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

      <div className="container mx-auto px-4 py-6 flex">
        <div className="w-72 flex-shrink-0">
          <Sidebar />
        </div>

        <main className="flex-1 pl-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold font-jakarta bg-gradient-to-r from-amber-500 to-red-600 text-transparent bg-clip-text">
                Lending Markets
              </h1>
              <p className="text-gray-600 mt-2 font-jakarta">
                Supply assets to earn interest or borrow assets by providing
                collateral.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-8">
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
