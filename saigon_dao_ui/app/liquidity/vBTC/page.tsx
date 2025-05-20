"use client";

import { useState } from "react";
import Image from "next/image";
import StakingCard from "@/components/StakingCard";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TokenNavigation from "@/components/TokenNavigation";

export default function VBTCPage() {
  return (
    <div className="min-h-screen bg-gradient-to-bl from-amber-100 via-white to-amber-100">
      <Header />

      <div className="container mx-auto px-4 py-6 flex">
        <div className="w-72 flex-shrink-0">
          <Sidebar />
        </div>

        <main className="flex-1 pl-6">
          <div className="max-w-4xl mx-auto">
            <TokenNavigation currentToken="vBTC" />
            <StakingCard tokenType="vBTC" />
          </div>
        </main>
      </div>
    </div>
  );
}
