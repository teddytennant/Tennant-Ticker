import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, TrendingUp, BarChart3, LineChart, Activity, Info, Loader2 } from 'lucide-react';
import { getStockQuote, getCompanyOverview, getHistoricalData } from '../services/stockApi';
import { getStockNews } from '../services/newsApi';
import { getStockNewsSummary } from '../services/researchApi';
import { getTechnicalIndicatorsAV } from '../services/alphaVantageApi';
import { NewsItem, StockQuote } from '../types';
import toast from 'react-hot-toast';
import { AppDock } from '../components/AppDock';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  ReferenceLine,
  ComposedChart,
  Bar,
  Scatter,
  Cell
} from 'recharts';

interface HistoricalDataPoint {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
}

interface TechnicalIndicator {
  rsi: number | null;
  macd: number | null;
  sma50: number | null;
  sma200: number | null;
}

interface StockData {
  quote: StockQuote | null;
  news: NewsItem[];
  newsSummary: string;
  overview: {
    marketCap: string;
    peRatio: number | null;
    avgVolume: number;
  } | null;
  historicalData: HistoricalDataPoint[];
  technicalIndicators: TechnicalIndicator | null;
}

export function StockDetailPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const [data, setData] = useState<StockData>({
    quote: null,
    news: [],
    newsSummary: '',
    overview: null,
    historicalData: [],
    technicalIndicators: null
  });
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [newsError, setNewsError] = useState(false);
  const [timeframe, setTimeframe] = useState<'1d' | '1w' | '1m' | '3m' | '1y'>('1m');
  const [showRsiInfo, setShowRsiInfo] = useState(false);
  const [chartType, setChartType] = useState<'area' | 'line' | 'candlestick'>('area');

  const loadData = async () => {
    if (!symbol) return;
    setLoading(true);
    setSummaryLoading(true);
    setNewsError(false);
    try {
      console.log(`Loading data for ${symbol}...`);
      
      // Get quote, overview, historical data, and technical indicators
      let quote, overview, historicalData, technicalIndicators;
      try {
        [quote, overview, historicalData, technicalIndicators] = await Promise.all([
          getStockQuote(symbol),
          getCompanyOverview(symbol),
          getHistoricalData(symbol, timeframe),
          getTechnicalIndicatorsAV(symbol)
        ]);
        console.log(`Got quote, overview, historical data, and technical indicators for ${symbol}`);
      } catch (error) {
        console.error(`Error fetching stock data for ${symbol}:`, error);
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
        // Set news error flag instead of showing a toast
        setNewsError(true);
        // Continue with empty news rather than failing the whole page
        news = [];
      }

      setData(prevData => ({
        ...prevData,
        quote, 
        news, 
        overview,
        historicalData,
        technicalIndicators
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
  }, [symbol, timeframe]);

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

  const formatSentiment = (sentiment: string): string => {
    return sentiment.charAt(0).toUpperCase() + sentiment.slice(1).replace(/_/g, ' ');
  };

  const getSentimentClass = (sentiment: string): string => {
    switch (sentiment.toLowerCase()) {
      case 'bullish':
      case 'somewhat_bullish':
        return 'bg-green-900/50 text-green-300';
      case 'bearish':
      case 'somewhat_bearish':
        return 'bg-red-900/50 text-red-300';
      case 'neutral':
        return 'bg-gray-700/50 text-gray-300';
      default:
        return 'bg-gray-700/50 text-gray-300';
    }
  };

  // Format date for chart tooltip
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    
    // Format based on timeframe
    if (timeframe === '1d') {
      // For 1-day view, show time in HH:MM format
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === '1w') {
      // For 1-week view, show day of week and date (e.g., "Mon 01/15")
      return date.toLocaleDateString([], { 
        weekday: 'short', 
        month: 'numeric', 
        day: 'numeric' 
      });
    } else if (timeframe === '1m') {
      // For 1-month view, show date (e.g., "Jan 15")
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      });
    } else {
      // For 3-month and 1-year views, show month and year (e.g., "Jan 2023")
      return date.toLocaleDateString([], { 
        month: 'short', 
        year: 'numeric' 
      });
    }
  };

  // Get RSI color based on value
  const getRsiColor = (rsi: number | null) => {
    if (rsi === null) return 'text-gray-400';
    if (rsi > 70) return 'text-red-400';
    if (rsi < 30) return 'text-green-400';
    return 'text-blue-400';
  };

  // Get RSI interpretation
  const getRsiInterpretation = (rsi: number | null) => {
    if (rsi === null) return 'No RSI data available';
    
    if (rsi > 70) return 'Overbought - May indicate a potential sell signal or correction';
    if (rsi > 60 && rsi <= 70) return 'Approaching overbought territory - Momentum is strong but caution advised';
    if (rsi >= 40 && rsi <= 60) return 'Neutral - Price is showing neither overbought nor oversold conditions';
    if (rsi >= 30 && rsi < 40) return 'Approaching oversold territory - May be undervalued';
    if (rsi < 30) return 'Oversold - May indicate a potential buy signal or reversal';
    return 'Neutral';
  };

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: '1d' | '1w' | '1m' | '3m' | '1y') => {
    setTimeframe(newTimeframe);
  };

  // Toggle RSI info modal
  const toggleRsiInfo = () => {
    setShowRsiInfo(!showRsiInfo);
  };

  // Custom candlestick renderer
  const renderCandlestick = (props: any) => {
    const { x, y, width, height, index } = props;
    
    if (!data.historicalData[index]) {
      return null;
    }
    
    const dataPoint = data.historicalData[index];
    const open = dataPoint.open;
    const close = dataPoint.close;
    const low = dataPoint.low;
    const high = dataPoint.high;
    
    // Skip if we don't have all the required data
    if (open === null || close === null || low === null || high === null) {
      return null;
    }
    
    // Determine if it's a bullish (price went up) or bearish (price went down) candle
    const isBullish = close > open;
    
    // Colors for bullish/bearish candles
    const bullishColor = '#22c55e'; // Green
    const bearishColor = '#ef4444'; // Red
    
    const fill = isBullish ? bullishColor : bearishColor;
    const stroke = fill;
    
    // Calculate the y coordinates for the candle parts
    // The y scale is inverted in charts (higher values are lower on the screen)
    const openY = props.yAxis.scale(open);
    const closeY = props.yAxis.scale(close);
    const highY = props.yAxis.scale(high);
    const lowY = props.yAxis.scale(low);
    
    // Calculate the candle body
    const candleY = Math.min(openY, closeY);
    const candleHeight = Math.max(1, Math.abs(closeY - openY)); // Ensure minimum height
    
    // Calculate the center of the candle for the wicks
    const centerX = x + width / 2;
    
    return (
      <g>
        {/* Top wick */}
        <line
          x1={centerX}
          y1={highY}
          x2={centerX}
          y2={Math.min(openY, closeY)}
          stroke={stroke}
          strokeWidth={1}
        />
        
        {/* Bottom wick */}
        <line
          x1={centerX}
          y1={Math.max(openY, closeY)}
          x2={centerX}
          y2={lowY}
          stroke={stroke}
          strokeWidth={1}
        />
        
        {/* Candle body */}
        <rect
          x={x}
          y={candleY}
          width={width}
          height={candleHeight}
          fill={fill}
          stroke={stroke}
          strokeWidth={1}
        />
      </g>
    );
  };

  // Enhanced tooltip for candlestick chart
  const CustomCandlestickTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    // Find the data point that matches the label
    const dataPoint = data.historicalData.find(item => item.date === label);
    if (!dataPoint) return null;
    
    // Format the date for display
    const displayDate = formatDate(dataPoint.date);
    
    // Determine if it's a bullish or bearish candle
    const isBullish = (dataPoint.close || 0) > (dataPoint.open || 0);
    const priceColor = isBullish ? 'text-green-400' : 'text-red-400';
    
    return (
      <div className="bg-gray-800 border border-gray-600 p-3 rounded shadow-lg text-sm">
        <p className="text-gray-300 mb-2 font-medium">{displayDate}</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Open:</span>
            <span className="text-white font-medium">
              ${dataPoint.open !== null ? dataPoint.open.toFixed(2) : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">High:</span>
            <span className="text-white font-medium">
              ${dataPoint.high !== null ? dataPoint.high.toFixed(2) : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Low:</span>
            <span className="text-white font-medium">
              ${dataPoint.low !== null ? dataPoint.low.toFixed(2) : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Close:</span>
            <span className={`font-medium ${priceColor}`}>
              ${dataPoint.close !== null ? dataPoint.close.toFixed(2) : 'N/A'}
            </span>
          </div>
          {dataPoint.volume > 0 && (
            <div className="flex items-center justify-between col-span-2 mt-1 pt-1 border-t border-gray-700">
              <span className="text-gray-400">Volume:</span>
              <span className="text-white font-medium">
                {dataPoint.volume.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Custom tooltip for area and line charts
  const CustomPriceTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const price = payload[0].value;
    const dataPoint = data.historicalData.find(item => item.date === label);
    
    if (!dataPoint) return null;
    
    return (
      <div className="bg-gray-800 border border-gray-600 p-3 rounded shadow-lg">
        <p className="text-gray-300 mb-1">{formatDate(label)}</p>
        <p className="text-white font-medium">${price.toFixed(2)}</p>
        {dataPoint.volume > 0 && (
          <p className="text-gray-400 text-xs mt-1">
            Volume: {dataPoint.volume.toLocaleString()}
          </p>
        )}
      </div>
    );
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
                  {formatNumber(Math.abs(data.quote.change))} ({Math.abs(data.quote.changePercent).toFixed(2)}%)
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

          {/* Price Chart Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white mb-2 sm:mb-0">Price Chart</h2>
              <div className="flex flex-wrap gap-2">
                <div className="flex bg-gray-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setChartType('area')}
                    className={`px-3 py-1.5 text-sm ${chartType === 'area' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                  >
                    Area
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-3 py-1.5 text-sm ${chartType === 'line' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => setChartType('candlestick')}
                    className={`px-3 py-1.5 text-sm ${chartType === 'candlestick' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                  >
                    Candlestick
                  </button>
                </div>
                <div className="flex bg-gray-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setTimeframe('1d')}
                    className={`px-3 py-1.5 text-sm ${timeframe === '1d' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                  >
                    1D
                  </button>
                  <button
                    onClick={() => setTimeframe('1w')}
                    className={`px-3 py-1.5 text-sm ${timeframe === '1w' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                  >
                    1W
                  </button>
                  <button
                    onClick={() => setTimeframe('1m')}
                    className={`px-3 py-1.5 text-sm ${timeframe === '1m' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                  >
                    1M
                  </button>
                  <button
                    onClick={() => setTimeframe('3m')}
                    className={`px-3 py-1.5 text-sm ${timeframe === '3m' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                  >
                    3M
                  </button>
                  <button
                    onClick={() => setTimeframe('1y')}
                    className={`px-3 py-1.5 text-sm ${timeframe === '1y' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                  >
                    1Y
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg border border-gray-600 p-4">
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : data.historicalData.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  No historical data available for {symbol}
                </div>
              ) : (
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'area' ? (
                      <AreaChart
                        data={data.historicalData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                          stroke="#9ca3af"
                          tick={{ fill: '#9ca3af' }}
                          tickLine={{ stroke: '#4b5563' }}
                        />
                        <YAxis 
                          domain={['auto', 'auto']}
                          stroke="#9ca3af"
                          tick={{ fill: '#9ca3af' }}
                          tickLine={{ stroke: '#4b5563' }}
                          tickFormatter={(value) => `$${value.toFixed(2)}`}
                        />
                        <Tooltip 
                          content={<CustomPriceTooltip />}
                          isAnimationActive={false}
                          cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '3 3' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey={data.historicalData[0]?.adjustedClose !== null ? "adjustedClose" : "close"} 
                          stroke="#3b82f6" 
                          fillOpacity={1}
                          fill="url(#colorPrice)" 
                          activeDot={{ r: 6 }}
                          name="Price"
                        />
                      </AreaChart>
                    ) : chartType === 'line' ? (
                      <RechartsLineChart
                        data={data.historicalData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                          stroke="#9ca3af"
                          tick={{ fill: '#9ca3af' }}
                          tickLine={{ stroke: '#4b5563' }}
                        />
                        <YAxis 
                          domain={['auto', 'auto']}
                          stroke="#9ca3af"
                          tick={{ fill: '#9ca3af' }}
                          tickLine={{ stroke: '#4b5563' }}
                          tickFormatter={(value) => `$${value.toFixed(2)}`}
                        />
                        <Tooltip 
                          content={<CustomPriceTooltip />}
                          isAnimationActive={false}
                          cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '3 3' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey={data.historicalData[0]?.adjustedClose !== null ? "adjustedClose" : "close"} 
                          stroke="#3b82f6" 
                          dot={false}
                          activeDot={{ r: 6 }}
                          name="Price"
                        />
                      </RechartsLineChart>
                    ) : (
                      <ComposedChart
                        data={data.historicalData}
                        margin={{ top: 20, right: 20, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                          stroke="#9ca3af"
                          tick={{ fill: '#9ca3af' }}
                          tickLine={{ stroke: '#4b5563' }}
                          height={40}
                        />
                        <YAxis 
                          domain={['auto', 'auto']}
                          stroke="#9ca3af"
                          tick={{ fill: '#9ca3af' }}
                          tickLine={{ stroke: '#4b5563' }}
                          tickFormatter={(value) => `$${value.toFixed(2)}`}
                          yAxisId="price"
                          width={65}
                        />
                        <YAxis 
                          orientation="right"
                          domain={['auto', 'auto']}
                          stroke="#9ca3af"
                          tick={{ fill: '#9ca3af' }}
                          tickLine={{ stroke: '#4b5563' }}
                          tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`}
                          yAxisId="volume"
                          width={50}
                        />
                        <Tooltip 
                          content={<CustomCandlestickTooltip />}
                          isAnimationActive={false}
                          cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '3 3' }}
                        />
                        <Legend 
                          payload={[
                            { value: 'Price', type: 'rect', color: '#3b82f6' },
                            { value: 'Volume', type: 'rect', color: '#6b7280' }
                          ]}
                          verticalAlign="top"
                          height={36}
                          wrapperStyle={{ paddingBottom: '10px' }}
                        />
                        <Bar 
                          dataKey="volume" 
                          yAxisId="volume"
                          fill="#6b7280"
                          opacity={0.3}
                          barSize={20}
                        />
                        <Scatter
                          data={data.historicalData}
                          yAxisId="price"
                          shape={renderCandlestick}
                          isAnimationActive={false}
                        />
                      </ComposedChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* RSI Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-white mr-2">RSI</h2>
                <button 
                  onClick={toggleRsiInfo}
                  className="text-gray-400 hover:text-gray-200"
                  title="What is RSI?"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg border border-gray-600 p-4">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : !data.technicalIndicators?.rsi ? (
                <div className="text-center py-8 text-gray-400">
                  No RSI data available for {symbol}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart3 className="w-5 h-5 text-blue-400 mr-2" />
                      <span className="text-gray-300">Current RSI Value</span>
                    </div>
                    <div className={`text-xl font-bold ${getRsiColor(data.technicalIndicators.rsi)}`}>
                      {data.technicalIndicators.rsi.toFixed(1)}
                    </div>
                  </div>
                  
                  <div className="h-8 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full w-full flex">
                      <div className="h-full bg-green-500/70" style={{ width: '30%' }}></div>
                      <div className="h-full bg-blue-500/70" style={{ width: '40%' }}></div>
                      <div className="h-full bg-red-500/70" style={{ width: '30%' }}></div>
                    </div>
                    <div 
                      className="h-6 w-2 bg-white rounded-full relative -mt-7"
                      style={{ 
                        marginLeft: `${Math.min(Math.max(data.technicalIndicators.rsi, 0), 100)}%`,
                        transform: 'translateX(-50%)'
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Oversold (0-30)</span>
                    <span>Neutral (30-70)</span>
                    <span>Overbought (70-100)</span>
                  </div>
                  
                  <div className="text-sm text-gray-300 mt-2">
                    <p>{getRsiInterpretation(data.technicalIndicators.rsi)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RSI Info Modal */}
          {showRsiInfo && (
            <div 
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
              onClick={toggleRsiInfo}
            >
              <div 
                className="bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-5 border border-gray-700"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-200">Relative Strength Index (RSI)</h3>
                  <button 
                    className="text-gray-400 hover:text-gray-200"
                    onClick={toggleRsiInfo}
                  >
                    <ArrowLeft size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">What is RSI?</h4>
                    <p className="text-sm text-gray-400">
                      The Relative Strength Index (RSI) is a momentum oscillator that measures the speed and change of price movements. 
                      It oscillates between 0 and 100 and is typically used to identify overbought or oversold conditions in a market.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-700/30 p-2 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Oversold</div>
                      <div className="text-sm font-medium text-green-400">Below 30</div>
                    </div>
                    <div className="bg-gray-700/30 p-2 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Neutral</div>
                      <div className="text-sm font-medium text-blue-400">30-70</div>
                    </div>
                    <div className="bg-gray-700/30 p-2 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Overbought</div>
                      <div className="text-sm font-medium text-red-400">Above 70</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">How to Use RSI</h4>
                    <ul className="text-sm text-gray-400 list-disc pl-5 space-y-1">
                      <li>RSI above 70 suggests overbought conditions and a potential sell signal</li>
                      <li>RSI below 30 suggests oversold conditions and a potential buy signal</li>
                      <li>Divergences between RSI and price may indicate potential reversals</li>
                      <li>RSI can also show support/resistance levels not visible on the price chart</li>
                    </ul>
                  </div>
                </div>
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

          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Latest News</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : newsError ? (
                <div className="bg-gray-700/30 rounded-lg border border-gray-600 p-4 text-gray-300">
                  Unable to load news for {symbol}. Please try again later.
                </div>
              ) : data.news.length === 0 ? (
                <div className="bg-gray-700/30 rounded-lg border border-gray-600 p-4 text-gray-300">
                  No recent news found for {symbol}.
                </div>
              ) : (
                data.news.map((item, index) => (
                  <a 
                    key={index} 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block bg-gray-700/30 rounded-lg border border-gray-600 p-4 hover:bg-gray-700/50 transition-colors"
                  >
                    <h3 className="text-white font-medium mb-2">{item.title}</h3>
                    <p className="text-gray-300 text-sm mb-2">{item.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>{item.source.name}</span>
                    </div>
                    {item.sentiment && (
                      <div className="mt-2 text-xs">
                        <span 
                          className={`px-2 py-1 rounded ${getSentimentClass(item.sentiment.label)}`}
                        >
                          {formatSentiment(item.sentiment.label)}
                        </span>
                      </div>
                    )}
                  </a>
                ))
              )}
            </div>
          </div>

          {/* Technical Analysis Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Technical Analysis</h2>
              <div className="flex items-center">
                <button
                  onClick={() => setShowRsiInfo(!showRsiInfo)}
                  className="text-gray-400 hover:text-white ml-2"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {showRsiInfo && (
              <div className="bg-gray-700 p-4 rounded-lg mb-4 text-sm text-gray-300">
                <p className="mb-2"><span className="font-medium text-white">RSI (Relative Strength Index)</span> measures the speed and change of price movements.</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>RSI above 70 typically indicates <span className="text-red-400">overbought</span> conditions.</li>
                  <li>RSI below 30 typically indicates <span className="text-green-400">oversold</span> conditions.</li>
                  <li>RSI between 30-70 indicates <span className="text-blue-400">neutral</span> market conditions.</li>
                </ul>
              </div>
            )}
            
            <div className="bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-700">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : data.technicalIndicators ? (
                <div className="space-y-4">
                  {/* RSI Indicator */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">RSI (14)</span>
                      <span 
                        className={`font-medium ${
                          data.technicalIndicators.rsi > 70 ? 'text-red-400' : 
                          data.technicalIndicators.rsi < 30 ? 'text-green-400' : 
                          'text-blue-400'
                        }`}
                      >
                        {data.technicalIndicators.rsi.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          data.technicalIndicators.rsi > 70 ? 'bg-red-500' : 
                          data.technicalIndicators.rsi < 30 ? 'bg-green-500' : 
                          'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, data.technicalIndicators.rsi)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Oversold</span>
                      <span>Neutral</span>
                      <span>Overbought</span>
                    </div>
                  </div>
                  
                  {/* MACD Indicator */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">MACD</span>
                      <span 
                        className={`font-medium ${
                          data.technicalIndicators.macd > 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {data.technicalIndicators.macd.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${data.technicalIndicators.macd > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ 
                          width: `${Math.min(100, Math.abs(data.technicalIndicators.macd) * 10)}%`,
                          marginLeft: data.technicalIndicators.macd < 0 ? 'auto' : '0'
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Bearish</span>
                      <span>Neutral</span>
                      <span>Bullish</span>
                    </div>
                  </div>
                  
                  {/* Moving Averages */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">MA (50/200)</span>
                      <span 
                        className={`font-medium ${
                          data.technicalIndicators.ma50 > data.technicalIndicators.ma200 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {data.technicalIndicators.ma50.toFixed(2)} / {data.technicalIndicators.ma200.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <span 
                        className={`px-2 py-1 rounded ${
                          data.technicalIndicators.ma50 > data.technicalIndicators.ma200 ? 
                          'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                        }`}
                      >
                        {data.technicalIndicators.ma50 > data.technicalIndicators.ma200 ? 'Golden Cross' : 'Death Cross'}
                      </span>
                      <span className="text-gray-400">
                        {data.technicalIndicators.ma50 > data.technicalIndicators.ma200 ? 
                          'Bullish signal: 50-day MA above 200-day MA' : 
                          'Bearish signal: 50-day MA below 200-day MA'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Overall Signal */}
                  <div className="mt-6 pt-4 border-t border-gray-700">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300 font-medium">Overall Signal</span>
                      <span 
                        className={`font-medium ${
                          data.technicalIndicators.signal === 'buy' ? 'text-green-400' : 
                          data.technicalIndicators.signal === 'sell' ? 'text-red-400' : 
                          'text-yellow-400'
                        }`}
                      >
                        {data.technicalIndicators.signal.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Based on RSI, MACD, and Moving Average indicators
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 text-gray-400">
                  No technical data available for {symbol}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* App Dock */}
      <AppDock />
    </div>
  );
}