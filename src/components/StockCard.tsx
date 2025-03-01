import { useNavigate } from 'react-router-dom';
import { Newspaper, TrendingUp, ExternalLink } from 'lucide-react';
import { Stock } from '../types';

interface StockCardProps {
  stock: Stock;
}

export function StockCard({ stock }: StockCardProps) {
  const navigate = useNavigate();
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

  return (
    <div
      onClick={() => navigate(`/stock/${stock.symbol}`)}
      className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-6 hover:bg-gray-800 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">{stock.symbol}</h2>
          <p className="text-sm sm:text-base text-gray-400 truncate max-w-[150px] sm:max-w-full">{stock.name}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xl sm:text-2xl font-bold text-white">${formatNumber(stock.price.current)}</span>
          <span className={`flex items-center text-sm sm:text-base ${
            stock.price.change >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            <TrendingUp className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${stock.price.change < 0 ? 'transform rotate-180' : ''}`} />
            {formatNumber(Math.abs(stock.price.change))} ({Math.abs(stock.price.changePercent)}%)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div className="bg-gray-900/50 p-2 sm:p-3 rounded-lg border border-gray-700/50">
          <div className="text-xs sm:text-sm text-gray-400">Market Cap</div>
          <div className="text-sm sm:font-semibold text-gray-200 truncate">${formatLargeNumber(stock.metrics.marketCap)}</div>
        </div>
        <div className="bg-gray-900/50 p-2 sm:p-3 rounded-lg border border-gray-700/50">
          <div className="text-xs sm:text-sm text-gray-400">P/E Ratio</div>
          <div className="text-sm sm:font-semibold text-gray-200 truncate">{stock.metrics.peRatio?.toFixed(2) || 'N/A'}</div>
        </div>
        <div className="bg-gray-900/50 p-2 sm:p-3 rounded-lg border border-gray-700/50 col-span-2">
          <div className="text-xs sm:text-sm text-gray-400">Avg Volume</div>
          <div className="text-sm sm:font-semibold text-gray-200 truncate">{formatLargeNumber(String(stock.metrics.avgVolume))}</div>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {stock.headlines.slice(0, 2).map((headline, index) => (
          <div key={index} className="flex items-start space-x-2 group/news hover:bg-gray-700/30 p-2 rounded-lg transition-colors">
            <Newspaper className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">{headline.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">{headline.source.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 sm:mt-4 flex justify-between items-center text-xs sm:text-sm">
        <span className="text-blue-400 flex items-center hover:text-blue-300 transition-colors">
          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          View Details
        </span>
        <span className="text-gray-500 truncate ml-2">
          {stock.headlines.length} articles
        </span>
      </div>
    </div>
  );
}