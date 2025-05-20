"use client";

import { useState } from "react";
import Image from "next/image";

type StakingCardProps = {
  tokenType: "VNST" | "vBTC";
};

export default function StakingCard({ tokenType }: StakingCardProps) {
  const [stakeAmount, setStakeAmount] = useState("0.00");
  const [isStaking, setIsStaking] = useState(true);

  // Mock data
  const balanceData = {
    VNST: {
      balance: "1,237,182.92",
      stakingToken: "sgVNST",
      exchangeRate: "1.2 VNST",
      apy: "11.5%",
    },
    vBTC: {
      balance: "5.78",
      stakingToken: "sgvBTC",
      exchangeRate: "1.05 vBTC",
      apy: "8.2%",
    },
  };

  const data = balanceData[tokenType];

  const handleMaxClick = () => {
    // set this to max balance of the token when implementing wallet connection
    setStakeAmount(isStaking ? data.balance : "0.00");
  };

  const handleToggleMode = (mode: boolean) => {
    setIsStaking(mode);
    setStakeAmount("0.00");
  };

  return (
    <div className="p-6 rounded-xl bg-white/30 backdrop-blur-sm border border-white/50 shadow-lg font-orbitron">
      {/* Stake/Unstake Toggle */}
      <div className="flex justify-center mb-8 px-3">
        <div
          className={`p-1 rounded-full w-full max-w-md transition-all duration-300 ease-in-out ${
            isStaking
              ? "bg-gradient-to-r from-teal-200 to-amber-200"
              : "bg-gradient-to-r from-amber-200 to-pink-200"
          }`}
        >
          <div className="flex relative">
            <div
              className={`absolute top-0 bottom-0 rounded-full bg-white bg-opacity-80 shadow-sm transition-all duration-300 ease-in-out ${
                isStaking ? "left-0 w-1/2" : "left-1/2 w-1/2"
              }`}
            ></div>
            <button
              className={`flex-1 py-2 px-8 rounded-full text-center font-medium z-10 transition-colors duration-300 ease-in-out ${
                isStaking ? "text-black" : "text-gray-600"
              }`}
              onClick={() => handleToggleMode(true)}
            >
              Stake
            </button>
            <button
              className={`flex-1 py-2 px-8 rounded-full text-center font-medium z-10 transition-colors duration-300 ease-in-out ${
                !isStaking ? "text-black" : "text-gray-600"
              }`}
              onClick={() => handleToggleMode(false)}
            >
              Unstake
            </button>
          </div>
        </div>
      </div>

      {/* Balance Display */}
      <div className="flex items-center mb-4 mr-6">
        <div className="flex items-center">
          <div className="w-16 h-16 relative mr-4 flex items-center justify-center ml-6 transition-all duration-300 ease-in-out">
            <div
              className="absolute inset-0 flex items-center justify-center transform transition-all duration-300 ease-in-out"
              style={{
                transform: isStaking ? "rotateY(0deg)" : "rotateY(180deg)",
                opacity: isStaking ? 1 : 0,
              }}
            >
              <Image
                src={`/images/tokens/${tokenType.toLowerCase()}.png`}
                alt={tokenType}
                width={64}
                height={64}
                className="object-contain"
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              />
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center transform transition-all duration-300 ease-in-out"
              style={{
                transform: isStaking ? "rotateY(-180deg)" : "rotateY(0deg)",
                opacity: isStaking ? 0 : 1,
              }}
            >
              <Image
                src={`/images/tokens/sg${tokenType.toLowerCase()}.png`}
                alt={`sg${tokenType}`}
                width={64}
                height={64}
                className="object-contain"
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              />
            </div>
          </div>
          <div className="relative h-8">
            <span
              className="text-2xl font-bold absolute transition-all duration-300 ease-in-out"
              style={{
                transform: isStaking ? "translateY(0)" : "translateY(-20px)",
                opacity: isStaking ? 1 : 0,
              }}
            >
              {tokenType}
            </span>
            <span
              className="text-2xl font-bold absolute transition-all duration-300 ease-in-out"
              style={{
                transform: isStaking ? "translateY(20px)" : "translateY(0)",
                opacity: isStaking ? 0 : 1,
              }}
            >
              sg{tokenType}
            </span>
          </div>
        </div>

        <div className="ml-auto flex items-center">
          <span className="text-lg transition-all duration-300 ease-in-out">
            Balance: {data.balance}
          </span>
        </div>
      </div>

      {/* Input Field */}
      <div className="relative mb-6 ml-9">
        <input
          type="text"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          className="w-full text-5xl font-bold text-black py-2 bg-transparent border-none focus:outline-none focus:ring-0 font-orbitron"
          placeholder="0.00"
        />
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 text-teal-500 text-3xl mr-6"
          onClick={handleMaxClick}
        >
          Max
        </button>
      </div>

      {/* Info Box */}
      <div
        className={`backdrop-blur-sm rounded-lg p-4 mb-6 border border-black/30 mx-8 transition-all duration-300 ease-in-out ${
          isStaking
            ? "bg-white/50"
            : "bg-gradient-to-r from-amber-50/50 to-pink-50/50"
        }`}
      >
        <div className="flex justify-between mb-2">
          <span className="text-gray-700">Exchange Rate</span>
          <span className="font-medium">
            1 sg{tokenType} = {data.exchangeRate}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">APY</span>
          <span className="font-medium">{data.apy}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        className={`w-4/5 mx-auto py-3 px-4 rounded-full font-medium font-orbitron block transition-all duration-300 ease-in-out ${
          isStaking
            ? "bg-gradient-to-r from-teal-400 to-amber-300 text-white"
            : "bg-gradient-to-r from-amber-200 to-pink-300"
        }`}
      >
        {isStaking ? "Stake" : "Unstake"}
      </button>
    </div>
  );
}
