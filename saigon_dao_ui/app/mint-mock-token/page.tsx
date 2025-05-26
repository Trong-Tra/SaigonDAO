"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import WalletConnection from "../../components/WalletConnection";
import Image from "next/image";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useContracts } from "../../hooks/useContracts";
import { CONTRACT_ADDRESSES, MOCK_TOKEN_ABI } from "../../config/contracts";
import { parseUnits } from "viem";
import { toast } from "react-hot-toast";

export default function MintTokenPage() {
  const { address, isConnected } = useAccount();
  const contracts = useContracts();
  const [selectedToken, setSelectedToken] = useState("VNST");
  const [mintingToken, setMintingToken] = useState<string | null>(null);

  const { writeContract, isPending, data: hash } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Fixed mint amounts
  const MINT_AMOUNTS = {
    VNST: {
      amount: "1000000", // 1,000,000 VNST
      decimals: 18,
    },
    vBTC: {
      amount: "10000", // 10,000 vBTC  
      decimals: 18,
    },
  };

  const handleMint = async (tokenName: "VNST" | "vBTC") => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setMintingToken(tokenName);
      const mintConfig = MINT_AMOUNTS[tokenName];
      const amount = parseUnits(mintConfig.amount, mintConfig.decimals);
      
      const contractAddress = tokenName === "VNST" 
        ? CONTRACT_ADDRESSES[17000].VNST 
        : CONTRACT_ADDRESSES[17000].vBTC;

      await writeContract({
        address: contractAddress,
        abi: MOCK_TOKEN_ABI,
        functionName: "mint",
        args: [address, amount],
      });

      toast.success(`Minting ${mintConfig.amount} ${tokenName}...`);
    } catch (error) {
      console.error("Mint error:", error);
      toast.error(`Failed to mint ${tokenName}`);
      setMintingToken(null);
    }
  };

  // Reset minting state when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      setMintingToken(null);
      toast.success("Tokens minted successfully!");
    }
  }, [isConfirmed]);

  const tokens = [
    {
      name: "VNST",
      fullName: "Vietnam Stablecoin",
      logo: "/images/tokens/vnst.png",
      balance: contracts.tokens.VNST.balance,
      address: contracts.tokens.VNST.token.address,
      color: "from-blue-400 to-cyan-400",
      bgColor: "bg-blue-50",
    },
    {
      name: "vBTC",
      fullName: "Virtual Bitcoin",
      logo: "/images/tokens/vbtc.png",
      balance: contracts.tokens.vBTC.balance,
      address: contracts.tokens.vBTC.token.address,
      color: "from-orange-400 to-yellow-400",
      bgColor: "bg-orange-50",
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
                Mint Test Tokens
              </h1>
              <p className="text-gray-600 mt-5 font-jakarta text-lg max-w-3xl">
                Mint vBTC and VNST tokens for testing on Holesky testnet. Use
                these tokens in liquidity pools and lending protocols.
              </p>
            </div>

            {/* Network Info */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200 mb-8">
              <div className="flex items-center justify-center">
                <div className="text-center p-4 bg-blue-50 rounded-lg flex-1">
                  <p className="text-blue-800 font-medium">
                    Network: Holesky Testnet (Chain ID: 17000)
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    Make sure your wallet is connected to Holesky testnet
                  </p>
                </div>
              </div>
            </div>

            {/* Mint Information */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200 mb-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Fixed Mint Amounts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-center space-x-2">
                      <Image
                        src="/images/tokens/vnst.png"
                        alt="VNST"
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      <span className="font-medium">VNST: 1,000,000 tokens</span>
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="flex items-center justify-center space-x-2">
                      <Image
                        src="/images/tokens/vbtc.png"
                        alt="vBTC"
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      <span className="font-medium">vBTC: 10,000 tokens</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Selector */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center bg-gray-50 rounded-lg p-2">
                {tokens.map((token) => (
                  <button
                    key={token.name}
                    className={`flex items-center space-x-2 px-6 py-3 cursor-pointer rounded-lg transition-all duration-200 ${
                      selectedToken === token.name
                        ? "bg-white shadow-sm"
                        : "hover:bg-white/50"
                    }`}
                    onClick={() => setSelectedToken(token.name)}
                  >
                    <div className="w-6 h-6 relative">
                      <Image
                        src={token.logo}
                        alt={`${token.name} Token`}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    </div>
                    <span className="font-medium">{token.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet Connection */}
            {!isConnected && (
              <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-600 mb-6">
                  Connect your wallet to mint test tokens and view your balances
                </p>
                <div className="flex justify-center">
                  <WalletConnection />
                </div>
              </div>
            )}

            {/* Token Cards */}
            {isConnected && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-8">
                {tokens.map((token) => (
                  <div
                    key={token.name}
                    className={`p-6 rounded-xl border border-white/50 shadow-lg transition-all duration-300 hover:shadow-xl ${
                      selectedToken === token.name
                        ? "bg-white/60 backdrop-blur-sm ring-2 ring-blue-200"
                        : "bg-white/30 backdrop-blur-sm"
                    }`}
                  >
                    {/* Token Header */}
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 relative mr-4">
                        <Image
                          src={token.logo}
                          alt={token.name}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {token.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {token.fullName}
                        </p>
                      </div>
                    </div>

                    {/* Balance Display */}
                    <div className={`${token.bgColor} rounded-lg p-4 mb-6`}>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">
                          Your Balance:
                        </span>
                        <span className="font-mono text-xl font-bold">
                          {parseFloat(token.balance).toFixed(
                            token.name === "VNST" ? 2 : 4
                          )}{" "}
                          {token.name}
                        </span>
                      </div>
                    </div>

                    {/* Contract Address */}
                    <div className="mb-6">
                      <span className="text-gray-600 font-medium text-sm block mb-2">
                        Contract Address:
                      </span>
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <p className="font-mono text-xs text-gray-800 break-all">
                          {token.address}
                        </p>
                      </div>
                    </div>

                    {/* Mint Button */}
                    <button
                      className={`w-full py-3 px-4 rounded-full font-medium font-orbitron transition-all duration-300 ease-in-out bg-gradient-to-r ${token.color} text-white hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                      onClick={() => handleMint(token.name as "VNST" | "vBTC")}
                      disabled={!isConnected || isPending || isConfirming || mintingToken === token.name}
                    >
                      {mintingToken === token.name ? (
                        isConfirming ? "Confirming..." : "Minting..."
                      ) : (
                        `Mint ${MINT_AMOUNTS[token.name as keyof typeof MINT_AMOUNTS].amount} ${token.name}`
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Additional Information */}
            {isConnected && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  How to Use Test Tokens
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-teal-50 rounded-lg">
                    <div className="text-2xl mb-2">🏊‍♂️</div>
                    <h4 className="font-semibold mb-2">Liquidity Staking</h4>
                    <p className="text-sm text-gray-600">
                      Stake your tokens to earn rewards and receive LST tokens
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-2">🏦</div>
                    <h4 className="font-semibold mb-2">Lending</h4>
                    <p className="text-sm text-gray-600">
                      Supply tokens to earn interest or borrow against
                      collateral
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl mb-2">⚡</div>
                    <h4 className="font-semibold mb-2">Flash Loans</h4>
                    <p className="text-sm text-gray-600">
                      Borrow without collateral for arbitrage and liquidations
                    </p>
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
