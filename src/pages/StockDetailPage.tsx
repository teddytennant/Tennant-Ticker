import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, TrendingUp } from 'lucide-react';
import { getStockQuote, getCompanyOverview } from '../services/stockApi';
import { getStockNews } from '../services/newsApi';
import { getStockNewsSummary } from '../services/researchApi';
import { NewsItem, StockQuote } from '../types';
import toast from 'react-hot-toast';
import { AppDock } from '../components/AppDock';

interface StockData {
  quote: StockQuote | null;
  news: NewsItem[];
  newsSummary: string;
  overview: {
    marketCap: string;
    peRatio: number | null;
    avgVolume: number;
  } | null;
}

export function StockDetailPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const [data, setData] = useState<StockData>({
    quote: null,
    news: [],
    newsSummary: '',
    overview: null
  });
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const loadData = async () => {
    if (!symbol) return;
    setLoading(true);
    setSummaryLoading(true);
    try {
      console.log(`Loading data for ${symbol}...`);
      
      // Get quote and overview first
      let quote, overview;
      try {
        [quote, overview] = await Promise.all([
          getStockQuote(symbol),
          getCompanyOverview(symbol)
        ]);
        console.log(`Got quote and overview for ${symbol}`);
      } catch (error) {
        console.error(`Error fetching quote/overview for ${symbol}:`, error);
        toast.error(`Failed to load stock data for ${symbol}`);
        setLoading(false);
        return;
      }
      
      // Get news separately to handle errors independently
      let news: NewsItem[] = [];
      try {
        news = await getStockNews(symbol);
        console.log(`Got ${news.length} news items for ${symbol}`);
      } catch (newsError) {
        console.error(`Error fetching news for ${symbol}:`, newsError);
        toast.error(`Failed to load news for ${symbol}`);
        // Continue with empty news rather than failing the whole page
        news = [];
      }

      setData(prevData => ({
        ...prevData,
        quote, 
        news, 
        overview
      }));
      setLoading(false);
      
      // Get AI-generated news summary
      try {
        const summary = await getStockNewsSummary(symbol);
        console.log(`Got news summary for ${symbol}`);
        setData(prevData => ({
          ...prevData,
          newsSummary: summary
        }));
      } catch (summaryError) {
        console.error(`Error fetching news summary for ${symbol}:`, summaryError);
        // Don't show error toast for summary failure to avoid too many notifications
      } finally {
        setSummaryLoading(false);
      }
    } catch (error) {
      console.error(`Error loading data for ${symbol}:`, error);
      toast.error(`Failed to load stock data for ${symbol}`);
      setLoading(false);
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [symbol]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatLargeNumber = (num: string) => {
    const n = parseInt(num, 10);
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    return n.toLocaleString();
  };

  if (!symbol) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <Link
            to="/stock-monitor"
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Back to Stock Monitor</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <button
            onClick={loadData}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center text-sm sm:text-base"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 border border-gray-700">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6">
            <div className="mb-2 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{symbol}</h1>
              <p className="text-gray-400">Stock Details</p>
            </div>
            {data.quote && (
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold text-white">${formatNumber(data.quote.price)}</div>
                <div className={`flex items-center justify-end ${
                  data.quote.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 mr-1 ${data.quote.change < 0 ? 'transform rotate-180' : ''}`} />
                  {formatNumber(Math.abs(data.quote.change))} ({Math.abs(data.quote.changePercent)}%)
                </div>
              </div>
            )}
          </div>

          {data.overview && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-gray-700/50 p-3 sm:p-4 rounded-lg border border-gray-600">
                <div className="text-xs sm:text-sm text-gray-400">Market Cap</div>
                <div className="text-base sm:text-xl font-semibold text-white truncate">${formatLargeNumber(data.overview.marketCap)}</div>
              </div>
              <div className="bg-gray-700/50 p-3 sm:p-4 rounded-lg border border-gray-600">
                <div className="text-xs sm:text-sm text-gray-400">P/E Ratio</div>
                <div className="text-base sm:text-xl font-semibold text-white truncate">{data.overview.peRatio?.toFixed(2) || 'N/A'}</div>
              </div>
              <div className="bg-gray-700/50 p-3 sm:p-4 rounded-lg border border-gray-600">
                <div className="text-xs sm:text-sm text-gray-400">Avg Volume</div>
                <div className="text-base sm:text-xl font-semibold text-white truncate">{formatLargeNumber(String(data.overview.avgVolume))}</div>
              </div>
            </div>
          )}

          {/* News Summary Section */}
          {data.newsSummary && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">News Summary</h2>
              <div className="bg-gray-700/30 rounded-lg border border-gray-600 p-4 sm:p-5">
                {summaryLoading ? (
                  <div className="flex justify-center items-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <div 
                      className="whitespace-pre-line text-gray-300"
                      dangerouslySetInnerHTML={{ 
                        __html: data.newsSummary
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br />') 
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Latest News</h2>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {data.news.map((item, index) => (
                  <div key={index} className="border-b border-gray-700 pb-4 sm:pb-6 last:border-0 hover:bg-gray-700/30 p-3 sm:p-4 rounded-lg transition-colors">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 mb-3 text-sm sm:text-base line-clamp-3">{item.description}</p>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm gap-2 sm:gap-0">
                      <span className="text-gray-500 truncate">
                        {item.source.name} • {new Date(item.publishedAt).toLocaleDateString()}
                      </span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap"
                      >
                        Read More →
                      </a>
                    </div>
                  </div>
                ))}

                {data.news.length === 0 && (
                  <p className="text-center text-gray-400 py-8 bg-gray-700/50 rounded-lg border border-gray-600">
                    No news available for this stock.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* App Dock */}
      <AppDock />
    </div>
  );
}