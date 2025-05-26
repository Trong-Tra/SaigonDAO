"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useContracts } from '../hooks/useContracts';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const contracts = useContracts();
  const [isMinting, setIsMinting] = useState(false);

  // Mint test tokens for development
  const handleMintTestTokens = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsMinting(true);
      toast.success("Minting test tokens...");
      
      // Mint both vBTC and VNST tokens
      await contracts.tokens.vBTC.mint("1000");
      await contracts.tokens.VNST.mint("26000000"); // 26M VNST (1000 vBTC worth)
      
      toast.success("Test tokens minted successfully!");
    } catch (error) {
      console.error("Minting error:", error);
      toast.error("Failed to mint test tokens");
    } finally {
      setIsMinting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
        <h3 className="text-lg font-semibold text-white">Connect Your Wallet</h3>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connect({ connector })}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Connect {connector.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Wallet Connected</h3>
        <p className="text-sm text-white/80 font-mono">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </div>
      
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <button
          onClick={handleMintTestTokens}
          disabled={isMinting || contracts.tokens.vBTC.isPending || contracts.tokens.VNST.isPending}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {isMinting ? "Minting..." : "Mint Test Tokens"}
        </button>
        
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* Token Balances */}
      <div className="text-sm text-white/90 text-center">
        <p>vBTC: {parseFloat(contracts.tokens.vBTC.balance).toFixed(4)}</p>
        <p>VNST: {parseFloat(contracts.tokens.VNST.balance).toFixed(2)}</p>
      </div>
    </div>
  );
}
