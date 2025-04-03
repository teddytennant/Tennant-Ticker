import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ServerCrash } from 'lucide-react';
import { LiveNewsStream } from '../components/LiveNewsStream';
import { LiveVideoStream } from '../components/LiveVideoStream';
import { PageHeader } from '../components/PageHeader';
import toast from 'react-hot-toast';
import { AppDock } from '../components/AppDock';
import { checkApiConnection } from '../services/yfinanceApi';

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes - Keeping interval for potential future use or other data

export function InvestorInsight() {
  // Removed state for marketIndices, topMovers, sectorPerformance
  const [loading, setLoading] = useState(true); // General loading state
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const checkServer = useCallback(async () => {
    setServerStatus('checking');
    const isConnected = await checkApiConnection();
    setServerStatus(isConnected ? 'online' : 'offline');
    return isConnected;
  }, []);

  const loadMarketData = useCallback(async (showToast: boolean = false) => {
    // Removed logic for loading indices, movers, sectors
    setRefreshing(true);
    setError(null);
    setLoading(true); // Set general loading state

    // Placeholder for any future data loading specific to this page
    // For now, just simulate loading completion
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    setLoading(false);
    setRefreshing(false);
    if (showToast) {
      toast.success('Page refreshed'); // Generic refresh message
    }
  }, []); // Removed dependencies related to removed state

  useEffect(() => {
    const initializeData = async () => {
      const isConnected = await checkServer();
      if (isConnected) {
        loadMarketData();
      }
    };
    initializeData();
    // Keep interval for potential future auto-refresh needs
    const intervalId = setInterval(() => {
      if (serverStatus === 'online') {
        // loadMarketData(); // Re-enable if new data sources are added
      }
    }, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [checkServer, serverStatus]); // Removed loadMarketData dependency

  const handleRefresh = async () => {
    if (refreshing) return;
    
    if (serverStatus !== 'online') {
      const isConnected = await checkServer();
      if (isConnected) {
        await loadMarketData(true);
      } else {
        toast.error('Unable to connect to the server. Please check your connection.');
      }
    } else {
      await loadMarketData(true);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatPercentage = (percent: number) => {
    return `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `${(marketCap / 1e9).toFixed(1)}B`;
    } else {
      return `${(marketCap / 1e6).toFixed(1)}M`;
    }
  };

  // If the server is offline, show a message
  if (serverStatus === 'offline') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <ServerCrash className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Server Connection Failed</h1>
        <p className="text-gray-400 mb-6 text-center max-w-md">
          Unable to connect to the market data server. Please make sure the backend server is running.
        </p>
        <button
          onClick={() => checkServer().then(isConnected => {
            if (isConnected) {
              loadMarketData(true);
            }
          })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // If the server status is still checking, show a loading message
  if (serverStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  // Updated loading state check
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <PageHeader title="Investor Insight" />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 space-y-6">
        {/* Market Overview, Top Movers, Sector Performance sections removed */}

        {/* Live Video Stream */}
        <LiveVideoStream />

        {/* Market News - Now at the bottom */}
        <LiveNewsStream />
      </div>

      {/* App Dock */}
      <AppDock />
    </div>
  );
}
