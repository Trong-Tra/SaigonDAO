"use client";

import React from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FlashLoanCard from "@/components/FlashLoanCard";

export default function FlashLoanPage() {
  // Only include VNST and vBTC for flash loans
  const flashLoanAssets = [
    {
      id: "vnst",
      name: "VNST",
      logo: "/images/tokens/vnst.png",
      fee: "0.09%",
      maxAmount: "500,000",
      availableLiquidity: "1,234,567",
      utilization: "46%",
    },
    {
      id: "vbtc",
      name: "vBTC",
      logo: "/images/tokens/vbtc.png",
      fee: "0.1%",
      maxAmount: "25",
      availableLiquidity: "543",
      utilization: "72%",
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
                Flash Loans
              </h1>
              <p className="text-gray-600 mt-5 font-jakarta text-lg max-w-3xl">
                Borrow assets without collateral for a single transaction. Great
                for arbitrage, liquidations, and self-liquidations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-8">
              {flashLoanAssets.map((asset) => (
                <FlashLoanCard key={asset.id} asset={asset} />
              ))}
            </div>

            <div className="mt-12 bg-white/40 rounded-2xl p-8 border border-black">
              <h3 className="text-xl font-bold font-orbitron mb-4">
                How Flash Loans Work
              </h3>
              <ol className="list-decimal pl-5 space-y-2 font-jakarta text-gray-700">
                <li>
                  Borrow any amount of available assets without collateral
                </li>
                <li>
                  Use the assets for your transaction (arbitrage, liquidation,
                  etc.)
                </li>
                <li>
                  Return the full amount plus fee within the same transaction
                </li>
                <li>
                  If the transaction fails or assets aren't returned, the entire
                  transaction is reverted
                </li>
              </ol>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-amber-50 border border-black rounded-xl">
                  <h4 className="font-bold text-lg font-orbitron mb-2 text-amber-800">
                    Developer Resources
                  </h4>
                  <p className="text-amber-700 font-jakarta mb-4">
                    We provide complete SDK, code examples, and boilerplate
                    templates to get you started.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-amber-700">
                    <li>Ready-to-use smart contract templates</li>
                    <li>Integration guides for popular frameworks</li>
                    <li>Sample arbitrage implementations</li>
                  </ul>
                </div>
                <div className="p-5 bg-amber-50 border border-black rounded-xl">
                  <h4 className="font-bold text-lg font-orbitron mb-2 text-amber-800">
                    Technical Support
                  </h4>
                  <p className="text-amber-700 font-jakarta mb-4">
                    Our team provides direct support for your flash loan
                    integrations.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-amber-700">
                    <li>One-on-one developer consultation</li>
                    <li>Smart contract review and security advice</li>
                    <li>Custom integration assistance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
