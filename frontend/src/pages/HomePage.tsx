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
  BarChart,
  PieChart,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { type MarketData } from '../services/marketDataApi';
import toast from 'react-hot-toast';
import { AppDock } from '../components/AppDock';
import { EvervaultCard } from '../components/ui/evervault-card';
import { SimpleErrorBoundary } from '../components/ui/error-boundary';
import { ContainerScroll } from '../components/ui/container-scroll-animation';
import { LampContainer } from '../components/ui/lamp';
import { GlowingEffect } from '../components/ui/glowing-effect';
import { PinContainer } from '../components/ui/3d-pin';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Add background card data
const backgroundCards = [
  { symbol: 'META', price: '468.12', change: '+1.24%', color: 'blue', chartPath: 'M0,100 L20,85 L40,95 L60,80 L80,90 L100,70' },
  { symbol: 'AAPL', price: '172.40', change: '-0.85%', color: 'purple', chartPath: 'M0,90 L20,95 L40,85 L60,80 L80,70 L100,85' },
  { symbol: 'HG', price: '3.89', change: '+2.10%', color: 'green', chartPath: 'M0,85 L20,75 L40,80 L60,70 L80,65 L100,60' },
  { symbol: 'QQQ', price: '428.31', change: '+0.92%', color: 'indigo', chartPath: 'M0,80 L20,85 L40,75 L60,85 L80,80 L100,75' },
];

// Mock data to use for the homepage
const MOCK_INDICES: MarketData[] = [
  {
    symbol: 'SPY',
    name: 'S&P 500',
    price: 508.23,
    change: 2.45,
    changePercent: 0.48,
  },
  {
    symbol: 'QQQ',
    name: 'NASDAQ',
    price: 428.31,
    change: 3.92,
    changePercent: 0.92,
  },
  {
    symbol: 'DIA',
    name: 'Dow Jones',
    price: 38765.12,
    change: -85.23,
    changePercent: -0.22,
  },
  {
    symbol: 'IWM',
    name: 'Russell 2000',
    price: 2015.67,
    change: 15.67,
    changePercent: 0.78,
  },
];

