"use client";

import Image from "next/image";
import Link from "next/link";
import SplitText from "@/components/SplitText";
import PartnerSection from "@/components/PartnerSection";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-bl from-amber-100 via-white to-amber-100">
      {/* Navigation */}
      <div className="flex justify-between items-center p-12 sticky top-0 z-50 bg-gradient-to-r from-amber-50/80 to-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-24 h-24 relative">
            <Image
              src="/images/logo.png"
              alt="SaigonDAO Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-3xl bg-gradient-to-r from-amber-500 to-red-600 text-transparent bg-clip-text font-jakarta">
            SaigonDAO
          </span>
        </div>
        <Link
          href="/liquidity/VNST"
          className="px-8 py-3 bg-amber-500 rounded-full text-white font-medium hover:bg-amber-600 transition duration-300 hover:shadow-lg"
        >
          Go to dApp
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-24 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 z-10"
        >
          <SplitText
            text="Welcome to SaigonDAO"
            className="text-6xl font-bold text-amber-800 mb-6 font-orbitron"
            delay={80}
          />
          <SplitText
            text="Decentralized Finance for Vietnam"
            className="text-3xl text-amber-700 mt-4"
            delay={60}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="z-10 space-x-4"
        >
          <Link
            href="/lending"
            className="px-8 py-3 bg-amber-500 rounded-full text-white font-medium text-lg hover:bg-amber-600 transition duration-300"
          >
            Explore Lending
          </Link>
          <Link
            href="/liquidity"
            className="px-8 py-3 bg-white border-2 border-amber-500 rounded-full text-amber-500 font-medium text-lg hover:bg-amber-50 transition duration-300"
          >
            Provide Liquidity
          </Link>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="relative py-24 bg-white/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-amber-800 mb-4 font-orbitron">
              Our Ecosystem
            </h2>
            <p className="text-amber-700 max-w-2xl mx-auto">
              Discover the comprehensive suite of decentralized financial
              products powering the SaigonDAO ecosystem.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="bg-white shadow-lg rounded-xl p-8 hover:shadow-xl transition-all duration-300">
              <div className="bg-amber-100 p-3 w-16 h-16 rounded-xl mb-6 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-amber-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path
                    fillRule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-amber-800">Lending</h3>
              <p className="text-gray-600">
                Borrow against your assets with competitive rates and flexible
                terms tailored for Vietnamese users.
              </p>
              <Link
                href="/lending"
                className="mt-6 inline-block text-amber-600 hover:text-amber-700 font-medium"
              >
                Learn more →
              </Link>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-8 hover:shadow-xl transition-all duration-300">
              <div className="bg-amber-100 p-3 w-16 h-16 rounded-xl mb-6 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-amber-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 4a1 1 0 000 2 1 1 0 011 1v1H7a1 1 0 000 2h1v3a3 3 0 106 0v-1a1 1 0 10-2 0v1a1 1 0 11-2 0v-3h3a1 1 0 100-2h-3V7a3 3 0 00-3-3H7z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-amber-800">
                Liquidity
              </h3>
              <p className="text-gray-600">
                Provide liquidity to our pools and earn sustainable yields while
                supporting the Vietnamese DeFi ecosystem.
              </p>
              <Link
                href="/liquidity"
                className="mt-6 inline-block text-amber-600 hover:text-amber-700 font-medium"
              >
                Learn more →
              </Link>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-8 hover:shadow-xl transition-all duration-300">
              <div className="bg-amber-100 p-3 w-16 h-16 rounded-xl mb-6 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-amber-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l.707.707L15.657 5l-1.414 1.414-.707-.707a1 1 0 01 0-1.414A1 1 0 0112 4zM8 8a2 2 0 114 0 2 2 0 01-4 0zm0 8a2 2 0 114 0 2 2 0 01-4 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-amber-800">
                Flash Loans
              </h3>
              <p className="text-gray-600">
                Access instant liquidity for arbitrage opportunities and complex
                financial operations without collateral.
              </p>
              <Link
                href="/flash-loan"
                className="mt-6 inline-block text-amber-600 hover:text-amber-700 font-medium"
              >
                Learn more →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24 bg-amber-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-amber-800 mb-4 font-orbitron">
              Ecosystem Stats
            </h2>
            <p className="text-amber-700 max-w-2xl mx-auto">
              Our platform continues to grow with the support of the Vietnamese
              community.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center bg-white p-8 rounded-xl shadow-md">
              <p className="text-4xl font-bold text-amber-600 mb-2">$24.3M</p>
              <p className="text-gray-600">Total Value Locked</p>
            </div>
            <div className="text-center bg-white p-8 rounded-xl shadow-md">
              <p className="text-4xl font-bold text-amber-600 mb-2">14,500+</p>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div className="text-center bg-white p-8 rounded-xl shadow-md">
              <p className="text-4xl font-bold text-amber-600 mb-2">3.2M</p>
              <p className="text-gray-600">Transactions</p>
            </div>
            <div className="text-center bg-white p-8 rounded-xl shadow-md">
              <p className="text-4xl font-bold text-amber-600 mb-2">150K</p>
              <p className="text-gray-600">VNST in Circulation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section with Fixed Logos */}
      <div className="py-12 bg-transparent border-amber-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-amber-800 mb-4 font-orbitron">
              Our Partners
            </h2>
            <p className="text-amber-700 max-w-2xl mx-auto">
              Collaborating with leading organizations to build a stronger
              Vietnamese DeFi ecosystem.
            </p>
          </div>
        </div>
      </div>

      {/* Animated Partner Section */}
      <div className="mb-12">
        <PartnerSection />
      </div>

      {/* Footer */}
      <footer className="bg-amber-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 relative bg-white rounded-full p-1">
                  <Image
                    src="/images/logo.png"
                    alt="SaigonDAO Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold font-orbitron">
                  SaigonDAO
                </span>
              </div>
              <p className="text-amber-100 max-w-xs">
                Building the future of decentralized finance for Vietnam and
                beyond.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-semibold mb-3">Products</h3>
                <ul className="space-y-2 text-amber-200">
                  <li>
                    <Link
                      href="/lending"
                      className="hover:text-white transition-colors"
                    >
                      Lending
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/liquidity"
                      className="hover:text-white transition-colors"
                    >
                      Liquidity
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/flash-loan"
                      className="hover:text-white transition-colors"
                    >
                      Flash Loans
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">Resources</h3>
                <ul className="space-y-2 text-amber-200">
                  <li>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Whitepaper
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      GitHub
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">Community</h3>
                <ul className="space-y-2 text-amber-200">
                  <li>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Discord
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Twitter
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Telegram
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-amber-700 pt-8 mt-8 text-center md:text-left md:flex justify-between items-center">
            <p className="text-amber-200">
              © 2025 SaigonDAO. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-4 justify-center md:justify-start">
              <Link
                href="#"
                className="text-amber-200 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-amber-200 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
