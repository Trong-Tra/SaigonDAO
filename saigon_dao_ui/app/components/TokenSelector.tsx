"use client";

import { useState } from "react";
import Image from "next/image";

type TokenSelectorProps = {
  selectedToken: string;
  onTokenChange: (token: string) => void;
};

export default function TokenSelector({
  selectedToken,
  onTokenChange,
}: TokenSelectorProps) {
  return (
    <div className="flex items-center justify-center bg-gray-50 rounded-lg p-2">
      <div
        className={`flex items-center space-x-2 px-6 py-3 cursor-pointer rounded-lg ${
          selectedToken === "VNST" ? "bg-white shadow-sm" : ""
        }`}
        onClick={() => onTokenChange("VNST")}
      >
        <div className="w-6 h-6 relative">
          <Image
            src="/images/tokens/vnst.png"
            alt="VNST Token"
            width={24}
            height={24}
            className="rounded-full"
          />
        </div>
        <span className="font-medium">VNST</span>
      </div>

      <div
        className={`flex items-center space-x-2 px-6 py-3 cursor-pointer rounded-lg ${
          selectedToken === "vBTC" ? "bg-white shadow-sm" : ""
        }`}
        onClick={() => onTokenChange("vBTC")}
      >
        <div className="w-6 h-6 relative">
          <Image
            src="/images/tokens/vbtc.png"
            alt="vBTC Token"
            width={24}
            height={24}
            className="rounded-full"
          />
        </div>
        <span className="font-medium">vBTC</span>
      </div>
    </div>
  );
}
