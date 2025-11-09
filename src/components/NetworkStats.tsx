'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useNetwork } from '@/contexts/NetworkContext';

interface NetworkStats {
  blockHeight: string;
  totalTransactions: string;
  activeAccounts: string;
  lastUpdate: string;
}

export function NetworkStats(): JSX.Element {
  const [stats, setStats] = useState<NetworkStats>({
    blockHeight: 'LOADING...',
    totalTransactions: 'LOADING...',
    activeAccounts: 'LOADING...',
    lastUpdate: new Date().toISOString(),
  });

  const { currentNetwork } = useNetwork();

  const fetchStats = async (): Promise<void> => {
    try {
      console.log(`📊 Fetching stats for ${currentNetwork.name}...`);
      
      // Parse explorer URL to get origin and path
      const explorerUrl = new URL(currentNetwork.explorerApiUrl);
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocol: explorerUrl.protocol.replace(':', ''),
          origin: explorerUrl.host,
          path: explorerUrl.pathname,
          method: 'GET',
          headers: {},
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Stats fetched:', data);
        setStats({
          blockHeight: data.total_blocks || 'N/A',
          totalTransactions: data.total_transactions || 'N/A',
          activeAccounts: data.total_addresses || 'N/A',
          lastUpdate: new Date().toISOString(),
        });
      } else {
        console.warn('⚠️ Stats API returned non-ok status');
        // Keep showing "LOADING..." or previous data
      }
    } catch (error) {
      console.error('❌ Failed to fetch network stats:', error);
      // Set fallback data for networks without stats API
      setStats({
        blockHeight: 'N/A',
        totalTransactions: 'N/A',
        activeAccounts: 'N/A',
        lastUpdate: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Update every 10 seconds
    return (): void => clearInterval(interval);
  }, [currentNetwork]);

  return (
    <Card className="retro-panel p-4 space-y-2">
      <div className="retro-text text-center mb-4">
        <span className="blink">╔══════════════════╗</span>
      </div>
      <div className="retro-text text-center mb-2">
        <span className="text-sm">║ NETWORK - {currentNetwork.id} ║</span>
      </div>
      <div className="retro-text text-center mb-4">
        <span className="blink">╚══════════════════╝</span>
      </div>
      
      <div className="space-y-3 font-mono">
        <div className="flex justify-between items-center">
          <span className="retro-text">&gt; BLOCK HEIGHT:</span>
          <span className="retro-text-highlight">{stats.blockHeight}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="retro-text">&gt; TOTAL TX:</span>
          <span className="retro-text-highlight">{stats.totalTransactions}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="retro-text">&gt; ACTIVE ACCOUNTS:</span>
          <span className="retro-text-highlight">{stats.activeAccounts}</span>
        </div>
        
        <div className="flex justify-between items-center text-xs opacity-60">
          <span className="retro-text">&gt; LAST UPDATE:</span>
          <span className="retro-text">
            {new Date(stats.lastUpdate).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </Card>
  );
}
