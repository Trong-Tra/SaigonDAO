/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;