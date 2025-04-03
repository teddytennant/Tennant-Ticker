import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, TrendingUp, ExternalLink, BarChart3, LineChart, AlertTriangle, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Info, Briefcase, PieChart, DollarSign, Activity, ArrowUpDown, Calendar, Percent, Award, XCircle, RefreshCw, Users, XCircleIcon, X, Trash2, Edit3, Check, PlusCircle, TrendingDown } from 'lucide-react'; // Added TrendingDown
import { Stock } from '../types/index'; // Removed HistoricalDataPoint import
import { getDetailedStockDataAV, getCompetitorDataAV } from '../services/alphaVantageApi';
import toast from 'react-hot-toast';
import { ResponsiveContainer, AreaChart, Area, Tooltip as RechartsTooltip } from 'recharts'; // Added RechartsTooltip

// Define the structure for the theme prop
interface Theme {
  background: string;
  cardBackground: string;
  elementBackground: string;
  border: string;
  hoverBackground: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  positive: string;
  negative: string;
}

interface StockCardProps {
  stock: Stock;
  theme: Theme;
  onRemoveStock?: (symbol: string) => void;
  onUpdateHoldings?: (symbol: string, quantity: number, averagePrice?: number) => void;
}

export function StockCard({ stock, theme, onRemoveStock, onUpdateHoldings }: StockCardProps) {
  const navigate = useNavigate();
  const [showRsiInfo, setShowRsiInfo] = useState<boolean>(false);
  const [miniChartData, setMiniChartData] = useState<Array<{date: string, value: number}>>([]);
  const [isEditingHoldings, setIsEditingHoldings] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(stock.holdings?.quantity || 0);
  const [averagePrice, setAveragePrice] = useState<number | undefined>(stock.holdings?.averagePrice);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  // Focus on quantity input when editing starts
  useEffect(() => {
    if (isEditingHoldings && quantityInputRef.current) {
      quantityInputRef.current.focus();
    }
  }, [isEditingHoldings]);

  useEffect(() => {
    // Generate sample chart data if stock has price history
    if (stock.historicalData && stock.historicalData.length > 0) {
      // Use inline type for 'point'
      setMiniChartData(stock.historicalData.map((point: { date: string; close: number }) => ({ 
        date: point.date,
        value: point.close
      })));
    } else {
      // Generate dummy data for demonstration if no price history
      const dummyData = [];
      const trend = stock.price.change >= 0 ? 1 : -1;
      const baseValue = stock.price.current;
      const volatility = baseValue * 0.02; // 2% volatility
      
      for (let i = 0; i < 20; i++) {
        const randomChange = (Math.random() - 0.5) * volatility;
        const trendChange = (i / 20) * trend * (baseValue * 0.05); // 5% trend over period
        dummyData.push({
          date: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000).toISOString(),
          value: baseValue + randomChange + trendChange
        });
      }
      
      setMiniChartData(dummyData);
    }
  }, [stock]);

  const handleUpdateHoldings = () => {
    if (onUpdateHoldings) {
      onUpdateHoldings(stock.symbol, quantity, averagePrice);
    }
    setIsEditingHoldings(false);
    toast.success(`Updated ${stock.symbol} holdings`);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatLargeNumber = (num: string | number) => {
    if (typeof num === 'string') num = parseInt(num, 10);
    if (!num) return 'N/A';
    
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num.toLocaleString();
  };

  const formatPercent = (num: number | null) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toFixed(2) + '%';
  };

  // Determine price change color using theme
  const getPriceChangeColor = (): string => {
    if (!stock.price || stock.price.change === undefined) return theme.textSecondary;
    return stock.price.change >= 0 ? theme.positive : theme.negative;
  };

  // Determine price change icon (no change needed here)
  const getPriceChangeIcon = () => {
    if (!stock.price || stock.price.change === undefined) return null;
    return stock.price.change > 0 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  // Get RSI indicator color using theme
  const getRsiColor = (): string => {
    if (stock.technicalIndicators?.rsi) {
      const rsi = stock.technicalIndicators.rsi;
      if (rsi > 70) return theme.negative; // Overbought = negative color indication
      if (rsi < 30) return theme.positive; // Oversold = positive color indication
      return theme.textSecondary; // Neutral
    }
    return theme.textSecondary;
  };

  // Get RSI interpretation (no change needed here)
  const getRsiInterpretation = () => {
    let rsi = null;
    
    if (stock.technicalIndicators?.rsi) {
      rsi = stock.technicalIndicators.rsi;
    }
    
    if (rsi === null) return 'No RSI data available';
    
    if (rsi > 70) return 'Overbought - May indicate a potential sell signal or correction';
    if (rsi > 60 && rsi <= 70) return 'Approaching overbought territory - Momentum is strong but caution advised';
    if (rsi >= 40 && rsi <= 60) return 'Neutral - Price is showing neither overbought nor oversold conditions';
    if (rsi >= 30 && rsi < 40) return 'Approaching oversold territory - May be undervalued';
    if (rsi < 30) return 'Oversold - May indicate a potential buy signal or reversal';
    return 'Neutral';
  };

  // Handle card click
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/stock/${stock.symbol}`);
  };

  // Navigate to details page
  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/stock/${stock.symbol}`);
  };

  // Handle remove stock
  const handleRemoveStock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveStock) {
      onRemoveStock(stock.symbol);
    }
  };

  // Handle RSI info click
  const handleRsiClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRsiInfo(true);
  };

  // Handle close RSI info
  const handleCloseRsiInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRsiInfo(false);
  };

  // Calculate total value of holdings
  const calculateHoldingsValue = () => {
    if (!stock.holdings || !stock.holdings.quantity) return 0;
    return stock.holdings.quantity * stock.price.current;
  };

  // Calculate profit/loss if average price is available
  const calculateProfitLoss = () => {
    if (!stock.holdings || !stock.holdings.quantity || !stock.holdings.averagePrice) return null;
    const totalCost = stock.holdings.quantity * stock.holdings.averagePrice;
    const currentValue = stock.holdings.quantity * stock.price.current;
    return currentValue - totalCost;
  };

  const getProfitLossPercentage = () => {
    if (!stock.holdings?.averagePrice) return null;
    const percentChange = ((stock.price.current - stock.holdings.averagePrice) / stock.holdings.averagePrice) * 100;
    return percentChange;
  };

  // Render RSI info modal
  const renderRsiInfoModal = () => {
    if (!showRsiInfo) return null;

    // Get RSI value from stock data
    const rsiValue = stock.technicalIndicators?.rsi || null;
    const rsiColor = getRsiColor(); // Get color based on theme

    return (
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" // Darker backdrop
        onClick={handleCloseRsiInfo}
      >
        <div 
          className="rounded-lg shadow-xl max-w-lg w-full p-6 border" // Increased padding
          style={{ backgroundColor: theme.cardBackground, borderColor: theme.border }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          <div className="flex justify-between items-center mb-5"> {/* Increased margin */}
            <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>Relative Strength Index (RSI)</h3>
            <button 
              className="p-1 rounded-full transition-colors"
              style={{ color: theme.textSecondary }}
              onClick={handleCloseRsiInfo}
              aria-label="Close RSI info"
            >
              <X size={22} /> {/* Slightly larger icon */}
            </button>
          </div>
          
          <div className="space-y-5"> {/* Increased spacing */}
            <div className="p-4 rounded-md" style={{ backgroundColor: theme.elementBackground }}> {/* Use theme background */}
              <div className="flex items-center mb-2">
                <BarChart3 className="w-4 h-4 mr-2" style={{ color: theme.textSecondary }} />
                <h4 className="text-sm font-medium" style={{ color: theme.textPrimary }}>Current RSI Value</h4>
              </div>
              <div className="text-xl font-bold" style={{ color: rsiColor }}>
                {rsiValue ? rsiValue.toFixed(1) : 'N/A'}
              </div>
              <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>{getRsiInterpretation()}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>What is RSI?</h4>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                The Relative Strength Index (RSI) is a momentum oscillator that measures the speed and change of price movements. 
                It oscillates between 0 and 100 and is typically used to identify overbought or oversold conditions in a market.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded" style={{ backgroundColor: theme.elementBackground }}>
                <div className="text-xs mb-1" style={{ color: theme.textSecondary }}>Oversold</div>
                <div className="text-sm font-medium" style={{ color: theme.positive }}>Below 30</div>
              </div>
              <div className="p-3 rounded" style={{ backgroundColor: theme.elementBackground }}>
                <div className="text-xs mb-1" style={{ color: theme.textSecondary }}>Neutral</div>
                <div className="text-sm font-medium" style={{ color: theme.textSecondary }}>30-70</div>
              </div>
              <div className="p-3 rounded" style={{ backgroundColor: theme.elementBackground }}>
                <div className="text-xs mb-1" style={{ color: theme.textSecondary }}>Overbought</div>
                <div className="text-sm font-medium" style={{ color: theme.negative }}>Above 70</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>How to Use RSI</h4>
              <ul className="text-sm list-disc pl-5 space-y-1" style={{ color: theme.textSecondary }}>
                <li>RSI above 70 suggests overbought conditions and a potential sell signal</li>
                <li>RSI below 30 suggests oversold conditions and a potential buy signal</li>
                <li>Divergences between RSI and price may indicate potential reversals</li>
                <li>RSI can also show support/resistance levels not visible on the price chart</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end"> {/* Increased margin */}
            <button
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ backgroundColor: theme.elementBackground, color: theme.textSecondary }}
              onClick={handleCloseRsiInfo}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render the main card content
  return (
    <div 
      className="rounded-lg border overflow-hidden transition-shadow duration-200 hover:shadow-md" // Softer shadow on hover
      style={{ backgroundColor: theme.cardBackground, borderColor: theme.border }}
    >
      {/* Card Header */}
      <div className="p-4 flex flex-col cursor-pointer" onClick={handleCardClick}> {/* Added cursor-pointer */}
        <div className="flex justify-between items-start mb-3"> {/* Increased margin */}
          <div className="flex items-center gap-3"> {/* Increased gap */}
            {/* Optional: Add placeholder for logo if available */}
            {/* <img src={stock.logoUrl || '/placeholder-logo.png'} alt={`${stock.name} logo`} className="w-10 h-10 rounded-full" /> */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm" style={{ backgroundColor: theme.elementBackground, color: theme.textPrimary }}>
              {stock.symbol.substring(0, 2)}
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: theme.textPrimary }}>{stock.symbol}</h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>{stock.name}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="font-semibold text-base" style={{ color: theme.textPrimary }}>${formatNumber(stock.price.current)}</span> {/* Slightly larger price */}
            <div className="flex items-center text-sm" style={{ color: getPriceChangeColor() }}>
              {getPriceChangeIcon()}
              <span className="font-medium">{stock.price && stock.price.change !== undefined ? formatNumber(Math.abs(stock.price.change)) : 'N/A'}</span> {/* Use Math.abs */}
              <span className="ml-1 font-medium">({stock.price && stock.price.changePercent !== undefined ? formatPercent(stock.price.changePercent) : 'N/A'})</span>
            </div>
          </div>
        </div>
        
        {/* Mini Chart */}
        <div className="h-16 mt-2 mb-2"> {/* Adjusted margins */}
          {miniChartData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={miniChartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradientColor-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop 
                      offset="5%" 
                      stopColor={stock.price.change >= 0 ? theme.positive : theme.negative} 
                      stopOpacity={0.4} // Reduced opacity
                    />
                    <stop 
                      offset="95%" 
                      stopColor={stock.price.change >= 0 ? theme.positive : theme.negative} 
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <RechartsTooltip 
                  contentStyle={{ display: 'none' }} // Hide default tooltip if not needed
                  cursor={{ stroke: theme.accent, strokeWidth: 1, strokeDasharray: '3 3' }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={stock.price.change >= 0 ? theme.positive : theme.negative} 
                  fillOpacity={1}
                  fill={`url(#gradientColor-${stock.symbol})`}
                  strokeWidth={1.5}
                  dot={false} // Hide dots
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-3 text-xs" style={{ color: theme.textSecondary }}> {/* Adjusted gap, size, color */}
          <div className="flex items-center gap-1.5"> {/* Adjusted gap */}
            <Activity className="w-3.5 h-3.5" />
            <span>Vol: {formatLargeNumber(stock.metrics?.avgVolume || 0)}</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end"> {/* Adjusted gap */}
            <DollarSign className="w-3.5 h-3.5" />
            <span>Mkt Cap: {formatLargeNumber(stock.metrics?.marketCap || 0)}</span>
          </div>
          {/* Optional: Add RSI here */}
          {stock.technicalIndicators?.rsi !== undefined && (
             <div 
               className="flex items-center gap-1.5 cursor-pointer" 
               onClick={handleRsiClick}
                title="Click for RSI info"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                {/* Add null check before calling toFixed */}
                <span style={{ color: getRsiColor() }}>RSI: {stock.technicalIndicators.rsi !== null ? stock.technicalIndicators.rsi.toFixed(1) : 'N/A'}</span>
              </div>
           )}
         </div>
        
        {/* Action Buttons - Removed, actions are now in holdings section */}
        {/* <div className="flex justify-between mt-4 pt-3 border-t" style={{ borderColor: theme.border }}> ... </div> */}
      </div>
      
      {/* Holdings Section - Refined */}
      <div className="px-4 py-3 border-t" style={{ backgroundColor: theme.elementBackground, borderColor: theme.border }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" style={{ color: theme.textSecondary }} />
            <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>Your Holdings</span>
          </div>
          
          {isEditingHoldings ? (
            <div className="flex gap-2">
              <button
                onClick={handleUpdateHoldings}
                className="p-1.5 rounded-full transition-colors" 
                style={{ backgroundColor: theme.cardBackground, color: theme.positive }}
                title="Save holdings"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsEditingHoldings(false);
                  setQuantity(stock.holdings?.quantity || 0);
                  setAveragePrice(stock.holdings?.averagePrice);
                }}
                className="p-1.5 rounded-full transition-colors"
                style={{ backgroundColor: theme.cardBackground, color: theme.textSecondary }}
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {onRemoveStock && (
                 <button 
                   className="p-1.5 rounded-full transition-colors"
                   style={{ backgroundColor: theme.cardBackground, color: theme.negative }}
                   onClick={handleRemoveStock}
                   title="Remove from watchlist"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
              )}
              <button
                onClick={() => setIsEditingHoldings(true)}
                className="p-1.5 rounded-full transition-colors"
                style={{ backgroundColor: theme.cardBackground, color: theme.accent }}
                title={stock.holdings?.quantity ? "Edit holdings" : "Add holdings"}
              >
                {stock.holdings?.quantity ? (
                  <Edit3 className="w-4 h-4" />
                ) : (
                  <PlusCircle className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
        
        {isEditingHoldings ? (
          <div className="mt-3 space-y-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: theme.textSecondary }}>Quantity</label>
              <input
                ref={quantityInputRef}
                type="number"
                min="0"
                step="any" // Allow decimals if needed
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                className="w-full p-2 border rounded text-sm"
                style={{ 
                  backgroundColor: theme.background, // Use main background for input
                  borderColor: theme.border, 
                  color: theme.textPrimary 
                }}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: theme.textSecondary }}>Average Purchase Price (Optional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={averagePrice || ''}
                onChange={(e) => {
                  const value = e.target.value !== '' ? Number(e.target.value) : undefined;
                  setAveragePrice(value);
                }}
                className="w-full p-2 border rounded text-sm"
                style={{ 
                  backgroundColor: theme.background, // Use main background for input
                  borderColor: theme.border, 
                  color: theme.textPrimary 
                }}
                placeholder="0.00"
              />
            </div>
          </div>
        ) : (
          <div className="mt-2">
            {stock.holdings && stock.holdings.quantity > 0 ? (
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs" style={{ color: theme.textSecondary }}>Shares Owned</div>
                    <div className="font-medium" style={{ color: theme.textPrimary }}>{stock.holdings.quantity.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: theme.textSecondary }}>Current Value</div>
                    <div className="font-medium" style={{ color: theme.textPrimary }}>${formatNumber(calculateHoldingsValue())}</div>
                  </div>
                </div>
                
                {stock.holdings.averagePrice && (
                  <div className="grid grid-cols-2 gap-4 pt-2 mt-2 border-t" style={{ borderColor: theme.border }}>
                    <div>
                      <div className="text-xs" style={{ color: theme.textSecondary }}>Avg. Price</div>
                      <div className="font-medium" style={{ color: theme.textPrimary }}>${formatNumber(stock.holdings.averagePrice)}</div>
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: theme.textSecondary }}>Profit/Loss</div>
                      {calculateProfitLoss() !== null && (
                        <div 
                          className="font-medium flex items-center gap-1" 
                          style={{ color: calculateProfitLoss()! >= 0 ? theme.positive : theme.negative }}
                        >
                          <span>${formatNumber(Math.abs(calculateProfitLoss()!))}</span>
                          <span className="text-xs">({getProfitLossPercentage()!.toFixed(1)}%)</span>
                          {calculateProfitLoss()! >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm py-1" style={{ color: theme.textSecondary }}>
                No holdings added. Click <Edit3 className="w-3 h-3 inline mb-0.5" style={{ color: theme.accent }} /> to add shares.
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* RSI information modal */}
      {renderRsiInfoModal()}
    </div>
  );
}