const MOCK_TOP_MOVERS: MarketData[] = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 785.38,
    change: 35.27,
    changePercent: 4.70,
  },
  {
    symbol: 'PLTR',
    name: 'Palantir Technologies',
    price: 24.89,
    change: 2.34,
    changePercent: 10.38,
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices',
    price: 178.23,
    change: -8.45,
    changePercent: -4.52,
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 193.57,
    change: -12.34,
    changePercent: -6.00,
  },
];

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const [marketIndices, setMarketIndices] = useState<MarketData[]>(MOCK_INDICES);
  const [topMovers, setTopMovers] = useState<MarketData[]>(MOCK_TOP_MOVERS);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set mock data with a small delay to simulate loading
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

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
      <span className={`${isPositive ? 'text-green-400' : 'text-red-400'} font-medium`}>
        {isPositive ? '+' : ''}{formatPrice(change)} ({changePercent.toFixed(2)}%)
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 relative overflow-hidden">
      {/* Market Data Ticker - Enhanced */}
      <div className="sticky top-0 left-0 right-0 h-12 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 z-[9990] overflow-hidden shadow-md" style={{ isolation: 'isolate' }}>
        <div className="h-full flex items-center">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-10 px-4">
            {isLoading ? (
              <div className="text-gray-400">Loading market data...</div>
            ) : (
              <>
                {marketIndices.map((index) => (
                  <div key={index.symbol} className="flex items-center gap-3">
                    <span className="text-white font-semibold">{index.name}</span>
                    <span>{formatChange(index.change, index.changePercent)}</span>
                  </div>
                ))}
                {topMovers.slice(0, 2).map((mover) => (
                  <div key={mover.symbol} className="flex items-center gap-3">
                    <span className="text-white font-semibold">{mover.symbol}</span>
                    <span>{formatChange(mover.change, mover.changePercent)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section Background Cards - Refined positioning */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ height: '100vh', top: '0', zIndex: '-1' }}>
        {backgroundCards.map((card, index) => (
          <div
            key={card.symbol}
            className="absolute bg-card animate-float-card"
            style={{
              width: '320px',
              height: '180px',
              left: `${5 + (index * 25)}%`,
              top: `${20 + (index * 12)}%`,
              transform: `rotate(${-5 + (index * 2)}deg) scale(${0.9 + (index * 0.05)})`,
              animationDelay: `${index * 0.5}s`,
              opacity: 0.9,
              zIndex: '-1',
              background: `#0a0a14`,
              borderRadius: '16px',
              border: `1px solid rgba(${card.color === 'blue' ? '59,130,246' : card.color === 'purple' ? '147,51,234' : card.color === 'green' ? '34,197,94' : '79,70,229'}, 0.25)`,
              boxShadow: `0 4px 20px -2px rgba(${card.color === 'blue' ? '59,130,246' : card.color === 'purple' ? '147,51,234' : card.color === 'green' ? '34,197,94' : '79,70,229'}, 0.1)`,
            }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-2xl font-bold text-white/60 mb-1">{card.symbol}</div>
                  <div className="text-lg text-white/50">${card.price}</div>
                </div>
                <div className={`text-${card.color === 'blue' ? 'blue' : card.color === 'purple' ? 'purple' : card.color === 'green' ? 'green' : 'indigo'}-500/70 font-medium`}>{card.change}</div>
              </div>
              <svg className="w-full h-12 mt-4" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d={card.chartPath}
                  stroke={`rgba(${card.color === 'blue' ? '59,130,246' : card.color === 'purple' ? '147,51,234' : card.color === 'green' ? '34,197,94' : '79,70,229'}, 0.6)`}
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-[0.08] animate-blob" style={{ zIndex: '-1' }}></div>
      <div className="absolute top-20 -right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-[0.08] animate-blob animation-delay-2000" style={{ zIndex: '-1' }}></div>
      <div className="absolute -bottom-8 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-[0.08] animate-blob animation-delay-4000" style={{ zIndex: '-1' }}></div>

      {/* Hero Section with Lamp Effect - Refined */}
      <div className="relative" style={{ zIndex: '10' }}>
        <LampContainer className="min-h-[42rem]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto pt-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="inline-block relative"
                style={{ zIndex: '5' }}
              >
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
                  <Star className="w-4 h-4 mr-1.5 animate-pulse" /> New: AI-Powered Market Insights
                </span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0.5, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-6xl md:text-7xl font-bold mb-8 leading-tight tracking-tight relative"
                style={{ zIndex: '5' }}
              >
                <span className="text-white block">Professional</span>
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent block">
                  Market Analysis
                </span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-xl text-gray-300 mb-12 leading-relaxed relative"
                style={{ zIndex: '5' }}
              >
                Advanced financial market intelligence platform designed for<br />
                professional investors and traders.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex gap-4 justify-center relative"
                style={{ zIndex: '5' }}
              >
                <Link
                  to={isAuthenticated ? "/stock-monitor" : "/signup"}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center font-medium hover:scale-[1.03] hover:shadow-lg hover:shadow-blue-500/25 relative"
                >
                  <GlowingEffect disabled={false} glow={true} blur={15} spread={40} variant="blue" />
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/about"
                  className="px-8 py-4 bg-gray-800/80 text-white rounded-lg hover:bg-gray-700 transition-colors relative backdrop-blur-sm"
                >
                  <GlowingEffect disabled={false} glow={true} blur={10} spread={30} variant="blue" />
                  Learn More
                </Link>
              </motion.div>
            </div>
          </div>
        </LampContainer>
      </div>

      {/* Top Movers Section - Enhanced with better shadows and highlights */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Top Market Movers</h2>
          <Link to={isAuthenticated ? "/stock-monitor" : "/signup"} className="text-blue-400 hover:text-blue-300 transition-colors flex items-center">
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
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
                className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 group relative"
              >
                <GlowingEffect disabled={false} glow={true} blur={10} spread={20} variant="blue" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-medium text-white">{stock.symbol}</span>
                  <TrendingUp className={`w-5 h-5 ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'} group-hover:scale-110 transition-transform`} />
                </div>
                <div className="text-2xl font-bold text-white mb-2">{formatPrice(stock.price)}</div>
                <div>{formatChange(stock.change, stock.changePercent)}</div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Container Scroll Animation Section - Enhanced with better typography and spacing */}
      <ContainerScroll
        titleComponent={
          <div className="text-center mb-10">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4"
            >
              <Sparkles className="w-4 h-4 mr-1.5" /> Advanced Features
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 mb-4 tracking-tight">
              Powerful Trading Tools
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Scroll to explore our advanced trading platform with real-time data and AI-powered insights
            </p>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 md:p-10 h-full overflow-y-auto">
          <div className="bg-gray-800/80 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/20 transition-all duration-300 group">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <LineChart className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Advanced Charting</h3>
            <p className="text-gray-300 mb-4">
              Interactive charts with multiple timeframes, technical indicators, and drawing tools to analyze market trends.
            </p>
            <div className="mt-4 bg-gray-900/60 rounded-lg p-4 border border-gray-700/50 group-hover:border-blue-500/20 transition-colors">
              <div className="h-32 w-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center">
                <div className="w-full px-4">
                  <div className="h-0.5 w-full bg-gray-700/50 relative">
                    <div className="absolute h-16 w-full" style={{ top: '-8px' }}>
                      <svg viewBox="0 0 100 20" className="w-full h-full">
                        <path
                          d="M0,10 L10,8 L20,12 L30,7 L40,15 L50,5 L60,10 L70,3 L80,12 L90,7 L100,10"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="1.5"
                          className="group-hover:stroke-[#60a5fa] transition-colors"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-400">1D</span>
                    <span className="text-xs text-gray-400">1W</span>
                    <span className="text-xs text-gray-400">1M</span>
                    <span className="text-xs text-gray-400">3M</span>
                    <span className="text-xs text-gray-400">1Y</span>
                    <span className="text-xs text-gray-400">ALL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/80 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/20 transition-all duration-300 group">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Market Predictions</h3>
            <p className="text-gray-300 mb-4">
              Machine learning algorithms analyze market data to predict potential price movements and identify trading opportunities.
            </p>
            <div className="mt-4 bg-gray-900/60 rounded-lg p-4 border border-gray-700/50 group-hover:border-purple-500/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">AAPL Prediction</span>
                <span className="text-sm text-green-400 font-medium">+2.4%</span>
              </div>
              <div className="w-full bg-gray-700/50 h-2 rounded-full mb-4">
                <div className="bg-green-500 h-2 rounded-full transition-all duration-500 group-hover:bg-green-400" style={{ width: '65%' }}></div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">MSFT Prediction</span>
                <span className="text-sm text-green-400 font-medium">+1.8%</span>
              </div>
              <div className="w-full bg-gray-700/50 h-2 rounded-full mb-4">
                <div className="bg-green-500 h-2 rounded-full transition-all duration-500 group-hover:bg-green-400" style={{ width: '58%' }}></div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">TSLA Prediction</span>
                <span className="text-sm text-red-400 font-medium">-1.2%</span>
              </div>
              <div className="w-full bg-gray-700/50 h-2 rounded-full">
                <div className="bg-red-500 h-2 rounded-full transition-all duration-500 group-hover:bg-red-400" style={{ width: '42%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/80 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 hover:border-green-500/20 transition-all duration-300 group">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquareText className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Research Assistant</h3>
            <p className="text-gray-300 mb-4">
              Ask questions about any stock or market trend and get instant, data-driven answers from our AI assistant.
            </p>
            <div className="mt-4 bg-gray-900/60 rounded-lg p-4 border border-gray-700/50 group-hover:border-green-500/20 transition-colors">
              <div className="flex items-start mb-3 gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="bg-gray-700/50 rounded-lg p-2.5 text-sm text-gray-300">
                  What's the outlook for tech stocks in the next quarter?
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="bg-gray-700/50 rounded-lg p-2.5 text-sm text-gray-300">
                  Based on current earnings reports and market trends, tech stocks are expected to show moderate growth of 5-7% in the next quarter, with cloud computing and AI sectors outperforming.
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/80 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 hover:border-indigo-500/20 transition-all duration-300 group">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Portfolio Analytics</h3>
            <p className="text-gray-300 mb-4">
              Comprehensive portfolio analysis with risk assessment, diversification metrics, and performance tracking.
            </p>
            <div className="mt-4 bg-gray-900/60 rounded-lg p-4 border border-gray-700/50 group-hover:border-indigo-500/20 transition-colors">
              <div className="flex mb-4">
                <div className="w-1/2 h-32 pr-2">
                  <div className="text-xs text-gray-400 mb-1">Sector Allocation</div>
                  <div className="h-24 rounded-lg bg-gray-800/80 p-2 flex items-end">
                    <div className="w-1/5 h-[60%] bg-blue-500 rounded-sm mr-1 group-hover:bg-blue-400 transition-colors"></div>
                    <div className="w-1/5 h-[80%] bg-purple-500 rounded-sm mr-1 group-hover:bg-purple-400 transition-colors"></div>
                    <div className="w-1/5 h-[40%] bg-green-500 rounded-sm mr-1 group-hover:bg-green-400 transition-colors"></div>
                    <div className="w-1/5 h-[70%] bg-yellow-500 rounded-sm mr-1 group-hover:bg-yellow-400 transition-colors"></div>
                    <div className="w-1/5 h-[50%] bg-red-500 rounded-sm group-hover:bg-red-400 transition-colors"></div>
                  </div>
                </div>
                <div className="w-1/2 h-32 pl-2">
                  <div className="text-xs text-gray-400 mb-1">Risk Analysis</div>
                  <div className="h-24 rounded-lg bg-gray-800/80 p-2 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-300">Volatility</span>
                      <div className="w-24 bg-gray-700 h-1.5 rounded-full">
                        <div className="bg-yellow-500 h-1.5 rounded-full group-hover:bg-yellow-400 transition-colors" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-300">Beta</span>
                      <div className="w-24 bg-gray-700 h-1.5 rounded-full">
                        <div className="bg-blue-500 h-1.5 rounded-full group-hover:bg-blue-400 transition-colors" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-300">Sharpe</span>
                      <div className="w-24 bg-gray-700 h-1.5 rounded-full">
                        <div className="bg-green-500 h-1.5 rounded-full group-hover:bg-green-400 transition-colors" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContainerScroll>

      {/* 3D Pin Features Section - Enhanced with refined spacing and shadows */}
      <div className="max-w-7xl mx-auto px-6 py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-bold text-white mb-16 text-center"
        >
          Explore Our Platform
        </motion.h2>
        <SimpleErrorBoundary fallback={
          <div className="p-6 bg-gray-800 rounded-xl text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Feature Temporarily Unavailable</h3>
            <p className="text-gray-400">We're working on improving this section. Please check back soon.</p>
          </div>
        }>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 place-items-center min-h-[320px]">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
            >
              <div 
                className="relative w-56 h-56 cursor-pointer group/platform"
                onClick={() => navigate(isAuthenticated ? "/stock-monitor" : "/signup")}
                style={{ zIndex: '1' }}
              >
                <div className="absolute inset-0 rounded-xl bg-[#0a0a14] border border-gray-800 shadow-xl transition-all duration-300 group-hover/platform:border-blue-500/30 overflow-hidden">
                  <div className="flex flex-col items-center justify-center h-full w-full p-4">
                    <BarChart className="w-12 h-12 text-blue-400 mb-4 group-hover/platform:scale-110 transition-transform" />
                    <p className="text-white text-center font-medium">Real-time stock monitoring with advanced charts</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div 
                className="relative w-56 h-56 cursor-pointer group/platform"
                onClick={() => navigate(isAuthenticated ? "/market-analysis" : "/signup")}
                style={{ zIndex: '1' }}
              >
                <div className="absolute inset-0 rounded-xl bg-[#0a0a14] border border-gray-800 shadow-xl transition-all duration-300 group-hover/platform:border-indigo-500/30 overflow-hidden">
                  <div className="flex flex-col items-center justify-center h-full w-full p-4">
                    <PieChart className="w-12 h-12 text-indigo-400 mb-4 group-hover/platform:scale-110 transition-transform" />
                    <p className="text-white text-center font-medium">Comprehensive market analysis and insights</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div 
                className="relative w-56 h-56 cursor-pointer group/platform"
                onClick={() => navigate(isAuthenticated ? "/research-chat" : "/signup")}
                style={{ zIndex: '1' }}
              >
                <div className="absolute inset-0 rounded-xl bg-[#0a0a14] border border-gray-800 shadow-xl transition-all duration-300 group-hover/platform:border-purple-500/30 overflow-hidden">
                  <div className="flex flex-col items-center justify-center h-full w-full p-4">
                    <Layers className="w-12 h-12 text-purple-400 mb-4 group-hover/platform:scale-110 transition-transform" />
                    <p className="text-white text-center font-medium">AI-powered research and trading recommendations</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-2xl font-bold text-white mt-32 mb-16 text-center"
          >
            Market Resources
          </motion.h3>
          <SimpleErrorBoundary fallback={
            <div className="p-6 bg-gray-800 rounded-xl text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Market Resources Temporarily Unavailable</h3>
              <p className="text-gray-400">We're working on improving this section. Please check back soon.</p>
            </div>
          }>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 place-items-center min-h-[320px]">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8 }}
              >
                <div 
                  className="relative w-56 h-56 cursor-pointer group/resource"
                  onClick={() => window.open('https://www.nyse.com/', '_blank')}
                  style={{ zIndex: '1' }}
                >
                  <div className="absolute inset-0 rounded-xl bg-[#0a0a14] border border-gray-800 shadow-xl transition-all duration-300 group-hover/resource:border-blue-500/30 overflow-hidden">
                    <div className="flex flex-col items-center justify-center h-full w-full p-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover/resource:scale-110 transition-transform">
                        <span className="text-blue-400 font-bold text-xl">NYSE</span>
                      </div>
                      <p className="text-white text-center font-medium">New York Stock Exchange official website</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <div 
                  className="relative w-56 h-56 cursor-pointer group/resource"
                  onClick={() => window.open('https://www.nasdaq.com/', '_blank')}
                  style={{ zIndex: '1' }}
                >
                  <div className="absolute inset-0 rounded-xl bg-[#0a0a14] border border-gray-800 shadow-xl transition-all duration-300 group-hover/resource:border-indigo-500/30 overflow-hidden">
                    <div className="flex flex-col items-center justify-center h-full w-full p-4">
                      <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover/resource:scale-110 transition-transform">
                        <span className="text-indigo-400 font-bold text-xl">NASDAQ</span>
                      </div>
                      <p className="text-white text-center font-medium">NASDAQ official website and market data</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <div 
                  className="relative w-56 h-56 cursor-pointer group/resource"
                  onClick={() => window.open('https://www.sec.gov/', '_blank')}
                  style={{ zIndex: '1' }}
                >
                  <div className="absolute inset-0 rounded-xl bg-[#0a0a14] border border-gray-800 shadow-xl transition-all duration-300 group-hover/resource:border-purple-500/30 overflow-hidden">
                    <div className="flex flex-col items-center justify-center h-full w-full p-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover/resource:scale-110 transition-transform">
                        <span className="text-purple-400 font-bold text-xl">SEC</span>
                      </div>
                      <p className="text-white text-center font-medium">Securities and Exchange Commission resources</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </SimpleErrorBoundary>
        </SimpleErrorBoundary>
      </div>

      {/* Premium Features Section - Enhanced */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
            <Star className="w-4 h-4 mr-1.5" /> Professional Tools
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Premium Features</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">Advanced tools designed specifically for professional traders and investors</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 group border border-gray-700/30 hover:border-blue-500/20 relative"
          >
            <GlowingEffect disabled={false} glow={true} blur={15} spread={40} variant="blue" />
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Real-Time Data</h3>
            <p className="text-gray-300">
              Access live market data, real-time quotes, and instant updates for informed trading decisions.
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0 translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 group border border-gray-700/30 hover:border-purple-500/20 relative"
          >
            <GlowingEffect disabled={false} glow={true} blur={15} spread={40} variant="blue" />
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">NYSE and NASDAQ Coverage</h3>
            <p className="text-gray-300">
              View stocks, ETFs, and market data in one unified platform.
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500/0 via-purple-500/40 to-purple-500/0 translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 group border border-gray-700/30 hover:border-green-500/20 relative"
          >
            <GlowingEffect disabled={false} glow={true} blur={15} spread={40} variant="blue" />
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Advanced Security</h3>
            <p className="text-gray-300">
              Enterprise-grade security with data encryption and privacy protection.
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-500/0 via-green-500/40 to-green-500/0 translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          </motion.div>
        </div>
      </div>

      {/* Premium AI Feature Highlight with Evervault Card - Enhanced with better spacing and animations */}
      <div className="max-w-7xl mx-auto px-6 py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="p-6"
          >
            <div className="inline-block mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Star className="w-4 h-4 mr-1.5" /> Premium Feature
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
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
                <motion.li 
                  key={index} 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5 mr-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </motion.li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
              <Link
                to={isAuthenticated ? "/stock-recommendations" : "/signup"}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 font-medium group"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Get Stock Recommendations
                <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                to={isAuthenticated ? "/research-chat" : "/signup"}
                className="inline-flex items-center px-6 py-3 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 font-medium backdrop-blur-sm group"
              >
                Try AI Assistant
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center items-center p-6"
          >
            <div className="w-full max-w-md aspect-square">
              <EvervaultCard text="AI" className="w-full h-full" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Links - Enhanced */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Quick Links</h2>
          <div className="flex space-x-3">
            <a 
              href="https://x.com/TennantTicker" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-gray-800/80 rounded-lg text-blue-400 hover:bg-gray-700 transition-colors flex items-center gap-2 relative backdrop-blur-sm"
              title="Follow us on X (Twitter)"
            >
              <GlowingEffect disabled={false} glow={true} blur={8} spread={30} variant="blue" />
              <Twitter className="w-5 h-5" />
              <span className="hidden sm:inline text-white">Follow</span>
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to={isAuthenticated ? "/stock-monitor" : "/signup"}
            className="p-4 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg hover:bg-gray-800/70 hover:border-blue-500/20 transition-all duration-300 flex items-center gap-2 group relative"
          >
            <GlowingEffect disabled={false} glow={true} blur={8} spread={30} variant="blue" />
            <LineChart className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-white">Stock Monitor</span>
            <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to={isAuthenticated ? "/investor-insight" : "/signup"}
            className="p-4 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg hover:bg-gray-800/70 hover:border-purple-500/20 transition-all duration-300 flex items-center gap-2 group relative"
          >
            <GlowingEffect disabled={false} glow={true} blur={8} spread={30} variant="blue" />
            <BarChart3 className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-white">Investor Insight</span>
            <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to={isAuthenticated ? "/research-chat" : "/signup"}
            className="p-4 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg hover:bg-gray-800/70 hover:border-green-500/20 transition-all duration-300 flex items-center gap-2 group relative"
          >
            <GlowingEffect disabled={false} glow={true} blur={8} spread={30} variant="blue" />
            <MessageSquareText className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
            <span className="text-white">Research Chat</span>
            <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}