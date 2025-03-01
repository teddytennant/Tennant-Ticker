import React, { useState } from 'react';
import { Plus, X, Loader2, Search, TrendingUp, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStockQuote } from '../services/stockApi';

interface StockManagerProps {
  onAddStock: (symbol: string, name: string) => void;
  onRemoveStock: (symbol: string) => void;
  stocks: Array<{ symbol: string; name: string }>;
}

export function StockManager({ onAddStock, onRemoveStock, stocks }: StockManagerProps) {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);

  const validateSymbol = (symbol: string) => {
    // Basic validation for stock symbols
    const symbolRegex = /^[A-Z]{1,5}$/;
    return symbolRegex.test(symbol);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedSymbol = symbol.trim().toUpperCase();

    if (!formattedSymbol) {
      toast.error('Please enter a stock symbol');
      return;
    }

    if (!validateSymbol(formattedSymbol)) {
      toast.error('Invalid stock symbol format. Please use 1-5 capital letters.');
      return;
    }

    // Check if stock is already in the watchlist
    if (stocks.some(s => s.symbol === formattedSymbol)) {
      toast.error('This stock is already in your watchlist');
      return;
    }

    setLoading(true);
    try {
      const quote = await getStockQuote(formattedSymbol);
      
      if (!quote || quote.price === 0) {
        toast.error(`Could not verify stock symbol: ${formattedSymbol}`);
        return;
      }

      onAddStock(formattedSymbol, formattedSymbol);
      setSymbol('');
      toast.success(`Added ${formattedSymbol} to watchlist`);
    } catch (error) {
      toast.error('Failed to add stock. Please try again.');
      console.error('Error adding stock:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-500/10 p-2 rounded-xl">
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Watchlist Manager</h2>
        </div>
        <p className="text-gray-400 leading-relaxed">
          Monitor your favorite stocks by adding them to your personalized watchlist.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Enter stock symbol (e.g., AAPL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 transition-all duration-300"
              disabled={loading}
              maxLength={5}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 flex items-center gap-2 font-medium shadow-lg shadow-blue-500/20 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Add Stock</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {stocks.map((stock) => (
          <div
            key={stock.symbol}
            className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 group hover:bg-gray-800 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <span className="font-semibold text-white text-lg">{stock.symbol}</span>
                <span className="text-gray-400 text-sm ml-2">{stock.name}</span>
              </div>
            </div>
            <button
              onClick={() => {
                onRemoveStock(stock.symbol);
                toast.success(`Removed ${stock.symbol} from watchlist`);
              }}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}

        {stocks.length === 0 && (
          <div className="text-center py-8 px-6 bg-gray-800/30 rounded-xl border border-gray-700/30">
            <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400 text-lg mb-2">Your watchlist is empty</p>
            <p className="text-gray-500">Add stocks above to start monitoring them</p>
          </div>
        )}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-xl border border-blue-500/10">
        <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
          <Search className="w-4 h-4" />
          Tips for Adding Stocks
        </h3>
        <ul className="text-sm text-gray-400 space-y-2">
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
            Use exact ticker symbols (e.g., AAPL for Apple Inc.)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
            Symbols should be 1-5 letters long
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
            Only stocks from major exchanges (NYSE, NASDAQ) are supported
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
            Please wait between requests if you hit the API limit
          </li>
        </ul>
      </div>
    </div>
  );
}