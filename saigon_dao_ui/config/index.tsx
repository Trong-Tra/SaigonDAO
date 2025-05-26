// config/index.tsx

import { cookieStorage, createStorage, http } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  mainnet,
  arbitrum,
  sepolia,
  holesky,
  bsc,
  lisk,
  tron,
  taiko,
  base,
  polygon,
} from "@reown/appkit/networks";
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error(
    "Project ID is not defined. Please set NEXT_PUBLIC_PROJECT_ID in .env"
  );
}

export const networks = [
  mainnet,
  arbitrum,
  sepolia,
  holesky,
  bsc,
  lisk,
  tron,
  taiko,
  base,
  polygon,
];

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
  transports: {
    // Add explicit RPC endpoints for better reliability
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [bsc.id]: http(),
    [sepolia.id]: http(),
    [holesky.id]: http(),
    [lisk.id]: http(),
    [tron.id]: http(),
    [taiko.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
  },
});

export const config = wagmiAdapter.wagmiConfig;
