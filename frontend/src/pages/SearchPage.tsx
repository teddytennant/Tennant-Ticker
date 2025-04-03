import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, TrendingUp, Newspaper, AlertTriangle } from 'lucide-react';
import { getStockQuote } from '../services/stockApi';
import { searchNews } from '../services/newsApi';
import { NewsItem, StockQuote } from '../types';
import { Loader2 } from 'lucide-react';

interface SearchResult {
  stocks: Array<StockQuote>;
  news: Array<NewsItem>;
}

export function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({ stocks: [], news: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Extract search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [location.search]);

  // Perform search
  const performSearch = async (query: string) => {
    setLoading(true);
    setError('');
    
    try {
      // Check if it looks like a stock symbol
      const isStockSymbol = /^[A-Z]{1,5}$/.test(query);
      
      if (isStockSymbol) {
        // If it's a stock symbol, redirect to stock detail page
        navigate(`/stock/${query}`);
        return;
      }
      
      // Search for stocks and news in parallel
      const [stockResults, newsResults] = await Promise.all([
        searchStocks(query),
        searchNews(query)
      ]);
      
      setResults({
        stocks: stockResults,
        news: newsResults
      });
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Search for stocks
  const searchStocks = async (query: string): Promise<StockQuote[]> => {
    // For simplicity, we'll just search for a few common stocks
    // In a real app, you would call an API to search for stocks
    const commonStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA'];
    const results: StockQuote[] = [];
    
    // Filter stocks that might match the query
    const potentialMatches = commonStocks.filter(symbol => 
      symbol.toLowerCase().includes(query.toLowerCase())
    );
    
    // Get quotes for potential matches
    for (const symbol of potentialMatches) {
      try {
        const quote = await getStockQuote(symbol);
        if (quote) {
          results.push(quote);
        }
      } catch (error) {
        console.error(`Error fetching quote for ${symbol}:`, error);
      }
    }
    
    return results;
  };

  // Handle new search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Check if we're already searching for the same query
      const params = new URLSearchParams(location.search);
      const currentQuery = params.get('q');
      
      if (currentQuery === searchQuery.trim()) {
        // If searching for the same term, add a timestamp to force a new search
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}&t=${Date.now()}`);
      } else {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-4">Search Results</h1>
        
        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-2 search-container" style={{ pointerEvents: 'auto' }}>
          <div className="relative flex-1" style={{ pointerEvents: 'auto' }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                console.log('Search page input changed:', value); // Debug logging
              }}
              placeholder="Search stocks, news, insights..." 
              className="w-full py-2 pl-10 pr-4 rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary search-input"
              style={{ 
                pointerEvents: 'auto',
                visibility: 'visible',
                opacity: 1,
                display: 'block',
                zIndex: 1000
              }}
              autoComplete="off"
            />
          </div>
          <button 
            type="submit" 
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            style={{ pointerEvents: 'auto' }}
          >
            Search
          </button>
        </form>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Searching...</span>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}
      
      {/* Results */}
      {!loading && !error && (
        <>
          {/* No results */}
          {results.stocks.length === 0 && results.news.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No results found</h2>
              <p className="text-muted-foreground">
                We couldn't find any matches for "{searchQuery}". Try different keywords or check for typos.
              </p>
            </div>
          )}
          
          {/* Stock results */}
          {results.stocks.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-semibold text-white">Stocks</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.stocks.map((stock) => (
                  <div 
                    key={stock.symbol}
                    onClick={() => navigate(`/stock/${stock.symbol}`)}
                    className="bg-card/50 border border-border/50 rounded-lg p-4 hover:bg-card/80 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white">{stock.symbol}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        stock.change >= 0 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-white">${stock.price.toFixed(2)}</p>
                    <div className="flex items-center mt-4 text-sm text-muted-foreground">
                      <span>View details</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* News results */}
          {results.news.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <Newspaper className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-semibold text-white">News</h2>
              </div>
              
              <div className="space-y-4">
                {results.news.map((item, index) => (
                  <a 
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-card/50 border border-border/50 rounded-lg p-4 hover:bg-card/80 transition-colors"
                  >
                    <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-primary">{item.source.name}</span>
                      <span className="text-muted-foreground">
                        {new Date(item.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 