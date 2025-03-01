import { Link } from 'react-router-dom';
import { 
  LineChart, 
  BarChart3, 
  MessageSquareText, 
  ArrowRight, 
  Star,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Globe,
  Twitter,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { getMarketIndices, getTopMovers, type MarketData } from '../services/marketDataApi';
import toast from 'react-hot-toast';
import { AppDock } from '../components/AppDock';
import { EvervaultCard } from '../components/ui/evervault-card';
import { GlobalChat } from '../components/GlobalChat';

// Add background card data
const backgroundCards = [
  { symbol: 'META', price: '468.12', change: '+1.24%', color: 'blue', chartPath: 'M0,100 L20,85 L40,95 L60,80 L80,90 L100,70' },
  { symbol: 'AAPL', price: '172.40', change: '-0.85%', color: 'purple', chartPath: 'M0,90 L20,95 L40,85 L60,80 L80,70 L100,85' },
  { symbol: 'HG', price: '3.89', change: '+2.10%', color: 'green', chartPath: 'M0,85 L20,75 L40,80 L60,70 L80,65 L100,60' },
  { symbol: 'QQQ', price: '428.31', change: '+0.92%', color: 'indigo', chartPath: 'M0,80 L20,85 L40,75 L60,85 L80,80 L100,75' },
];

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const [indices, setIndices] = useState<MarketData[]>([]);
  const [topMovers, setTopMovers] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 60000); // Refresh every minute
    
    // Show chat automatically after a short delay
    const chatTimer = setTimeout(() => {
      setShowChat(true);
    }, 1500);
    
    return () => {
      clearInterval(interval);
      clearTimeout(chatTimer);
    };
  }, []);

  const loadMarketData = async () => {
    try {
      console.log('Loading market data for homepage...');
      const [indicesData, moversData] = await Promise.all([
        getMarketIndices(),
        getTopMovers()
      ]);
      console.log(`Loaded ${indicesData.length} indices and ${moversData.length} movers`);
      setIndices(indicesData);
      setTopMovers(moversData);
    } catch (error) {
      console.error('Error loading market data:', error);
      toast.error('Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    return (
      <span className={`${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{formatPrice(change)} ({changePercent.toFixed(2)}%)
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Auto-show AI Assistant */}
      {showChat && (
        <GlobalChat 
          onClose={() => setShowChat(false)} 
          isMinimized={isChatMinimized}
          onMinimize={() => setIsChatMinimized(!isChatMinimized)}
        />
      )}
      
      {/* Market Data Ticker */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 z-40 overflow-hidden">
        <div className="h-full flex items-center">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 px-4">
            {loading ? (
              <div className="text-gray-400">Loading market data...</div>
            ) : indices.length > 0 ? (
              <>
                {indices.map((index) => (
                  <div key={index.symbol} className="flex items-center gap-2">
                    <span className="text-white font-medium">{index.name}</span>
                    <span>{formatChange(index.change, index.changePercent)}</span>
                  </div>
                ))}
                {topMovers.slice(0, 2).map((mover) => (
                  <div key={mover.symbol} className="flex items-center gap-2">
                    <span className="text-white font-medium">{mover.symbol}</span>
                    <span>{formatChange(mover.change, mover.changePercent)}</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-gray-400">Market data unavailable</div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section Background Cards */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ height: '100vh' }}>
        {backgroundCards.map((card, index) => (
          <div
            key={card.symbol}
            className="absolute bg-card animate-float-card"
            style={{
              width: '320px',
              height: '180px',
              left: `${5 + (index * 22)}%`,
              top: `${20 + (index * 10)}%`,
              transform: `rotate(${-5 + (index * 2)}deg)`,
              animationDelay: `${index * 0.5}s`,
              zIndex: 0,
              background: `linear-gradient(135deg, rgba(${card.color === 'blue' ? '59,130,246' : card.color === 'purple' ? '147,51,234' : card.color === 'green' ? '34,197,94' : '79,70,229'}, 0.03) 0%, rgba(${card.color === 'blue' ? '59,130,246' : card.color === 'purple' ? '147,51,234' : card.color === 'green' ? '34,197,94' : '79,70,229'}, 0.01) 100%)`,
              borderRadius: '16px',
              border: `1px solid rgba(${card.color === 'blue' ? '59,130,246' : card.color === 'purple' ? '147,51,234' : card.color === 'green' ? '34,197,94' : '79,70,229'}, 0.1)`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-2xl font-bold text-white/40 mb-1">{card.symbol}</div>
                  <div className="text-lg text-white/30">${card.price}</div>
                </div>
                <div className={`text-${card.color}-500/50 font-medium`}>{card.change}</div>
              </div>
              <svg className="w-full h-12 mt-4" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d={card.chartPath}
                  stroke={`rgba(${card.color === 'blue' ? '59,130,246' : card.color === 'purple' ? '147,51,234' : card.color === 'green' ? '34,197,94' : '79,70,229'}, 0.3)`}
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>

      {/* Hero Section */}
      <div className="relative pt-32">
        <div className="max-w-7xl mx-auto px-6 pb-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block animate-float">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
                <Star className="w-4 h-4 mr-1 animate-pulse" /> New: AI-Powered Market Insights
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight animate-title">
              <span className="text-white block">Professional</span>
              <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent block">
                Market Analysis
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 leading-relaxed animate-fade-in animation-delay-500">
              Advanced financial market intelligence platform designed for<br />
              professional investors and traders.
            </p>
            <div className="flex gap-4 justify-center animate-fade-in animation-delay-1000">
              <Link
                to={isAuthenticated ? "/stock-monitor" : "/signup"}
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center font-medium hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Top Movers Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-white mb-6">Top Market Movers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded mb-2 w-24"></div>
                <div className="h-8 bg-gray-700 rounded mb-2 w-32"></div>
                <div className="h-4 bg-gray-700 rounded w-20"></div>
              </div>
            ))
          ) : (
            topMovers.slice(0, 4).map((stock) => (
              <Link
                key={stock.symbol}
                to={isAuthenticated ? `/stock/${stock.symbol}` : '/signup'}
                className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-medium text-white">{stock.symbol}</span>
                  <TrendingUp className={`w-5 h-5 ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                </div>
                <div className="text-2xl font-bold text-white mb-2">{formatPrice(stock.price)}</div>
                <div>{formatChange(stock.change, stock.changePercent)}</div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Premium Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800 transition-all duration-300 group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Real-Time Data</h3>
            <p className="text-gray-400">
              Access live market data, real-time quotes, and instant updates for informed trading decisions.
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800 transition-all duration-300 group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">NYSE and NASDAQ Coverage</h3>
            <p className="text-gray-400">
              View stocks, ETFs, and market data in one unified platform.
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800 transition-all duration-300 group">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Advanced Security</h3>
            <p className="text-gray-400">
              We never sell your data to third party companies.
            </p>
          </div>
        </div>
      </div>

      {/* Premium AI Feature Highlight with Evervault Card */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative">
          <div className="p-6">
            <div className="inline-block mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Star className="w-4 h-4 mr-1" /> Premium Feature
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              AI-Powered Market Analysis
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Our advanced AI algorithms analyze market trends, news, and technical indicators to provide you with actionable insights and trading recommendations.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Predictive market trend analysis",
                "Personalized stock recommendations",
                "Sentiment analysis of financial news",
                "Risk assessment and portfolio optimization"
              ].map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5 mr-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
              <Link
                to={isAuthenticated ? "/stock-recommendations" : "/signup"}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 font-medium"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Get Stock Recommendations
              </Link>
              <Link
                to={isAuthenticated ? "/research-chat" : "/signup"}
                className="inline-flex items-center px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 font-medium"
              >
                Try AI Assistant
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
          <div className="flex justify-center items-center p-6">
            <div className="w-full max-w-md aspect-square">
              <EvervaultCard text="AI" className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Quick Links</h2>
          <div className="flex space-x-3">
            <a 
              href="https://x.com/TennantTicker" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-gray-800 rounded-lg text-blue-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
              title="Follow us on X (Twitter)"
            >
              <Twitter className="w-5 h-5" />
              <span className="hidden sm:inline text-white">Follow</span>
            </a>
            <a 
              href="discord.com/tennantticker" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-gray-800 rounded-lg text-indigo-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
              title="Join our Discord community"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="hidden sm:inline text-white">Join Discord</span>
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to={isAuthenticated ? "/stock-monitor" : "/signup"}
            className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 group"
          >
            <LineChart className="w-5 h-5 text-blue-400" />
            <span className="text-white">Stock Monitor</span>
            <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to={isAuthenticated ? "/investor-insight" : "/signup"}
            className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 group"
          >
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span className="text-white">Investor Insight</span>
            <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to={isAuthenticated ? "/research-chat" : "/signup"}
            className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 group"
          >
            <MessageSquareText className="w-5 h-5 text-green-400" />
            <span className="text-white">Research Chat</span>
            <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* App Dock */}
      <AppDock />
    </div>
  );
}