import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  BarChart2, 
  Target, 
  Star, 
  AlertTriangle, 
  ChevronUp, 
  Info, 
  RefreshCw, 
  Filter, 
  Home,
  ArrowRight,
  Briefcase,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getStockRecommendations } from '../services/researchApi';
import { AppDock } from '../components/AppDock';
import { EvervaultCard } from '../components/ui/evervault-card';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Define types for the form
type RiskTolerance = 'low' | 'medium' | 'high';
type InvestmentHorizon = 'short' | 'medium' | 'long';

// Sector options
const sectorOptions = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Consumer Cyclical',
  'Consumer Defensive',
  'Industrials',
  'Energy',
  'Utilities',
  'Real Estate',
  'Communication Services',
  'Basic Materials'
];

// Investment goal options
const goalOptions = [
  'Growth',
  'Income',
  'Value',
  'Capital Preservation',
  'Dividend',
  'ESG/Sustainable',
  'Aggressive Growth',
  'Balanced'
];

export function StockRecommendationsPage() {
  const { isAuthenticated } = useAuth();
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('medium');
  const [investmentHorizon, setInvestmentHorizon] = useState<InvestmentHorizon>('medium');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Function to handle sector selection
  const toggleSector = (sector: string) => {
    if (selectedSectors.includes(sector)) {
      setSelectedSectors(selectedSectors.filter(s => s !== sector));
    } else {
      setSelectedSectors([...selectedSectors, sector]);
    }
  };

  // Function to handle goal selection
  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  // Function to get recommendations
  const getRecommendations = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to get personalized stock recommendations');
      return;
    }

    setIsLoading(true);
    try {
      const result = await getStockRecommendations({
        riskTolerance,
        investmentHorizon,
        sectors: selectedSectors.length > 0 ? selectedSectors : undefined,
        goals: selectedGoals.length > 0 ? selectedGoals : undefined
      });
      setRecommendations(result);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast.error('Failed to get recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get initial recommendations on component mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getRecommendations();
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="mr-4 text-gray-400 hover:text-white transition-colors">
              <Home className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
              AI Stock Recommendations
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
              title={showFilters ? "Hide filters" : "Show filters"}
            >
              <Filter className="h-4 w-4" />
            </button>
            <Link to="/research-chat" className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors">
              <MessageCircle className="w-5 h-5 mr-2" />
              Ask Research Assistant
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Filters Panel */}
            <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden sticky top-24">
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Investment Profile</h2>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden p-2 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                    >
                      <ChevronUp className={`h-4 w-4 transform ${showFilters ? '' : 'rotate-180'}`} />
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Customize your preferences to get personalized stock recommendations powered by AI.
                  </p>
                  
                  {/* Risk Tolerance */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <AlertTriangle className="w-4 h-4 inline mr-2 text-yellow-500" />
                      Risk Tolerance
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['low', 'medium', 'high'] as RiskTolerance[]).map((risk) => (
                        <button
                          key={risk}
                          onClick={() => setRiskTolerance(risk)}
                          className={`py-2 px-3 rounded-md text-sm font-medium ${
                            riskTolerance === risk
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {risk.charAt(0).toUpperCase() + risk.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Investment Horizon */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Clock className="w-4 h-4 inline mr-2 text-blue-400" />
                      Investment Horizon
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['short', 'medium', 'long'] as InvestmentHorizon[]).map((horizon) => (
                        <button
                          key={horizon}
                          onClick={() => setInvestmentHorizon(horizon)}
                          className={`py-2 px-3 rounded-md text-sm font-medium ${
                            investmentHorizon === horizon
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {horizon.charAt(0).toUpperCase() + horizon.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Sectors */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <BarChart2 className="w-4 h-4 inline mr-2 text-purple-400" />
                      Preferred Sectors
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {sectorOptions.map((sector) => (
                        <button
                          key={sector}
                          onClick={() => toggleSector(sector)}
                          className={`py-2 px-3 rounded-md text-sm font-medium text-left ${
                            selectedSectors.includes(sector)
                              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-transparent'
                          }`}
                        >
                          {sector}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Investment Goals */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Target className="w-4 h-4 inline mr-2 text-green-400" />
                      Investment Goals
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {goalOptions.map((goal) => (
                        <button
                          key={goal}
                          onClick={() => toggleGoal(goal)}
                          className={`py-2 px-3 rounded-md text-sm font-medium text-left ${
                            selectedGoals.includes(goal)
                              ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-transparent'
                          }`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Get Recommendations Button */}
                  <button
                    onClick={getRecommendations}
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                      isLoading
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Get Recommendations
                      </>
                    )}
                  </button>
                </div>
                
                {/* AI Card */}
                <div className="p-6">
                  <div className="aspect-square w-full max-w-[240px] mx-auto">
                    <EvervaultCard text="AI" className="w-full h-full" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recommendations Panel */}
            <div className="lg:col-span-2">
              {!isAuthenticated ? (
                <div className="bg-gray-800 rounded-xl p-8 text-center">
                  <div className="bg-blue-500/10 p-4 rounded-full inline-block mb-4">
                    <Info className="w-8 h-8 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Sign In to Get Recommendations</h2>
                  <p className="text-gray-400 mb-6">
                    Create an account or sign in to receive personalized AI-powered stock recommendations based on your investment profile.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link
                      to="/signup"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign Up
                    </Link>
                    <Link
                      to="/login"
                      className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Log In
                    </Link>
                  </div>
                </div>
              ) : recommendations ? (
                <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-white">Your Stock Recommendations</h2>
                      {lastUpdated && (
                        <p className="text-xs text-gray-400 mt-1">
                          Last updated: {lastUpdated.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={getRecommendations}
                      disabled={isLoading}
                      className={`p-2 rounded-md ${
                        isLoading
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                      }`}
                      title="Refresh recommendations"
                    >
                      <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown components={{
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold text-blue-300 mt-4 mb-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold text-blue-300 mt-3 mb-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-md font-bold text-blue-300 mt-2 mb-1" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-blue-200" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 my-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />,
                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-300 my-2" {...props} />,
                        code: ({inline, className, children, ...props}: any) => {
                          return inline ? 
                            <code className={`bg-gray-700 px-1 py-0.5 rounded text-sm ${className || ''}`} {...props}>{children}</code> : 
                            <code className={`block bg-gray-700 p-2 rounded text-sm overflow-x-auto my-2 ${className || ''}`} {...props}>{children}</code>
                        },
                        hr: ({node, ...props}) => <hr className="border-gray-600 my-4" {...props} />,
                      }}>
                        {recommendations}
                      </ReactMarkdown>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="p-6 bg-gray-800/50 border-t border-gray-700">
                    <div className="flex flex-wrap gap-4">
                      <Link
                        to="/stock-monitor"
                        className="inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <BarChart2 className="w-4 h-4 mr-2" />
                        View Stock Monitor
                      </Link>
                      <Link 
                        to="/research-chat"
                        className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Ask Research Assistant
                      </Link>
                    </div>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="bg-gray-800 rounded-xl p-8 text-center">
                  <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Generating Recommendations</h2>
                  <p className="text-gray-400">
                    Our AI is analyzing market data and your preferences to provide personalized stock recommendations...
                  </p>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-xl p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Get Your Recommendations</h2>
                  <p className="text-gray-400 mb-6">
                    Set your investment preferences and click "Get Recommendations" to receive AI-powered stock suggestions tailored to your profile.
                  </p>
                  <button
                    onClick={getRecommendations}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Generate Recommendations
                  </button>
                </div>
              )}
              
              {/* Additional Information */}
              <div className="mt-6 bg-gray-800/50 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-yellow-500/10 p-2 rounded-full mr-4">
                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Important Disclaimer</h3>
                    <p className="text-gray-400 text-sm">
                      The stock recommendations provided are for educational and informational purposes only and should not be considered financial advice. Always conduct your own research and consider consulting with a qualified financial advisor before making investment decisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* App Dock */}
      <AppDock />
    </div>
  );
} 