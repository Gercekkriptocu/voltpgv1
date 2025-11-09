// Network Configuration - Multi-Chain Support
export interface NetworkConfig {
  id: string
  name: string
  displayName: string
  chainId: number
  rpcUrl: string
  explorerUrl: string
  explorerApiUrl: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  feeToken?: {
    name: string
    symbol: string
    contractAddress?: string
    decimals?: number
    isNative?: boolean
  }
  color: string
  ascii: string
}

export const NETWORKS: Record<string, NetworkConfig> = {
  GIWA: {
    id: 'GIWA',
    name: 'GIWA Sepolia',
    displayName: 'GIWA L2',
    chainId: 91342,
    rpcUrl: 'https://sepolia-rpc.giwa.io',
    explorerUrl: 'https://sepolia-explorer.giwa.io',
    explorerApiUrl: 'https://sepolia-explorer.giwa.io/api/v2/stats',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    color: 'green',
    ascii: '█▓▒░ GIWA L2 ░▒▓█'
  },
  ARC: {
    id: 'ARC',
    name: 'ARC Testnet',
    displayName: 'ARC NETWORK',
    chainId: 5042002,
    rpcUrl: 'https://rpc.testnet.arc.network',
    explorerUrl: 'https://testnet.arcscan.app',
    explorerApiUrl: 'https://testnet.arcscan.app/api/v2/stats',
    nativeCurrency: {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6
    },
    feeToken: {
      name: 'USD Coin',
      symbol: 'USDC',
      contractAddress: '0x3600000000000000000000000000000000000000',
      decimals: 6,
      isNative: true // USDC is native gas token on ARC
    },
    color: 'blue',
    ascii: '█▓▒░ ARC NETWORK ░▒▓█'
  },
  STABLE: {
    id: 'STABLE',
    name: 'Stable Testnet',
    displayName: 'STABLE',
    chainId: 2201,
    rpcUrl: 'https://rpc.testnet.stable.xyz',
    explorerUrl: 'https://testnet.stablescan.xyz',
    explorerApiUrl: 'https://testnet.stablescan.xyz/api/v2/stats',
    nativeCurrency: {
      name: 'Stable USD Tether',
      symbol: 'gUSDT',
      decimals: 18
    },
    feeToken: {
      name: 'Stable USD Tether',
      symbol: 'gUSDT',
      decimals: 18,
      isNative: true // gUSDT is native gas token on Stable
    },
    color: 'darkgreen',
    ascii: '█▓▒░ STABLE ░▒▓█'
  }
}

export type NetworkId = keyof typeof NETWORKS
