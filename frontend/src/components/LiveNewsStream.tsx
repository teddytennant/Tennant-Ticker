import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, RefreshCw, Filter, ArrowUpRight } from 'lucide-react';
import { getMarketNews } from '../services/marketDataApi';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

const CATEGORIES = ['All', 'Technology', 'Finance', 'Crypto', 'Commodities'];

export function LiveNewsStream() {
  const [news, setNews] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const loadMarketNews = async (showToast: boolean = false) => {
    try {
      setError(null);
      
      if (showToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const marketNews = await getMarketNews();
      
      if (marketNews) {
        setNews(marketNews);
        if (showToast) {
          toast.success('Market news updated successfully');
        }
      } else {
        throw new Error('Failed to fetch market news');
      }
    } catch (error) {
      console.error('Error loading market news:', error);
      setError('Unable to load market news. Please try again later.');
      
      if (showToast) {
        toast.error('Failed to update market news');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMarketNews();
    
    // Auto-refresh every 30 minutes
    const intervalId = setInterval(() => {
      loadMarketNews();
    }, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleRefresh = () => {
    if (refreshing) return;
    loadMarketNews(true);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setLoading(true);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-xl">
              <Newspaper className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Market News</h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-xl">
              <Newspaper className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Market News</h2>
          </div>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 font-medium shadow-lg shadow-blue-500/20"
          >
            Try Again
          </button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Market News</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className={`p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors ${
            refreshing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {loading && !refreshing ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => loadMarketNews(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({node, ...props}) => <h2 className="text-xl font-bold text-white mt-6 mb-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-white mt-4 mb-2" {...props} />,
              p: ({node, ...props}) => <p className="text-gray-300 mb-4" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4" {...props} />,
              li: ({node, ...props}) => <li className="text-gray-300 mb-1" {...props} />,
              a: ({node, ...props}) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
              em: ({node, ...props}) => <em className="text-gray-400 font-normal not-italic" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
              hr: ({node, ...props}) => <hr className="border-gray-700 my-6" {...props} />
            }}
          >
            {news}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
} 