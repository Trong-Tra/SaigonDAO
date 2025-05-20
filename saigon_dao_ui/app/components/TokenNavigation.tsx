"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface TokenNavigationProps {
  currentToken: "VNST" | "vBTC";
}

export default function TokenNavigation({
  currentToken,
}: TokenNavigationProps) {
  const router = useRouter();
  const [isChangingToken, setIsChangingToken] = useState(false);
  const [targetToken, setTargetToken] = useState<"VNST" | "vBTC" | null>(null);

  const handleTokenClick = (token: "VNST" | "vBTC") => {
    if (token !== currentToken) {
      setIsChangingToken(true);
      setTargetToken(token);

      // Delay navigation to allow for animation
      setTimeout(() => {
        router.push(`/liquidity/${token}`);
      }, 300);
    }
  };
  return (
    <div className="flex justify-center mb-12 px-3 transform -translate-y-4">
      <div
        className={`p-1 rounded-full w-full max-w-xl transition-all duration-300 ease-in-out ${
          currentToken === "VNST"
            ? "bg-gradient-to-r from-gray-400 to-amber-500"
            : "bg-gradient-to-r from-slate-100 to-amber-500"
        }`}
      >
        <div className="flex relative">
          <div
            className={`absolute top-0 bottom-0 rounded-full bg-white bg-opacity-80 shadow-sm transition-all duration-300 ease-in-out ${
              currentToken === "VNST" ? "left-0 w-1/2" : "left-1/2 w-1/2"
            }`}
          ></div>
          <button
            onClick={() => handleTokenClick("VNST")}
            className={`flex-1 py-3 px-12 rounded-full text-center font-medium z-10 transition-all duration-300 ease-in-out flex items-center justify-center group ${
              currentToken === "VNST"
                ? "text-black"
                : "text-gray-600 hover:text-gray-800"
            } ${
              isChangingToken && targetToken === "VNST"
                ? "scale-105"
                : "hover:scale-[1.02]"
            }`}
          >
            <div className="w-12 h-12 relative mr-4 flex items-center justify-center transition-all duration-300 ease-in-out">
              <Image
                src="/images/tokens/vnst.png"
                alt="VNST Token"
                width={48}
                height={48}
                className={`object-contain transition-all duration-300 ease-in-out ${
                  isChangingToken && targetToken === "VNST"
                    ? "scale-110"
                    : "group-hover:scale-110"
                }`}
                style={{ maxWidth: "100%", maxHeight: "100%" }}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/40?text=VNST";
                }}
              />
            </div>
            <span
              className={`font-medium text-xl transition-all duration-300 ease-in-out ${
                isChangingToken && targetToken === "VNST"
                  ? "transform translate-x-1"
                  : "group-hover:translate-x-0.5"
              }`}
            >
              VNST
            </span>
          </button>

          <button
            onClick={() => handleTokenClick("vBTC")}
            className={`flex-1 py-3 px-12 rounded-full text-center font-medium z-10 transition-all duration-300 ease-in-out flex items-center justify-center group ${
              currentToken === "vBTC"
                ? "text-black"
                : "text-gray-600 hover:text-gray-800"
            } ${
              isChangingToken && targetToken === "vBTC"
                ? "scale-105"
                : "hover:scale-[1.02]"
            }`}
          >
            <div className="w-12 h-12 relative mr-4 flex items-center justify-center transition-all duration-300 ease-in-out">
              <Image
                src="/images/tokens/vbtc.png"
                alt="vBTC Token"
                width={48}
                height={48}
                className={`object-contain transition-all duration-300 ease-in-out ${
                  isChangingToken && targetToken === "vBTC"
                    ? "scale-110"
                    : "group-hover:scale-110"
                }`}
                style={{ maxWidth: "100%", maxHeight: "100%" }}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/40?text=vBTC";
                }}
              />
            </div>
            <span
              className={`font-medium text-xl transition-all duration-300 ease-in-out ${
                isChangingToken && targetToken === "vBTC"
                  ? "transform translate-x-1"
                  : "group-hover:translate-x-0.5"
              }`}
            >
              vBTC
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
