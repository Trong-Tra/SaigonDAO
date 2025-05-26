"use client";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import WalletConnection from "../../components/WalletConnection";
import { useAccount } from "wagmi";
import { useContracts } from "../../hooks/useContracts";

export default function MintTokenPage() {
  const { isConnected } = useAccount();
  const contracts = useContracts();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-green-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Mint Test Tokens
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Mint vBTC and VNST tokens for testing on Holesky testnet. Use
                these tokens in liquidity pools and lending protocols.
              </p>
            </div>

            {/* Network Info */}
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200 mb-8">
              <p className="text-blue-800 font-medium">
                Network: Holesky Testnet (Chain ID: 17000)
              </p>
              <p className="text-blue-600 text-sm mt-1">
                Make sure your wallet is connected to Holesky testnet
              </p>
            </div>

            {/* Wallet Connection */}
            <div className="flex justify-center">
              <WalletConnection />
            </div>

            {/* Token Information */}
            {isConnected && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/30 backdrop-blur-sm rounded-lg border border-white/50">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Token Balances
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">vBTC:</span>
                      <span className="font-mono text-lg">
                        {parseFloat(contracts.tokens.vBTC.balance).toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">VNST:</span>
                      <span className="font-mono text-lg">
                        {parseFloat(contracts.tokens.VNST.balance).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white/30 backdrop-blur-sm rounded-lg border border-white/50">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Contract Addresses
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">
                        vBTC Token:
                      </span>
                      <p className="font-mono text-xs text-gray-800">
                        {contracts.tokens.vBTC.token.address}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">
                        VNST Token:
                      </span>
                      <p className="font-mono text-xs text-gray-800">
                        {contracts.tokens.VNST.token.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
