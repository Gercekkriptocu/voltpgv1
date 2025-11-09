'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { NETWORKS, type NetworkId, type NetworkConfig } from '@/config/networks'

interface NetworkContextType {
  currentNetwork: NetworkConfig
  currentNetworkId: NetworkId
  switchNetwork: (networkId: NetworkId) => void
  availableNetworks: Record<string, NetworkConfig>
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export function NetworkProvider({ children }: { children: ReactNode }): JSX.Element {
  const [currentNetworkId, setCurrentNetworkId] = useState<NetworkId>('GIWA')

  const switchNetwork = useCallback((networkId: NetworkId) => {
    console.log('🔄 Switching network to:', networkId)
    setCurrentNetworkId(networkId)
  }, [])

  const value: NetworkContextType = {
    currentNetwork: NETWORKS[currentNetworkId],
    currentNetworkId,
    switchNetwork,
    availableNetworks: NETWORKS
  }

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  )
}

export function useNetwork(): NetworkContextType {
  const context = useContext(NetworkContext)
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider')
  }
  return context
}
