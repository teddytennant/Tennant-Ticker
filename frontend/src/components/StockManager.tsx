import React, { useState, useEffect, useRef } from 'react';
import { Stock } from '../types/index';
import { X, Plus, Trash2, Search, Loader2 } from 'lucide-react';
import { searchStocks } from '../services/alphaVantageApi';
import toast from 'react-hot-toast';

interface StockManagerProps {
  onAddStock: (symbol: string, name: string) => void;
  onRemoveStock: (symbol: string) => void;
  stocks: Stock[];
  onClose: () => void;
}

export function StockManager({ onAddStock, onRemoveStock, stocks, onClose }: StockManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus on search input when the component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Debounce search function
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const debounceTimeout = setTimeout(async () => {
      try {
        const results = await searchStocks(searchTerm);
        setSearchResults(results);
      } catch (err) {
        console.error("Error searching stocks:", err);
        setError("Failed to fetch stock suggestions. Please try again.");
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  const handleAdd = (symbol: string, name: string) => {
    if (stocks.some(s => s.symbol === symbol)) {
      toast.error(`${symbol} is already in your watchlist.`);
      return;
    }
    onAddStock(symbol, name);
    setSearchTerm(''); // Clear search after adding
    setSearchResults([]); // Clear results
  };

  const handleRemove = (symbol: string) => {
    onRemoveStock(symbol);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 pb-3 border-b" style={{ borderColor: '#30363d' }}>
        <h2 className="text-lg font-semibold" style={{ color: '#c9d1d9' }}>Manage Watchlist</h2>
        <button 
          onClick={onClose} 
          className="p-1 rounded-full transition-colors" 
          style={{ color: '#8b949e' }}
          aria-label="Close stock manager"
        >
          <X size={20} />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8b949e' }} />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search for stocks (e.g., AAPL, Apple)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded text-sm"
          style={{ 
            backgroundColor: '#0d1117', 
            borderColor: '#30363d', 
            color: '#c9d1d9' 
          }}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin" style={{ color: '#8b949e' }} />
        )}
      </div>

      {/* Search Results */}
      {error && <p className="text-xs mb-3" style={{ color: '#f85149' }}>{error}</p>}
      {searchResults.length > 0 && (
        <div className="mb-4 border rounded max-h-40 overflow-y-auto" style={{ borderColor: '#30363d' }}>
          <ul className="divide-y" style={{ borderColor: '#30363d' }}>
            {searchResults.map(result => (
              <li key={result.symbol} className="flex justify-between items-center p-2 hover:bg-opacity-10" style={{ backgroundColor: 'transparent' }}> {/* Use transparent background */}
                <div className="text-sm">
                  <span className="font-medium" style={{ color: '#c9d1d9' }}>{result.symbol}</span>
                  <span className="ml-2" style={{ color: '#8b949e' }}>{result.name}</span>
                </div>
                <button
                  onClick={() => handleAdd(result.symbol, result.name)}
                  className="p-1 rounded-full transition-colors"
                  style={{ color: '#3fb950' }} // Use positive color
                  title={`Add ${result.symbol}`}
                >
                  <Plus size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {searchTerm && !isLoading && searchResults.length === 0 && !error && (
         <p className="text-xs text-center py-2" style={{ color: '#8b949e' }}>No results found for "{searchTerm}"</p>
      )}

      {/* Current Watchlist */}
      <h3 className="text-sm font-medium mb-2" style={{ color: '#c9d1d9' }}>Your Watchlist ({stocks.length})</h3>
      <div className="flex-grow overflow-y-auto border rounded" style={{ borderColor: '#30363d' }}>
        {stocks.length === 0 ? (
          <p className="text-center text-sm py-6" style={{ color: '#8b949e' }}>Your watchlist is empty.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: '#30363d' }}>
            {stocks.map(stock => (
              <li key={stock.symbol} className="flex justify-between items-center p-3"> {/* Increased padding */}
                <div className="text-sm">
                  <span className="font-semibold" style={{ color: '#c9d1d9' }}>{stock.symbol}</span>
                  <span className="ml-2" style={{ color: '#8b949e' }}>{stock.name}</span>
                </div>
                <button
                  onClick={() => handleRemove(stock.symbol)}
                  className="p-1 rounded-full transition-colors"
                  style={{ color: '#f85149' }} // Use negative color
                  title={`Remove ${stock.symbol}`}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Close Button (optional, as there's one in the header) */}
      {/* <div className="mt-4 pt-3 border-t" style={{ borderColor: '#30363d' }}>
        <button 
          onClick={onClose} 
          className="w-full py-2 rounded text-sm font-medium transition-colors"
          style={{ backgroundColor: '#21262d', color: '#58a6ff' }}
        >
          Close
        </button>
      </div> */}
    </div>
  );
}
