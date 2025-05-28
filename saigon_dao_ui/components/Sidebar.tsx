"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [activeLink, setActiveLink] = useState("provide-liquidity");
  const pathname = usePathname();

  // Update active link based on current path
  useEffect(() => {
    if (pathname.startsWith("/liquidity")) {
      setActiveLink("provide-liquidity");
    } else if (pathname.startsWith("/lending")) {
      setActiveLink("lending");
    } else if (pathname.startsWith("/loan-management")) {
      setActiveLink("loan-management");
    } else if (pathname.startsWith("/margin")) {
      setActiveLink("margin");
    } else if (pathname.startsWith("/flash-loan")) {
      setActiveLink("flash-loan");
    }
  }, [pathname]);

  const menuItems = [
    {
      id: "provide-liquidity",
      label: "Provide Liquidity",
      href: "/liquidity/VNST", // Default to VNST
    },
    { id: "lending", label: "Lending", href: "/lending" },
    { id: "loan-management", label: "My Loans", href: "/loan-management" },
    { id: "margin", label: "Margin", href: "/margin" },
    { id: "flash-loan", label: "Flash Loan", href: "/flash-loan" },
  ];

  const socialLinks = [
    { id: "twitter", icon: "/images/social/twitter.png", href: "#" },
    { id: "instagram", icon: "/images/social/instagram.png", href: "#" },
    { id: "discord", icon: "/images/social/discord.png", href: "#" },
    { id: "telegram", icon: "/images/social/telegram.png", href: "#" },
    { id: "github", icon: "/images/social/github.png", href: "#" },
  ];

  return (
    <div className="bg-gradient-to-b from-red-100 via-red-200 to-amber-100 rounded-3xl shadow-lg h-auto min-h-[700px] p-8 flex flex-col border border-[#DA251D]/10 font-orbitron sticky top-6 transition-all duration-300 ease-in-out">
      <div className="text-center mb-10">
        <h2 className="text-4xl text-black font-jakarta">SaigonDAO</h2>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <nav className="space-y-6">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center py-4 px-3 rounded-lg ${
                activeLink === item.id ? "bg-black/10" : "hover:bg-black/5"
              }`}
              onClick={() => setActiveLink(item.id)}
            >
              <div className="w-10 h-10 relative flex items-center justify-center mr-4">
                <div className="w-5 h-5 rounded-full bg-black"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white"
                  >
                    <path
                      d="M3.5 2L6.5 5L3.5 8"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <span className="font-bold text-black text-lg font-orbitron">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-6 pt-5 border-t border-black/20">
        <div className="flex justify-center space-x-8">
          {socialLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="w-8 h-8 flex items-center justify-center text-black/60 hover:text-black transition-all duration-300 ease-in-out"
            >
              <div className="relative w-6 h-6 transition-transform duration-300 ease-in-out hover:scale-125">
                <Image
                  src={link.icon}
                  alt={`${link.id} icon`}
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
