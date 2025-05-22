"use client";

import React, { useState } from "react";
import Image from "next/image";

interface MarginAssetProps {
  asset: {
    id: string;
    name: string;
    logo: string;
    maxLeverage: string;
    fee: string;
    liquidationThreshold: string;
    availableLiquidity: string;
  };
}

export default function MarginAssetCard({ asset }: MarginAssetProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [leverageValue, setLeverageValue] = useState(2);

  const handleLeverageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLeverageValue(parseInt(event.target.value));
  };

  return (
    <div
      className="bg-white/30 backdrop-blur-sm border border-black rounded-2xl shadow-lg p-6 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02]"
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
            Available for margin trading
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white/50 rounded-xl p-3 border border-black">
          <p className="text-gray-500 text-xs font-jakarta">Max Leverage</p>
          <p className="text-xl font-bold font-orbitron bg-gradient-to-r from-amber-500 to-red-600 text-transparent bg-clip-text">
            {asset.maxLeverage}
          </p>
        </div>
        <div className="bg-white/50 rounded-xl p-3 border border-black">
          <p className="text-gray-500 text-xs font-jakarta">Position Fee</p>
          <p className="text-xl font-bold font-orbitron bg-gradient-to-r from-amber-500 to-red-600 text-transparent bg-clip-text">
            {asset.fee}
          </p>
        </div>
        <div className="bg-white/50 rounded-xl p-3 border border-black">
          <p className="text-gray-500 text-xs font-jakarta">
            Liquidation Threshold
          </p>
          <p className="text-xl font-bold font-orbitron">
            {asset.liquidationThreshold}
          </p>
        </div>
        <div className="bg-white/50 rounded-xl p-3 border border-black">
          <p className="text-gray-500 text-xs font-jakarta">
            Available Liquidity
          </p>
          <p className="text-xl font-bold font-orbitron">
            {asset.availableLiquidity}
          </p>
        </div>
      </div>

      <div className="mt-6 bg-white/50 rounded-xl p-4 border border-black">
        <p className="text-gray-600 text-sm font-jakarta mb-2">
          Select Leverage
        </p>
        <div className="flex items-center">
          <input
            type="range"
            min="1"
            max={asset.maxLeverage.replace("x", "")}
            value={leverageValue}
            onChange={handleLeverageChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="ml-3 text-lg font-bold font-orbitron">
            {leverageValue}x
          </span>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button className="py-3 px-6 rounded-full font-medium transition-all duration-300 ease-in-out bg-gradient-to-r from-amber-400 to-red-600 text-white shadow-md hover:shadow-lg hover:scale-105">
          Trade
        </button>
      </div>
    </div>
  );
}
