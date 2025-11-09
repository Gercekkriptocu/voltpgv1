'use client'

import { useNetwork } from '@/contexts/NetworkContext'
import type { NetworkId } from '@/config/networks'
import { playRetroSound } from '@/utils/retro-sounds'
import { useState } from 'react'

export function NetworkSwitcher(): JSX.Element {
  const { currentNetworkId, switchNetwork, availableNetworks, currentNetwork } = useNetwork()
  const [isOpen, setIsOpen] = useState(false)
  
  const handleSwitch = (networkId: NetworkId): void => {
    if (networkId !== currentNetworkId) {
      playRetroSound.switch()
      switchNetwork(networkId)
      setIsOpen(false)
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-black/80 backdrop-blur-sm transition-all">
        {/* Current Network Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            px-4 py-2 font-mono text-sm font-bold transition-all flex items-center gap-2
            ${currentNetworkId === 'ARC'
              ? 'text-gray-300 hover:text-white'
              : currentNetworkId === 'STABLE'
              ? 'text-emerald-500 hover:text-emerald-400'
              : currentNetworkId === 'SEPOLIA'
              ? 'text-purple-400 hover:text-purple-300'
              : 'text-green-400 hover:text-green-300'
            }
          `}
        >
          <span className="animate-pulse">▶</span>
          {currentNetwork.displayName}
          <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="mt-2 space-y-1">
            {Object.entries(availableNetworks).map(([id, network]) => {
              const isActive = currentNetworkId === id
              if (isActive) return null // Don't show current network in dropdown
              
              return (
                <button
                  key={id}
                  onClick={() => handleSwitch(id as NetworkId)}
                  className={`
                    w-full px-4 py-2 font-mono text-sm font-bold transition-all text-left
                    ${currentNetworkId === 'ARC'
                      ? 'text-gray-500 hover:text-gray-300'
                      : currentNetworkId === 'STABLE'
                      ? 'text-emerald-700 hover:text-emerald-500'
                      : currentNetworkId === 'SEPOLIA'
                      ? 'text-purple-600 hover:text-purple-400'
                      : 'text-green-600 hover:text-green-400'
                    }
                  `}
                >
                  {network.displayName}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
