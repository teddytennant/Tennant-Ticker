import { useState, useEffect, useCallback } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, BarChart3, Globe, RefreshCw } from 'lucide-react';
import { getMarketIndices, getTopMovers, getSectorPerformance, type MarketData, type SectorPerformance } from '../services/marketDataApi';
import { LiveNewsStream } from '../components/LiveNewsStream';
import { LiveVideoStream } from '../components/LiveVideoStream';
import { PageHeader } from '../components/PageHeader';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { AppDock } from '../components/AppDock';

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function InvestorInsight() {
  const [marketIndices, setMarketIndices] = useState<MarketData[]>([]);
  const [topMovers, setTopMovers] = useState<MarketData[]>([]);
  const [sectorPerformance, setSectorPerformance] = useState<SectorPerformance[]>([]);
  const [loading, setLoading] = useState({
    indices: true,
    movers: true,
    sectors: true
  });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMarketData = useCallback(async (showToast: boolean = false) => {
    setRefreshing(true);
    setError(null);
    
    const loadIndices = async () => {
      try {
        setLoading(prev => ({ ...prev, indices: true }));
        const indices = await getMarketIndices();
        setMarketIndices(indices);
        return true;
      } catch (error) {
        console.error('Error loading market indices:', error);
        return false;
      } finally {
        setLoading(prev => ({ ...prev, indices: false }));
      }
    };

    const loadMovers = async () => {
      try {
        setLoading(prev => ({ ...prev, movers: true }));
        const movers = await getTopMovers();
        setTopMovers(movers);
        return true;
      } catch (error) {
        console.error('Error loading top movers:', error);
        return false;
      } finally {
        setLoading(prev => ({ ...prev, movers: false }));
      }
    };

    const loadSectors = async () => {
      try {
        setLoading(prev => ({ ...prev, sectors: true }));
        const sectors = await getSectorPerformance();
        setSectorPerformance(sectors);
        return true;
      } catch (error) {
        console.error('Error loading sector performance:', error);
        return false;
      } finally {
        setLoading(prev => ({ ...prev, sectors: false }));
      }
    };

    try {
      const [indicesSuccess, moversSuccess, sectorsSuccess] = await Promise.all([
        loadIndices(),
        loadMovers(),
        loadSectors()
      ]);

      if (!indicesSuccess && !moversSuccess && !sectorsSuccess) {
        throw new Error('Unable to fetch market data. Please try again later.');
      }

      if (showToast) {
        if (indicesSuccess && moversSuccess && sectorsSuccess) {
          toast.success('Market data updated successfully');
        } else {
          const failedSystems = [];
          if (!indicesSuccess) failedSystems.push('market indices');
          if (!moversSuccess) failedSystems.push('top movers');
          if (!sectorsSuccess) failedSystems.push('sector performance');
          
          toast.success(
            `Market data partially updated. Unable to load ${failedSystems.join(', ')}.`,
            { duration: 5000 }
          );
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load market data';
      console.error('Error loading market data:', error);
      setError(errorMessage);
      if (showToast) {
        toast.error(errorMessage);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMarketData();

    const intervalId = setInterval(() => {
      loadMarketData();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [loadMarketData]);

  const handleRefresh = async () => {
    if (refreshing) return;
    await loadMarketData(true);
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

  if (loading.indices && loading.movers && loading.sectors) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <PageHeader
        title="Investor Insight"
        subtitle="Comprehensive market analysis and research tools"
        actions={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center gap-2 ${
              refreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 space-y-6">
        {/* Market Overview */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Market Overview</h2>
          </div>
          {loading.indices ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          ) : marketIndices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketIndices.map((index) => (
                <div key={index.symbol} className="bg-gray-900/50 rounded-lg border border-gray-700/50 p-6 hover:bg-gray-900 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{index.name}</h3>
                      <p className="text-sm text-gray-400">{index.symbol}</p>
                    </div>
                    {index.changePercent >= 0 ? (
                      <ArrowUpRight className="w-5 h-5 text-green-400" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-white">{formatPrice(index.price)}</p>
                    <p className={`text-sm ${index.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPrice(index.change)} ({formatPercentage(index.changePercent)})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No market data available</p>
            </div>
          )}
        </div>

        {/* Top Movers and Sector Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Movers */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Top Movers</h2>
            </div>
            {loading.movers ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
            ) : topMovers.length > 0 ? (
              <div className="space-y-4">
                {topMovers.map((stock) => (
                  <div key={stock.symbol} className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:bg-gray-900 transition-all duration-300">
                    <div>
                      <h3 className="font-medium text-white">{stock.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{stock.symbol}</span>
                        {stock.marketCap && (
                          <>
                            <span>•</span>
                            <span>{formatMarketCap(stock.marketCap)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">{formatPrice(stock.price)}</p>
                      <p className={`text-sm ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercentage(stock.changePercent)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No top movers data available</p>
              </div>
            )}
          </div>

          {/* Sector Performance */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Sector Performance</h2>
            </div>
            {loading.sectors ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
            ) : sectorPerformance.length > 0 ? (
              <div className="space-y-4">
                {sectorPerformance.map((sector) => (
                  <div key={sector.sector} className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:bg-gray-900 transition-all duration-300">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-white">{sector.sector}</span>
                    </div>
                    <div className={`font-medium ${sector.performance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercentage(sector.performance)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No sector performance data available</p>
              </div>
            )}
          </div>
        </div>

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