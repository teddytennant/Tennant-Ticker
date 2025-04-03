import React, { useState, useEffect, useCallback } from 'react';
import { StockCard } from '../components/StockCard';
import { StockManager } from '../components/StockManager';
import financialDatasetsApi from '../services/financialDatasetsApi';
import { Stock, NewsItem } from '../types/index';
import { Settings, RefreshCw, AlertCircle, TrendingUp, BarChart3, PieChart as PieIcon, ServerCrash } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import toast from 'react-hot-toast';
import { AppDock } from '../components/AppDock';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, Legend, CartesianGrid } from 'recharts';
import { checkApiConnection } from '../services/yfinanceApi';

interface Theme {
  background: string;
  cardBackground: string;
  elementBackground: string;
  border: string;
  hoverBackground: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  positive: string;
  negative: string;
}

// Define the default theme
const THEME: Theme = {
  background: '#0d1117',
  cardBackground: '#161b22',
  elementBackground: '#21262d',
  border: '#30363d',
  hoverBackground: '#30363d',
  textPrimary: '#c9d1d9',
  textSecondary: '#8b949e',
  accent: '#58a6ff',
  positive: '#3fb950',
  negative: '#f85149',
};

// Define default stocks for when a user first visits
const DEFAULT_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' }
];

export function StockMonitorPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [showManager, setShowManager] = useState(false);
  const [selectedView, setSelectedView] = useState<'cards' | 'charts' | 'performance'>('cards');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [retryCount, setRetryCount] = useState(0);

  const checkServer = useCallback(async () => {
    setServerStatus('checking');
    const isConnected = await checkApiConnection();
    setServerStatus(isConnected ? 'online' : 'offline');
    return isConnected;
  }, []);

  useEffect(() => {
    const initializeStockMonitor = async () => {
      const isConnected = await checkServer();

      if (isConnected) {
        // Get saved stocks or use defaults
        const savedStocks = localStorage.getItem('watchedStocks');
        let stocksList;

        if (savedStocks) {
          try {
            stocksList = JSON.parse(savedStocks);
            if (!Array.isArray(stocksList) || stocksList.length === 0) {
              throw new Error('Invalid saved stock data');
            }
          } catch (error) {
            console.warn('Could not parse saved stocks, using defaults:', error);
            stocksList = DEFAULT_STOCKS;
            localStorage.setItem('watchedStocks', JSON.stringify(DEFAULT_STOCKS));
          }
        } else {
          // First time user - use default stocks
          stocksList = DEFAULT_STOCKS;
          localStorage.setItem('watchedStocks', JSON.stringify(DEFAULT_STOCKS));
          toast.success('Welcome! We\'ve added some popular stocks to get you started.', {
            duration: 5000,
            icon: '👋'
          });
        }

        loadStocksData(stocksList);
      }
    };

    initializeStockMonitor();
  }, [checkServer]);

  const calculateSentiment = (changePercent: number, news: any[]): 'positive' | 'negative' | 'neutral' => {
    if (changePercent > 2 || (news.length > 0 && news.filter(item => item.sentiment === 'positive').length > news.length / 2)) {
      return 'positive';
    } else if (changePercent < -2 || (news.length > 0 && news.filter(item => item.sentiment === 'negative').length > news.length / 2)) {
      return 'negative';
    } else {
      return 'neutral';
    }
  };

  const createMockHistoricalData = (symbol: string, currentPrice: number, days: number = 30): any[] => {
    console.log(`Creating mock historical data for ${symbol}`);
    const mockData = [];
    const today = new Date();
    let price = currentPrice;

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }
      const change = (Math.random() - 0.5) * (price * 0.02); // +/- 2%
      price = i === 0 ? currentPrice : price - change;

      mockData.push({
        date: date.toISOString().split('T')[0],
        open: price - (Math.random() * price * 0.01),
        high: price + (Math.random() * price * 0.01),
        low: price - (Math.random() * price * 0.01),
        close: price,
        volume: Math.floor(Math.random() * 10000000) + 1000000
      });
    }
    return mockData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };


  const loadStocksData = async (stocksList: Array<{
    symbol: string;
    name: string;
    holdings?: {
      quantity: number;
      averagePrice?: number;
    }
  }>, isAddingNewStock: boolean = false) => {
    if (loading) return;

    setLoading(true);
    let successCount = 0;
    let failureCount = 0;

    try {
      const isServerOnline = await checkServer();
      if (!isServerOnline) {
        toast.error('Cannot load stock data: Server is offline');
        setLoading(false);
        return;
      }

      const loadedStocks: (Stock | (Stock & { error: true; errorMessage: string }))[] = await Promise.all(
        stocksList.map(async (stock, index): Promise<Stock | (Stock & { error: true; errorMessage: string })> => {
          try {
            await new Promise(resolve => setTimeout(resolve, index * 500));

            console.log(`Fetching data for ${stock.symbol} using FinancialDatasets API...`);
            const apiData = await financialDatasetsApi.getStockData(stock.symbol);

            const companyName = apiData.name || stock.name;
            const currentPrice = apiData.price ?? 0;
            const changePercent = apiData.changePercent ?? 0;

            const historicalData = apiData.historicalData || createMockHistoricalData(stock.symbol, currentPrice, 30);
            const news: NewsItem[] = apiData.news || [];
            const newsSummary = apiData.newsSummary || 'News summary unavailable';


            const resultStock: Stock = {
              symbol: stock.symbol,
              name: companyName,
              price: {
                current: currentPrice,
                change: apiData.change ?? 0,
                changePercent: changePercent,
              },
              metrics: {
                marketCap: apiData.marketCap || null,
                peRatio: null,
                avgVolume: null,
                eps: apiData.eps || null,
                beta: apiData.beta || null,
                dividend: apiData.dividend || null,
                dividendYield: apiData.dividendYield || null,
              },
              technicalIndicators: {
                rsi: apiData.rsi ?? 50, // Placeholder
                macd: null, // Placeholder
                sma50: null, // Placeholder
                sma200: null, // Placeholder
              },
              headlines: news,
              newsSummary: newsSummary,
              historicalData: historicalData,
              volatilityScore: apiData.volatilityScore ?? 50, // Placeholder
              sentiment: calculateSentiment(changePercent, news),
              holdings: stock.holdings
            };
            return resultStock;
          } catch (error) {
            failureCount++;
            console.error(`Error loading stock ${stock.symbol}:`, error);
            const errorResult: Stock & { error: true; errorMessage: string } = {
              symbol: stock.symbol,
              name: stock.name,
              price: {
                current: 0,
                change: 0,
                changePercent: 0,
              },
              metrics: {
                marketCap: null,
                peRatio: null,
                avgVolume: null,
                eps: null,
                beta: null,
                dividend: null,
                dividendYield: null,
              },
              technicalIndicators: {
                rsi: 50,
                macd: null,
                sma50: null,
                sma200: null,
              },
              headlines: [],
              newsSummary: 'Data unavailable',
              historicalData: [],
              volatilityScore: 50,
              sentiment: 'neutral',
              error: true,
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
              holdings: stock.holdings
            };
            return errorResult;
          }
        })
      );

      const validStocks: Stock[] = [];
      const errorStocks: (Stock & { error: true; errorMessage: string })[] = [];
      loadedStocks.forEach(stock => {
        if ('error' in stock && stock.error) {
          errorStocks.push(stock);
        } else {
          validStocks.push(stock as Stock);
        }
      });

      setStocks(validStocks);
      localStorage.setItem('watchedStocks', JSON.stringify(stocksList));

      if (errorStocks.length > 0) {
        const failedSymbols = errorStocks.map(s => s.symbol).join(', ');
        toast.error(`Failed to load data for: ${failedSymbols}. Some data may be missing or outdated.`, {
          id: 'load-error-summary',
          duration: 7000
        });
      }

      if (isAddingNewStock) {
        if (errorStocks.length === 1 && errorStocks[0].symbol === stocksList[0].symbol) {
        } else if (successCount === stocksList.length) {
          toast.success('Stock added successfully');
        }
      } else {
        if (failureCount === 0 && successCount > 0) {
        }
      }
      setRetryCount(0);
    } catch (error) {
      console.error('Error loading stocks data:', error);
      toast.error('Failed to load stock data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (symbol: string, name: string) => {
    try {
        const newStock = { symbol, name };
        await loadStocksData([newStock], true);
        console.log(`Successfully added stock: ${symbol}`);
    } catch (error) {
        console.error(`Error adding stock ${symbol}:`, error);
        toast.error(`Failed to add stock ${symbol}. Please try again.`);
    }
  };

  const handleRemoveStock = (symbol: string) => {
    const updatedStocks = stocks.filter(stock => stock.symbol !== symbol);
    setStocks(updatedStocks);

    const stocksForStorage = updatedStocks.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      holdings: stock.holdings
    }));

    localStorage.setItem('watchedStocks', JSON.stringify(stocksForStorage));
    toast.success(`Removed ${symbol} from your watchlist`);
  };

  const handleUpdateHoldings = (symbol: string, quantity: number, avgPrice?: number) => {
    const updatedStocks = stocks.map(stock => {
      if (stock.symbol === symbol) {
        return {
          ...stock,
          holdings: {
            quantity,
            averagePrice: avgPrice
          }
        };
      }
      return stock;
    });

    setStocks(updatedStocks);

    // Update local storage with updated holdings
    const stocksForStorage = updatedStocks.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      holdings: stock.holdings
    }));

    localStorage.setItem('watchedStocks', JSON.stringify(stocksForStorage));
    toast.success(`Updated holdings for ${symbol}`);
  };

  const handleRefresh = async () => {
    if (loading) return;
    if (serverStatus !== 'online') {
      const isConnected = await checkServer();
      if (!isConnected) {
        toast.error('Server is offline. Please try again later.');
        return;
      }
    }

    const stocksToRefresh = stocks.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      holdings: stock.holdings
    }));

    if (stocksToRefresh.length === 0) {
      toast.error('No stocks to refresh. Add some stocks first!');
      return;
    }

    await loadStocksData(stocksToRefresh);
    toast.success('Stock data refreshed');
  };

  const handleRetryConnection = async () => {
    setRetryCount(prev => prev + 1);
    const isConnected = await checkServer();

    if (isConnected) {
      toast.success('Connected to server successfully');
      const savedStocks = localStorage.getItem('watchedStocks');
      if (savedStocks) {
        const parsedStocks = JSON.parse(savedStocks);
        loadStocksData(parsedStocks);
      } else {
        loadStocksData(DEFAULT_STOCKS);
      }
    } else {
      if (retryCount >= 2) {
        toast.error('Server connection failed multiple times. Please check that the backend server is running.', { duration: 5000 });
      } else {
        toast.error('Server connection failed. Retrying...');
      }
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatPercent = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num / 100);
  };

  const formatLargeNumber = (num: string | number | null | undefined): string => {
    if (num === null || num === undefined) return 'N/A';

    let numericValue: number;
    if (typeof num === 'string') {
      numericValue = parseFloat(num);
      if (isNaN(numericValue)) return 'N/A';
    } else {
      numericValue = num;
    }

    if (numericValue >= 1e12) {
      return `${(numericValue / 1e12).toFixed(2)}T`;
    } else if (numericValue >= 1e9) {
      return `${(numericValue / 1e9).toFixed(2)}B`;
    } else if (numericValue >= 1e6) {
      return `${(numericValue / 1e6).toFixed(2)}M`;
    } else {
      return numericValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }); // Format smaller numbers nicely
    }
  };

  const getSentimentColor = (sentiment?: string): string => {
    if (sentiment === 'positive') return '#3fb950';
    if (sentiment === 'negative') return '#f85149';
    return '#58a6ff'; // Default accent color
  };

  // Custom Tooltip for Pie Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const name = payload[0].name;
      return (
        <div style={{
          backgroundColor: '#21262d',
          border: '1px solid #30363d',
          borderRadius: '0.5rem',
          color: '#c9d1d9',
          fontSize: '0.8rem',
          padding: '8px 12px'
        }}>
          <p>{`${name}: ${value} stock${value !== 1 ? 's' : ''}`}</p>
        </div>
      );
    }
    return null;
  };

  // Prepare data for Sector Distribution Pie Chart outside the return statement
  const sectorData = [
    { name: 'Technology', value: stocks.filter(s => s.symbol.match(/^(AAPL|MSFT|GOOGL|NVDA|META)$/)).length },
    { name: 'Finance', value: stocks.filter(s => s.symbol.match(/^(JPM|BAC|GS|MA)$/)).length },
    { name: 'Healthcare', value: stocks.filter(s => s.symbol.match(/^(JNJ|PFE|UNH|MRK)$/)).length },
    { name: 'Consumer', value: stocks.filter(s => s.symbol.match(/^(AMZN|WMT|HD|COST|PG|KO|PEP)$/)).length },
    { name: 'Energy', value: stocks.filter(s => s.symbol.match(/^(XOM|CVX)$/)).length },
    { name: 'Industrials', value: stocks.filter(s => s.symbol.match(/^(HON|CAT)$/)).length },
    { name: 'Other', value: stocks.filter(s => !s.symbol.match(/^(AAPL|MSFT|GOOGL|NVDA|META|JPM|BAC|GS|MA|JNJ|PFE|UNH|MRK|AMZN|WMT|HD|COST|PG|KO|PEP|XOM|CVX|HON|CAT)$/)).length }
  ].filter(d => d.value > 0);

  const PIE_COLORS = [
    '#58a6ff',
    '#3fb950',
    '#f59e0b',
    '#f85149',
    '#a371f7',
    '#ec4899',
    '#6366f1',
  ];

  const sectorDataWithColors = sectorData.map((entry, index) => ({
    ...entry,
    fill: PIE_COLORS[index % PIE_COLORS.length],
  }));


  // If the server is offline, show a message
  if (serverStatus === 'offline') {
    return (
      <div style={{ backgroundColor: '#0d1117', color: '#c9d1d9' }} className="min-h-screen flex flex-col items-center justify-center p-4">
        <ServerCrash className="w-16 h-16 mb-4" style={{ color: '#8b949e' }} />
        <h1 className="text-2xl font-bold mb-2" style={{color: '#c9d1d9'}}>Server Connection Failed</h1>
        <p style={{ color: '#8b949e' }} className="mb-6 text-center max-w-md">
          Unable to connect to the stock data server. Please make sure the backend server is running.
        </p>
        <button
          onClick={handleRetryConnection}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: '#58a6ff', color: '#0d1117' }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // If the server status is still checking, show a loading message
  if (serverStatus === 'checking') {
    return (
      <div style={{ backgroundColor: '#0d1117' }} className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#58a6ff' }}></div>
      </div>
    );
  }

  // If there are no stocks and we're not loading, show an empty state
  if (stocks.length === 0 && !loading) {
    return (
      <div style={{ backgroundColor: '#0d1117', color: '#c9d1d9' }} className="min-h-screen">
        <PageHeader
          title="Stock Monitor"
          description="Track your investment portfolio"
          children={
            <button
              onClick={() => setShowManager(true)}
              className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
              style={{
                backgroundColor: '#21262d',
                color: '#58a6ff',
                border: `1px solid #30363d`
              }}
            >
              <Settings className="w-4 h-4" />
              Manage Stocks
            </button>
          }
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12"> 
          <div
            className="flex flex-col items-center justify-center p-12 rounded-lg text-center"
            style={{ backgroundColor: '#161b22', border: `1px solid #30363d` }}
          >
            <AlertCircle className="w-12 h-16 mb-4" style={{ color: '#58a6ff' }} />
            <h2 className="text-2xl font-bold mb-2" style={{color: '#c9d1d9'}}>Your Watchlist is Empty</h2>
            <p style={{ color: '#8b949e' }} className="mb-6 text-center max-w-md">
              Add stocks using the 'Manage Stocks' button to start monitoring your investments.
            </p>
            <button
              onClick={() => setShowManager(true)}
              className="px-5 py-2 rounded-lg transition-colors text-sm font-medium"
              style={{ backgroundColor: '#58a6ff', color: '#0d1117' }}
            >
              Add Stocks
            </button>
          </div>
        </div>

        {showManager && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
              className="p-6 rounded-lg shadow-xl w-full max-w-md"
              style={{ backgroundColor: '#161b22', border: `1px solid #30363d` }}
            >
              <StockManager
                onAddStock={handleAddStock}
                onRemoveStock={handleRemoveStock}
                stocks={stocks}
                onClose={() => setShowManager(false)}
              />
            </div>
          </div>
        )}
        <AppDock />
      </div>
    );
  }

  // Show loading state (full page)
  if (loading && stocks.length === 0) { // Only show full page loader initially
    return (
      <div style={{ backgroundColor: '#0d1117' }} className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#58a6ff' }}></div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0d1117', color: '#c9d1d9' }} className="min-h-screen">
      <PageHeader
        title="Stock Monitor"
        description="Track your favorite stocks in real-time"
      >
        <div className="flex items-center gap-3"> 
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
              loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-opacity-80'
            }`}
            style={{
              backgroundColor: '#21262d',
              color: '#8b949e',
              border: `1px solid #30363d`
            }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Updating...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowManager(!showManager)}
            className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
            style={{
              backgroundColor: showManager ? '#58a6ff' : '#21262d',
              color: showManager ? '#0d1117' : '#58a6ff',
              border: `1px solid ${showManager ? '#58a6ff' : '#30363d'}`
            }}
          >
            <Settings className="w-4 h-4" />
            {showManager ? 'Close Manager' : 'Manage Stocks'}
          </button>
        </div>
      </PageHeader>

      {/* Added more vertical padding */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Manager Modal */}
        {showManager && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div
              className="p-6 rounded-lg shadow-xl w-full max-w-md relative"
              style={{ backgroundColor: '#161b22', border: `1px solid #30363d` }}
            >
              <button
                onClick={() => setShowManager(false)}
                className="absolute top-3 right-3 p-1 rounded-full transition-colors"
                style={{ color: '#8b949e' }}
                aria-label="Close stock manager"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <StockManager
                onAddStock={handleAddStock}
                onRemoveStock={handleRemoveStock}
                stocks={stocks}
                onClose={() => setShowManager(false)}
              />
            </div>
          </div>
        )}

        {/* Tabs - Refined styling */}
        <div className="flex mb-8 border-b" style={{ borderColor: '#30363d' }}> 
          {['cards', 'charts', 'performance'].map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view as 'cards' | 'charts' | 'performance')}
              className={`px-4 py-3 flex items-center gap-2 text-sm font-medium transition-colors ${
                selectedView === view ? `border-b-2` : `` // Base classes
              }`}
              style={{
                color: selectedView === view ? '#58a6ff' : '#8b949e',
                backgroundColor: 'transparent', 
                borderBottomColor: selectedView === view ? '#58a6ff' : 'transparent'
              }}
            >
              {view === 'cards' && <TrendingUp className="w-4 h-4" />} 
              {view === 'charts' && <BarChart3 className="w-4 h-4" />}
              {view === 'performance' && <PieIcon className="w-4 h-4" />} 
              <span className="capitalize">{view}</span>
            </button>
          ))}
        </div>

        {/* Empty state - Refined */}
        {stocks.length === 0 && !loading && (
          <div
            className="rounded-lg p-12 text-center"
            style={{ backgroundColor: '#161b22', border: `1px solid #30363d` }}
          >
            <h3 className="text-lg font-medium mb-2" style={{color: '#c9d1d9'}}>Your Watchlist is Empty</h3>
            <p style={{ color: '#8b949e' }} className="mb-6">
              Add stocks using the 'Manage Stocks' button to start monitoring.
            </p>
            <button
              onClick={() => setShowManager(true)}
              className="px-5 py-2 rounded-lg transition-colors text-sm font-medium inline-flex items-center gap-2"
              style={{ backgroundColor: '#58a6ff', color: '#0d1117' }}
            >
              <Settings className="w-4 h-4" />
              <span>Manage Stocks</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton (when stocks array is empty but loading is true) */}
        {loading && stocks.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="rounded-lg p-6 animate-pulse"
                style={{ backgroundColor: '#161b22', border: `1px solid #30363d` }}
              >
                <div className="h-5 rounded w-1/2 mb-4" style={{ backgroundColor: '#21262d' }}></div>
                <div className="h-8 rounded w-1/3 mb-4" style={{ backgroundColor: '#21262d' }}></div>
                <div className="h-4 rounded w-1/4 mb-8" style={{ backgroundColor: '#21262d' }}></div>
                <div className="h-4 rounded w-full mb-2" style={{ backgroundColor: '#21262d' }}></div>
                <div className="h-4 rounded w-2/3" style={{ backgroundColor: '#21262d' }}></div>
              </div>
            ))}
          </div>
        )}

        {/* Cards View */}
        {selectedView === 'cards' && stocks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map(stock => (
                  <StockCard
                    key={stock.symbol}
                    stock={stock}
                    theme={THEME}
                    onRemoveStock={handleRemoveStock}
                    onUpdateHoldings={handleUpdateHoldings}
                  />
            ))}
          </div>
        )}

        {/* Charts View - Refined styling */}
        {selectedView === 'charts' && stocks.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {stocks.map(stock => (
              <div
                key={stock.symbol}
                className="rounded-lg p-6 shadow-sm" 
                style={{ backgroundColor: '#161b22', border: `1px solid #30363d` }}
              >
                <div className="flex justify-between items-start mb-4"> 
                  <div>
                    <h3 className="text-lg font-semibold" style={{color: '#c9d1d9'}}>{stock.name}</h3> 
                    <p className="text-sm" style={{ color: '#8b949e' }}>{stock.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold" style={{color: '#c9d1d9'}}>${formatNumber(stock.price.current)}</p> 
                    <p
                      className="text-sm font-medium"
                      style={{ color: stock.price.change >= 0 ? '#3fb950' : '#f85149' }}
                    > 
                      {stock.price.change >= 0 ? '▲' : '▼'} {formatNumber(Math.abs(stock.price.change))} ({formatPercent(stock.price.changePercent)})
                    </p>
                  </div>
                </div>

                <div className="h-64 mt-4">
                  {stock.historicalData && stock.historicalData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stock.historicalData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}> 
                        <defs>
                          <linearGradient id={`gradientBg-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={stock.price.change >= 0 ? '#3fb950' : '#f85149'} stopOpacity={0.4} /> 
                            <stop offset="100%" stopColor={stock.price.change >= 0 ? '#3fb950' : '#f85149'} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="date"
                          tick={{fill: '#8b949e', fontSize: 11}} 
                          axisLine={false} 
                          tickLine={false} 
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getMonth() + 1}/${date.getDate()}`;
                          }}
                        />
                        <CartesianGrid stroke='#30363d' strokeDasharray="3 3" vertical={false} /> 
                        <YAxis
                          domain={['auto', 'auto']}
                          tick={{fill: '#8b949e', fontSize: 11}}
                          axisLine={false}
                          tickLine={false}
                          orientation="right"
                          tickFormatter={(value) => `$${value.toFixed(0)}`}
                          width={50} 
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#21262d', 
                            border: `1px solid #30363d`,
                            borderRadius: '0.5rem', 
                            color: '#c9d1d9',
                            fontSize: '0.8rem', 
                          padding: '8px 12px' 
                          }}
                          labelStyle={{ fontWeight: '600', marginBottom: '4px' }} 
                          formatter={(value: number) => `Close: $${formatNumber(value)}`}
                          labelFormatter={(label) => {
                            const date = new Date(label);
                            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); 
                          }}
                          cursor={{ stroke: '#58a6ff', strokeWidth: 1, strokeDasharray: '3 3' }} 
                        />
                        <Area
                          type="monotone"
                          dataKey="close"
                          stroke={stock.price.change >= 0 ? '#3fb950' : '#f85149'} 
                          fillOpacity={1}
                          fill={`url(#gradientBg-${stock.symbol})`}
                          strokeWidth={2}
                          dot={false} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p style={{ color: '#8b949e' }}>No historical data available</p>
                    </div>
                  )}
                </div>

                {/* Key Metrics - Refined */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(['Market Cap', 'P/E Ratio', 'RSI (14)', 'Sentiment'] as const).map((label) => {
                    let value: string | number | null | undefined;
                    let valueColor = '#c9d1d9';

                    switch (label) {
                      case 'Market Cap': value = formatLargeNumber(stock.metrics.marketCap); break;
                      case 'P/E Ratio': value = stock.metrics.peRatio ? stock.metrics.peRatio.toFixed(2) : 'N/A'; break;
                      case 'RSI (14)': value = stock.technicalIndicators?.rsi ?? 'N/A'; break;
                      case 'Sentiment':
                        value = (stock.sentiment ?? 'neutral').charAt(0).toUpperCase() + (stock.sentiment ?? 'neutral').slice(1);
                        valueColor = getSentimentColor(stock.sentiment); 
                        break;
                    }

                    return (
                      <div key={label} className="p-3 rounded-md" style={{ backgroundColor: '#21262d' }}>
                        <p className="text-xs mb-1" style={{ color: '#8b949e' }}>{label}</p>
                        <p className="text-sm font-medium" style={{ color: valueColor }}>{value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Performance View - Refined */}
        {selectedView === 'performance' && (
          <div
            className="rounded-lg p-6 shadow-sm"
            style={{
              backgroundColor: '#161b22',
              border: `1px solid #30363d`
            }}
          >
            <h3 className="text-lg font-semibold mb-6" style={{ color: '#c9d1d9' }}>Performance Overview</h3> 

            {loading ? (
              <div className="space-y-4">
                <div className="h-6 rounded w-1/4" style={{ backgroundColor: '#21262d' }}></div>
                <div className="h-64 rounded" style={{ backgroundColor: '#21262d' }}></div>
              </div>
            ) : stocks.length > 0 ? (
              <div className="space-y-8"> 
                {/* Summary Cards */}
                {/* Summary Cards - Refined */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stocks.map(stock => (
                    <div
                      key={stock.symbol}
                      className="p-4 rounded-lg" 
                      style={{ backgroundColor: '#21262d' }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm" style={{ color: '#c9d1d9' }}>{stock.symbol}</span>
                        <span
                          className="text-xs font-medium px-1.5 py-0.5 rounded" 
                          style={{
                            color: stock.price.change >= 0 ? '#3fb950' : '#f85149',
                            backgroundColor: stock.price.change >= 0 ? `#3fb9501A` : `#f851491A` // 10% opacity background
                          }}
                        >
                          {stock.price.change >= 0 ? '▲' : '▼'} {formatPercent(stock.price.changePercent)}
                        </span>
                      </div>
                      <div className="text-lg font-semibold" style={{ color: '#c9d1d9' }}>${formatNumber(stock.price.current)}</div>
                    </div>
                  ))}
                </div>

                {/* Charts - Refined */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> 
                  {/* Sector Distribution Chart (Commented out due to TS error) */}
                  <div>
                    <h4 className="text-base font-medium mb-4" style={{ color: '#c9d1d9' }}>Sector Distribution</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={sectorDataWithColors}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={85}
                            innerRadius={50}
                            dataKey="value"
                            paddingAngle={3}
                          >
                          </Pie>
                          <Tooltip content={<CustomPieTooltip />} />
                          <Legend
                            verticalAlign="bottom"
                            height={40}
                            iconSize={10}
                            wrapperStyle={{ color: '#8b949e', fontSize: '0.75rem', paddingTop: '10px' }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Daily Performance Chart */}
                  <div>
                    <h4 className="text-base font-medium mb-4" style={{ color: '#c9d1d9' }}>Daily Performance (%)</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stocks.map(stock => ({
                            name: stock.symbol,
                            value: stock.price.changePercent
                          }))}
                          margin={{ top: 5, right: 5, left: -25, bottom: 5 }} 
                        >
                          <CartesianGrid stroke='#30363d' strokeDasharray="3 3" vertical={false} /> 
                          <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis
                            tickFormatter={(value) => `${value}%`}
                            tick={{ fill: '#8b949e', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={40} 
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#21262d', 
                              border: `1px solid #30363d`,
                              borderRadius: '0.5rem',
                              color: '#c9d1d9',
                              fontSize: '0.8rem',
                              padding: '8px 12px'
                            }}
                            formatter={(value: number) => `Change: ${value.toFixed(2)}%`}
                            cursor={{ fill: '#1f6feb26' }} 
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}> 
                            {stocks.map((stock, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={stock.price.changePercent >= 0 ? '#3fb950' : '#f85149'}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p style={{ color: '#8b949e' }}>Add stocks to your watchlist to see performance data</p>
                <button
                  onClick={() => setShowManager(true)}
                  className="mt-4 px-4 py-2 rounded-lg transition-colors text-sm font-medium inline-flex items-center gap-2"
                  style={{ backgroundColor: '#58a6ff', color: '#0d1117' }}
                >
                  <Settings className="w-4 h-4" />
                  <span>Manage Stocks</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <AppDock />
    </div>
  );
}
