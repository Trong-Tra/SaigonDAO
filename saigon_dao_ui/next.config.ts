import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  transpilePackages: ["@reown/appkit", "@reown/appkit-adapter-wagmi"],
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.reown.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
