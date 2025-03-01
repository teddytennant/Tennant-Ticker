import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, RefreshCw, Filter, ArrowUpRight } from 'lucide-react';
import { getMarketNews, type NewsItem } from '../services/marketDataApi';
import toast from 'react-hot-toast';

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

const CATEGORIES = ['All', 'Technology', 'Finance', 'Crypto', 'Commodities'];

export function LiveNewsStream() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const loadNews = async (showToast: boolean = false, category: string = 'All') => {
    try {
      setError(null);
      setRefreshing(true);
      
      // Map UI categories to API categories
      const apiCategory = category === 'All' ? 'general' : category.toLowerCase();
      
      const newsData = await getMarketNews(apiCategory);
      
      // Assign the correct category to each news item based on the selected category
      const newsWithCategory = newsData.map(item => ({
        ...item,
        category: category === 'All' ? item.category : category.toLowerCase()
      }));
      
      setNews(newsWithCategory);
      
      if (showToast) {
        toast.success('News feed updated');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load news';
      console.error('Error loading news:', error);
      setError(errorMessage);
      if (showToast) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews(false, selectedCategory);

    const intervalId = setInterval(() => {
      loadNews(false, selectedCategory);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [selectedCategory]);

  const handleRefresh = async () => {
    if (refreshing) return;
    await loadNews(true, selectedCategory);
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
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 p-2 rounded-xl">
            <Newspaper className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Market News</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-800 rounded-xl p-1">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-all duration-300 ${
              refreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {news.length > 0 ? (
          news.map((item) => (
            <article
              key={item.id}
              className="group p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-800 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex gap-6">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.headline}
                    className="w-32 h-32 object-cover rounded-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold text-white line-clamp-2 leading-tight">
                      {item.headline}
                    </h3>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors group"
                    >
                      <span className="text-sm font-medium">Read</span>
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                  <p className="mt-3 text-gray-400 line-clamp-2 leading-relaxed">{item.summary}</p>
                  <div className="mt-4 flex items-center gap-3 text-sm">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg font-medium">
                      {item.source}
                    </span>
                    <time
                      dateTime={new Date(item.datetime).toISOString()}
                      className="text-gray-500 font-medium"
                    >
                      {formatDate(item.datetime)}
                    </time>
                    {item.category && (
                      <span className="px-3 py-1 bg-gray-800 text-gray-400 rounded-lg capitalize">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No news available for this category</p>
          </div>
        )}
      </div>
    </div>
  );
} 