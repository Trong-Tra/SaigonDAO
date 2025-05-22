"use client";

import React from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MarginAssetCard from "@/components/MarginAssetCard";

export default function MarginPage() {
  // Mock margin assets data - you can replace with your own data later
  const marginAssets = [
    {
      id: "vnst",
      name: "VNST",
      logo: "/images/tokens/vnst.png",
      maxLeverage: "5x",
      fee: "0.05%",
      liquidationThreshold: "80%",
      availableLiquidity: "1,548,325",
    },
    {
      id: "vbtc",
      name: "vBTC",
      logo: "/images/tokens/vbtc.png",
      maxLeverage: "10x",
      fee: "0.08%",
      liquidationThreshold: "75%",
      availableLiquidity: "423",
    },
    {
      id: "pengu",
      name: "PENGU",
      logo: "/images/tokens/pengu.png",
      maxLeverage: "3x",
      fee: "0.06%",
      liquidationThreshold: "85%",
      availableLiquidity: "6,429,871",
    },
    {
      id: "shib",
      name: "SHIB",
      logo: "/images/tokens/shib.png",
      maxLeverage: "2x",
      fee: "0.1%",
      liquidationThreshold: "90%",
      availableLiquidity: "15,983,452,067",
    },
    {
      id: "dot",
      name: "DOT",
      logo: "/images/tokens/dot.png",
      maxLeverage: "5x",
      fee: "0.07%",
      liquidationThreshold: "78%",
      availableLiquidity: "3,987,654",
    },
    {
      id: "lsk",
      name: "LSK",
      logo: "/images/tokens/lsk.png",
      maxLeverage: "4x",
      fee: "0.06%",
      liquidationThreshold: "82%",
      availableLiquidity: "2,764,891",
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
                Margin Trading
              </h1>
              <p className="text-gray-600 mt-5 font-jakarta text-lg max-w-3xl">
                Trade with leverage by borrowing funds to increase your position
                size and potential returns.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-8">
              {marginAssets.map((asset) => (
                <MarginAssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
