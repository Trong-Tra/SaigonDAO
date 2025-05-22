"use client";

import React, { useState } from "react";
import Image from "next/image";

interface FlashLoanAssetProps {
  asset: {
    id: string;
    name: string;
    logo: string;
    fee: string;
    maxAmount: string;
    availableLiquidity: string;
    utilization: string;
  };
}

export default function FlashLoanCard({ asset }: FlashLoanAssetProps) {
  const [isHovering, setIsHovering] = useState(false);

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
            Available for flash loans
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white/50 rounded-xl p-3 border border-black">
          <p className="text-gray-500 text-xs font-jakarta">Flash Loan Fee</p>
          <p className="text-xl font-bold font-orbitron bg-gradient-to-r from-amber-500 to-red-600 text-transparent bg-clip-text">
            {asset.fee}
          </p>
        </div>
        <div className="bg-white/50 rounded-xl p-3 border border-black">
          <p className="text-gray-500 text-xs font-jakarta">Maximum Loan</p>
          <p className="text-xl font-bold font-orbitron bg-gradient-to-r from-amber-500 to-red-600 text-transparent bg-clip-text">
            {asset.maxAmount}
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
        <div className="bg-white/50 rounded-xl p-3 border border-black">
          <p className="text-gray-500 text-xs font-jakarta">Utilization</p>
          <p className="text-xl font-bold font-orbitron">{asset.utilization}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button className="py-3 px-6 rounded-full font-medium transition-all duration-300 ease-in-out bg-gradient-to-r from-amber-400 to-red-600 text-white shadow-md hover:shadow-lg hover:scale-105">
          View Documentation
        </button>
      </div>
    </div>
  );
}
