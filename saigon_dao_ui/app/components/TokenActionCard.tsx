"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type TokenActionCardProps = {
  token: "VNST" | "vBTC";
  tokenPath: string;
  apy: string;
  backgroundColor: string;
  buttonColor: string;
};

export default function TokenActionCard({
  token,
  tokenPath,
  apy,
  backgroundColor,
  buttonColor,
}: TokenActionCardProps) {
  return (
    <div className={`${backgroundColor} p-6 rounded-lg`}>
      <h3 className="font-bold text-lg mb-2">{token} Staking</h3>
      <p className="text-sm text-gray-700 mb-4">Current APY: {apy}</p>
      <Link
        href={`/liquidity/${tokenPath}`}
        className={`${buttonColor} text-white px-4 py-2 rounded-full text-sm font-medium inline-block`}
      >
        Stake {token}
      </Link>
    </div>
  );
}
