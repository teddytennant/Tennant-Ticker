import { useState, useEffect } from 'react';
import { StockCard } from '../components/StockCard';
import { StockManager } from '../components/StockManager';
import { getStockQuote, getCompanyOverview } from '../services/stockApi';
import { getStockNews } from '../services/newsApi';
import { Stock } from '../types';
import { Settings, RefreshCw, LineChart } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { AppDock } from '../components/AppDock';

export function StockMonitorPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [showManager, setShowManager] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedStocks = localStorage.getItem('stocks');
    if (savedStocks) {
      const parsedStocks = JSON.parse(savedStocks);
      loadStocksData(parsedStocks);
    }
  }, []);

  const loadStocksData = async (stocksList: Array<{ symbol: string; name: string }>, isAddingNewStock: boolean = false) => {
    if (loading) return;

    setLoading(true);

    try {
      const stocksWithData = await Promise.all(
        stocksList.map(async (stock, index) => {
          try {
            // Add delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, index * 1000));

            console.log(`Fetching data for ${stock.symbol}...`);
            
            // First try to get the quote and overview
            let quote, overview;
            try {
              [quote, overview] = await Promise.all([
                getStockQuote(stock.symbol),
                getCompanyOverview(stock.symbol),
              ]);
            } catch (error) {
              console.error(`Error fetching quote/overview for ${stock.symbol}:`, error);
              throw new Error(`Could not fetch data for ${stock.symbol}`);
            }

            if (!quote || !overview) {
              console.error(`Missing data for ${stock.symbol}:`, { quote, overview });
              throw new Error(`Could not fetch data for ${stock.symbol}`);
            }

            // Get company name from overview
            const companyName = overview.name || stock.name;
            console.log(`Got company name for ${stock.symbol}: ${companyName}`);

            // Then try to get the news
            let news: any[] = [];
            try {
              news = await getStockNews(stock.symbol);
              console.log(`Successfully fetched news for ${stock.symbol}`);
            } catch (error) {
              console.error(`Error fetching news for ${stock.symbol}:`, error);
              // Don't throw here, we can still return the stock without news
            }

            return {
              ...stock,
              name: companyName, // Use company name from overview
              price: {
                current: quote.price,
                change: quote.change,
                changePercent: quote.changePercent,
              },
              metrics: {
                marketCap: overview.marketCap,
                peRatio: overview.peRatio,
                avgVolume: overview.avgVolume,
              },
              headlines: news,
              volatilityScore: Math.abs(quote.changePercent) > 5 ? 8 : 
                             Math.abs(quote.changePercent) > 3 ? 6 : 
                             Math.abs(quote.changePercent) > 1 ? 4 : 2,
            };
          } catch (error) {
            if (error instanceof Error) {
              console.error(`Error loading data for ${stock.symbol}:`, {
                message: error.message,
                stack: error.stack
              });
              
              // Show toast for individual stock errors
              toast.error(`Error loading data for ${stock.symbol}: ${error.message}`);
            } else {
              console.error(`Error loading data for ${stock.symbol}:`, error);
              toast.error(`Error loading data for ${stock.symbol}`);
            }
            return null;
          }
        })
      );

      const validStocks = stocksWithData.filter((stock): stock is Stock => stock !== null);
      
      if (isAddingNewStock) {
        // When adding a new stock, return the data without setting state
        return validStocks;
      } else {
        // For initial load or refresh, set the entire stocks state
        setStocks(validStocks);
      }

      if (validStocks.length === 0 && stocksList.length > 0) {
        toast.error('Could not load data for any stocks. Please try again later.');
      } else if (validStocks.length < stocksList.length) {
        toast(`Could only load data for ${validStocks.length} out of ${stocksList.length} stocks.`);
      }

      return validStocks;
    } catch (error) {
      console.error('Error loading stocks data:', error);
      toast.error('Failed to load stock data. Please try again later.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (symbol: string, name: string) => {
    const newStock = { symbol, name };
    const updatedStocks = [...stocks, { symbol, name }];
    localStorage.setItem('stocks', JSON.stringify(updatedStocks.map(s => ({ symbol: s.symbol, name: s.name }))));
    
    // Load data for the new stock and merge it with existing stocks
    const newStockData = await loadStocksData([newStock], true);
    if (newStockData && newStockData.length > 0) {
      setStocks(prevStocks => [...prevStocks, newStockData[0]]);
    }
  };

  const handleRemoveStock = (symbol: string) => {
    const updatedStocks = stocks.filter(s => s.symbol !== symbol);
    localStorage.setItem('stocks', JSON.stringify(updatedStocks.map(s => ({ symbol: s.symbol, name: s.name }))));
    setStocks(updatedStocks);
  };

  const handleRefresh = async () => {
    if (loading) return;
    
    if (stocks.length === 0) {
      toast.error('No stocks to refresh. Add some stocks first!');
      return;
    }

    toast.promise(
      loadStocksData(stocks.map(s => ({ symbol: s.symbol, name: s.name }))),
      {
        loading: 'Refreshing stock data...',
        success: 'Stock data updated successfully',
        error: 'Failed to update stock data',
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <PageHeader
        title="Stock Monitor"
        subtitle="Track your favorite stocks in real-time"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center gap-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Updating...' : 'Refresh'}
            </button>
            <button
              onClick={() => setShowManager(!showManager)}
              className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Manage Stocks
            </button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 space-y-6">
        {showManager && (
          <div className="mb-6 sm:mb-8">
            <StockManager
              stocks={stocks.map(s => ({ symbol: s.symbol, name: s.name }))}
              onAddStock={handleAddStock}
              onRemoveStock={handleRemoveStock}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stocks.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>

        {stocks.length === 0 && (
          <div className="text-center py-8 sm:py-12 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-3 sm:mb-4 mx-auto">
              <LineChart className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">No Stocks Added</h2>
            <p className="text-gray-400 text-sm sm:text-base px-4">
              Click "Manage Stocks" to start building your watchlist.
            </p>
          </div>
        )}
      </div>

      {/* App Dock */}
      <AppDock />
    </div>
  );
} 