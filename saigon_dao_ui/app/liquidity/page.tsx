"use client";

import { useState } from "react";
import TokenSelector from "@/components/TokenSelector";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Link from "next/link";

export default function LiquidityProviderPage() {
  const [selectedToken, setSelectedToken] = useState("VNST");

  const handleTokenChange = (token: string) => {
    setSelectedToken(token);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-amber-50 to-amber-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Token selector with links to individual token pages */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center bg-gray-50 rounded-lg p-2">
                <Link
                  href="/liquidity/vnst"
                  className={`flex items-center space-x-2 px-6 py-3 cursor-pointer rounded-lg ${
                    selectedToken === "VNST" ? "bg-white shadow-sm" : ""
                  }`}
                  onClick={() => handleTokenChange("VNST")}
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
                </Link>

                <Link
                  href="/liquidity/vbtc"
                  className={`flex items-center space-x-2 px-6 py-3 cursor-pointer rounded-lg ${
                    selectedToken === "vBTC" ? "bg-white shadow-sm" : ""
                  }`}
                  onClick={() => handleTokenChange("vBTC")}
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
                </Link>
              </div>
            </div>

            {/* Overview or instructions */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Liquidity Provider</h2>
              <p className="text-gray-700 mb-4">
                Provide liquidity to earn rewards. Select a token above to get
                started with staking.
              </p>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">VNST Staking</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Current APY: 11.5%
                  </p>
                  <Link
                    href="/liquidity/vnst"
                    className="bg-teal-500 text-white px-4 py-2 rounded-full text-sm font-medium inline-block"
                  >
                    Stake VNST
                  </Link>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">vBTC Staking</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Current APY: 8.2%
                  </p>
                  <Link
                    href="/liquidity/vbtc"
                    className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium inline-block"
                  >
                    Stake vBTC
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
