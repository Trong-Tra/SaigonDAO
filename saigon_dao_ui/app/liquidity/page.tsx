"use client";

import { useState } from "react";
import TokenSelector from "@/components/TokenSelector";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Link from "next/link";
import { useAccount, useBalance } from "wagmi";
import { TOKENS, LST_POOLS } from "@/config/contracts";
import { formatEther } from "viem";

export default function LiquidityProviderPage() {
  const [selectedToken, setSelectedToken] = useState("VNST");
  const { address, isConnected } = useAccount();

  // Fetch token balances
  const { data: vBTCBalance } = useBalance({
    address,
    token: TOKENS.vBTC.address,
  });

  const { data: VNSTBalance } = useBalance({
    address,
    token: TOKENS.VNST.address,
  });

  // Fetch staked token balances (sgVNST and sgvBTC)
  const { data: sgVNSTBalance } = useBalance({
    address,
    token: LST_POOLS.VNST.pool,
  });

  const { data: sgvBTCBalance } = useBalance({
    address,
    token: LST_POOLS.vBTC.pool,
  });

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return "0.000";
    return parseFloat(formatEther(balance)).toFixed(3);
  };

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
              <h2 className="text-2xl font-bold mb-4">
                Liquidity Provider - Supply Assets
              </h2>
              <p className="text-gray-700 mb-4">
                The SaigonDAO Liquidity program uses a two-step process: First,
                add liquidity to receive LP tokens, then stake those LP tokens
                to earn LST (Liquid Staking Tokens) and yield. Your LST tokens
                can be used as collateral for borrowing on the Lending page, or
                unstaked here to redeem your LP tokens.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You need LP tokens from the vBTC-VNST
                  liquidity pool to stake. Visit the vault page to add liquidity
                  first if you don't have LP tokens.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">VNST Staking</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Current APY: 11.5%
                  </p>
                  {isConnected && (
                    <div className="text-xs text-gray-600 mb-3">
                      <div>
                        VNST Balance: {formatBalance(VNSTBalance?.value)}
                      </div>
                      <div>
                        sgVNST Balance: {formatBalance(sgVNSTBalance?.value)}
                      </div>
                    </div>
                  )}
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
                  {isConnected && (
                    <div className="text-xs text-gray-600 mb-3">
                      <div>
                        vBTC Balance: {formatBalance(vBTCBalance?.value)}
                      </div>
                      <div>
                        sgvBTC Balance: {formatBalance(sgvBTCBalance?.value)}
                      </div>
                    </div>
                  )}
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
