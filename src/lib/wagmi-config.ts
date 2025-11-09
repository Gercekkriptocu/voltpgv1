import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
import { http } from 'wagmi';

// ⚠️ CRITICAL: GIWA Sepolia RPC is rate-limited!
// Official RPC (https://sepolia-rpc.giwa.io) is NOT recommended for production
// 
// For production, use alternative RPC providers:
// 1. Grove (POKT Network): https://grove.city/chains/giwa-sepolia
//    - 250,000 free relays/day
//    - Replace with: https://giwa-sepolia-rpc.gateway.pokt.network/v1/YOUR_APP_ID
// 
// 2. Ankr: https://www.ankr.com/rpc/
//    - 100,000 free requests/day
//    - Replace with: https://rpc.ankr.com/giwa_sepolia/YOUR_API_KEY
// 
// 3. QuickNode: https://www.quicknode.com
//    - Custom chain support (Chain ID: 91342)
//    - Replace with: https://YOUR_ENDPOINT.quiknode.pro/YOUR_TOKEN/
//
// See RPC-SETUP-GUIDE.md for detailed setup instructions

export const GIWA_RPC_ENDPOINTS = {
  grove: 'https://giwa-sepolia-testnet.rpc.grove.city/v1/01fdb492', // Grove - PRIMARY (better error messages)
  official: 'https://sepolia-rpc.giwa.io', // Resmi RPC - Fallback (rate-limited)
  fallback: 'https://rpc.giwa.sepolia.ethpandaops.io', // Alternative
  // Add your own RPC endpoints here:
  // groveCustom: 'https://giwa-sepolia-rpc.gateway.pokt.network/v1/YOUR_APP_ID',
  // ankr: 'https://rpc.ankr.com/giwa_sepolia/YOUR_API_KEY',
  // quicknode: 'https://YOUR_ENDPOINT.quiknode.pro/YOUR_TOKEN/',
} as const;

// ARC Network RPC Endpoints
export const ARC_RPC_ENDPOINTS = {
  primary: 'https://rpc.testnet.arc.network',
  blockdaemon: 'https://rpc.blockdaemon.testnet.arc.network',
  drpc: 'https://rpc.drpc.testnet.arc.network',
  quicknode: 'https://rpc.quicknode.testnet.arc.network',
} as const;

// Stable Network RPC Endpoints
export const STABLE_RPC_ENDPOINTS = {
  primary: 'https://rpc.testnet.stable.xyz',
  websocket: 'wss://rpc.testnet.stable.xyz',
} as const;

// Giwa L2 (Upbit L2) - Sepolia Testnet
export const giwaSepoliaTestnet = defineChain({
  id: 91342,
  name: 'Giwa Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [
        GIWA_RPC_ENDPOINTS.grove, // Primary - Grove (better error data)
        GIWA_RPC_ENDPOINTS.official, // Fallback - resmi RPC
        GIWA_RPC_ENDPOINTS.fallback, // Fallback 2
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Giwa Explorer',
      url: 'https://sepolia-explorer.giwa.io',
    },
  },
  testnet: true,
});

// ARC Network Testnet
export const arcTestnet = defineChain({
  id: 5042002,
  name: 'ARC Testnet',
  nativeCurrency: {
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: {
      http: [
        ARC_RPC_ENDPOINTS.primary,
        ARC_RPC_ENDPOINTS.blockdaemon,
        ARC_RPC_ENDPOINTS.drpc,
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'ARC Scan',
      url: 'https://testnet.arcscan.app',
    },
  },
  testnet: true,
});

// Stable Network Testnet
export const stableTestnet = defineChain({
  id: 2201,
  name: 'Stable Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Stable USD Tether',
    symbol: 'gUSDT',
  },
  rpcUrls: {
    default: {
      http: [STABLE_RPC_ENDPOINTS.primary],
      webSocket: [STABLE_RPC_ENDPOINTS.websocket],
    },
  },
  blockExplorers: {
    default: {
      name: 'Stablescan',
      url: 'https://testnet.stablescan.xyz',
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'Multi-Chain Contract Deployer',
  projectId: 'c3f4d8e1b5a67890c1d2e3f4a5b6c7d8',
  chains: [giwaSepoliaTestnet, arcTestnet, stableTestnet] as const,
  transports: {
    [giwaSepoliaTestnet.id]: http(GIWA_RPC_ENDPOINTS.grove, {
      timeout: 30000, // 30s timeout - yavaş RPC için
      retryCount: 3,
      retryDelay: 1000,
    }),
    [arcTestnet.id]: http(ARC_RPC_ENDPOINTS.primary, {
      timeout: 30000, // 30s timeout
      retryCount: 5, // More retries for ARC
      retryDelay: 1000,
    }),
    [stableTestnet.id]: http(STABLE_RPC_ENDPOINTS.primary, {
      timeout: 30000, // 30s timeout
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
  ssr: false, // CRITICAL: Must be false to avoid indexedDB errors during server-side rendering
});
