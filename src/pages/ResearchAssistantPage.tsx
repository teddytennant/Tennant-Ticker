import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FileText, 
  BarChart4, 
  Briefcase, 
  HelpCircle, 
  Bot, 
  Home, 
  Menu, 
  X, 
  Trash2, 
  Info, 
  ArrowUpIcon, 
  Paperclip, 
  User,
  Send,
  ChevronRight,
  Clock,
  TrendingUp,
  Search,
  Brain,
  BarChart2,
  Sparkles,
  MessageCircle,
  BookOpen,
  Lightbulb,
  RefreshCw,
  ChevronDown,
  Filter,
  Calendar,
  Share2,
  Download,
  Star,
  PieChart,
  LineChart,
  Zap,
  Target,
  Layers
} from 'lucide-react';
import { getFinancialAdvice, getPortfolioAdvice, getWebsiteHelp, getStockNewsSummary } from '../services/researchApi';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { AppDock } from '../components/AppDock';
import { Textarea } from '../components/ui/textarea';
import { cn } from '../lib/utils';
import { PageHeader } from '../components/PageHeader';
import { MinimalToggle } from '../components/ui/toggle';
import { Button } from '../components/ui/button';

type MessageType = 'user' | 'assistant';

interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  useStocksContext?: boolean;
}

interface SuggestedQuery {
  icon?: React.ElementType;
  text: string;
  category: string;
}

const SUGGESTED_PROMPTS = [
  {
    icon: LineChart,
    text: "Analyze market trends and technical indicators",
    category: "Technical Analysis"
  },
  {
    icon: Brain,
    text: "Evaluate AI and tech sector opportunities",
    category: "Sector Analysis"
  },
  {
    icon: Target,
    text: "Identify potential investment targets",
    category: "Stock Screening"
  },
  {
    icon: PieChart,
    text: "Portfolio diversification strategies",
    category: "Portfolio Management"
  },
  {
    icon: Layers,
    text: "Multi-asset allocation advice",
    category: "Asset Allocation"
  },
  {
    icon: Zap,
    text: "High-growth stock opportunities",
    category: "Growth Investing"
  }
];

export function ResearchAssistantPage() {
  // State for sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  
  // Add state for active sidebar section
  const [activeSidebarSection, setActiveSidebarSection] = useState<string>('market-analysis');
  
  // Stable state management
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('researchMessages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (e) {
        console.error('Failed to parse saved messages', e);
      }
    }
    
    return [{
      id: 'welcome',
      type: 'assistant',
      content: "## Welcome to the Research Assistant\n\nI'm here to help with your investment research and financial analysis. You can ask me about:\n\n- Market trends and analysis\n- Stock performance and recommendations\n- Portfolio optimization\n- Economic indicators and news\n\nHow can I assist with your investment research today?",
      timestamp: new Date()
    }];
  });
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [useStocksContext, setUseStocksContext] = useState<boolean>(() => {
    // Retrieve the setting from localStorage or default to false
    return localStorage.getItem('useStocksContext') === 'true';
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    if (inputRef.current) {
      // Reset height to auto to get the correct scrollHeight
      inputRef.current.style.height = 'auto';
      
      // Set the height based on content (with a maximum)
      const scrollHeight = inputRef.current.scrollHeight;
      const newHeight = Math.min(scrollHeight, 120);
      inputRef.current.style.height = `${newHeight}px`;
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    try {
      // Convert Date objects to strings before storing
      const messagesToStore = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }));
      localStorage.setItem('researchMessages', JSON.stringify(messagesToStore));
    } catch (e) {
      console.error('Failed to save messages', e);
    }
  }, [messages]);

  // Save useStocksContext to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('useStocksContext', useStocksContext.toString());
  }, [useStocksContext]);

  // Load portfolio from localStorage only once on component mount
  useEffect(() => {
    try {
      const savedStocks = localStorage.getItem('stocks');
      if (savedStocks) {
        const parsedStocks = JSON.parse(savedStocks);
        const symbols = parsedStocks.map((stock: any) => stock.symbol);
        setPortfolio(symbols);
      }
    } catch (error) {
      console.error('Error parsing saved stocks:', error);
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initial scroll to ensure welcome message is visible
  useEffect(() => {
    // Short delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        // For the welcome message, use a different scroll approach
        if (messages.length === 1 && chatContainerRef.current) {
          // Set scroll to top with a small offset to account for the header
          chatContainerRef.current.scrollTop = 0;
        } else {
          // For regular messages, scroll to the latest message
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [messages.length]);

  // Set fixed heights for chat container to prevent page scrolling
  useEffect(() => {
    const setFixedHeights = () => {
      if (chatContainerRef.current) {
        const windowHeight = window.innerHeight;
        const headerHeight = 70; // Proper header height
        const inputAreaHeight = 130; // Proper input area height
        const appDockHeight = 80; // Account for app dock
        
        // Calculate available height with a buffer
        const availableHeight = windowHeight - headerHeight - inputAreaHeight - appDockHeight;
        chatContainerRef.current.style.height = `${availableHeight}px`;
        chatContainerRef.current.style.overflowY = 'auto';
        
        // Add padding to the top to ensure the welcome message isn't cut off
        chatContainerRef.current.style.paddingTop = '24px'; // Increased padding
        chatContainerRef.current.style.paddingBottom = '16px';
      }
    };

    setFixedHeights();
    window.addEventListener('resize', setFixedHeights);
    
    return () => {
      window.removeEventListener('resize', setFixedHeights);
    };
  }, []);

  // Prevent body scrolling when this component is mounted
  useEffect(() => {
    // Save the original overflow style
    const originalStyle = document.body.style.overflow;
    
    // Prevent scrolling on the body
    document.body.style.overflow = 'hidden';
    
    // Restore original style when component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Auto-resize textarea based on content
  useEffect(() => {
    adjustHeight();
  }, [inputValue, adjustHeight]);

  // Handle sending a message
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim() || isLoading) return;
    
    // Store the current input before clearing it
    const currentInput = inputValue.trim();
    
    // Generate a unique ID for the message
    const messageId = Date.now().toString();
    
    // Add user message to the chat
    const userMessage: Message = {
      id: messageId,
      type: 'user',
      content: currentInput,
      timestamp: new Date(),
      useStocksContext: useStocksContext
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    adjustHeight();
    setIsLoading(true);
    
    // Process the message based on whether to use stocks context
    let responsePromise: Promise<string>;
    
    if (useStocksContext && portfolio.length > 0) {
      responsePromise = getPortfolioAdvice(currentInput, portfolio);
    } else {
      responsePromise = getFinancialAdvice(currentInput);
    }
    
    // Handle the response
    responsePromise
      .then(response => {
        const assistantMessage: Message = {
          id: `response-${messageId}`,
          type: 'assistant',
          content: response,
          timestamp: new Date(),
          useStocksContext: useStocksContext
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      })
      .catch(error => {
        console.error('Error getting response:', error);
        
        const errorMessage: Message = {
          id: `error-${messageId}`,
          type: 'assistant',
          content: "I'm sorry, there was an error processing your request. Please try again.",
          timestamp: new Date(),
          useStocksContext: useStocksContext
        };
        
        setMessages(prev => [...prev, errorMessage]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [useStocksContext, inputValue, isLoading, portfolio, adjustHeight]);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  }, []);

  // Handle key presses in the input field
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Handle suggested query selection
  const handleSuggestedQuerySelect = useCallback((query: string) => {
    if (inputRef.current) {
      // Set the input value directly
      setInputValue(query);
      
      // Focus the input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          
          // Place cursor at the end
          const length = query.length;
          inputRef.current.setSelectionRange(length, length);
          
          adjustHeight();
        }
      }, 0);
    }
  }, [adjustHeight]);

  const getSuggestedQueries = useCallback((): SuggestedQuery[] => {
    if (useStocksContext && portfolio.length > 0) {
      return [
        { icon: BarChart4, text: "Analyze my portfolio and suggest improvements.", category: "Portfolio Management" },
        { icon: Search, text: "What sectors am I missing in my portfolio?", category: "Portfolio Management" },
        { icon: TrendingUp, text: "Which of my stocks have the best growth potential?", category: "Portfolio Management" },
        { icon: Brain, text: "What risks are present in my current portfolio?", category: "Portfolio Management" }
      ];
    }
    
    return SUGGESTED_PROMPTS;
  }, [useStocksContext, portfolio]);

  // Handle clearing all messages
  const handleClearMessages = useCallback(() => {
    const confirmClear = window.confirm('Are you sure you want to clear all messages? This cannot be undone.');
    if (confirmClear) {
      setMessages([{
        id: 'welcome',
        type: 'assistant',
        content: "## Welcome to the Research Assistant\n\nI'm here to help with your investment research and financial analysis. You can ask me about:\n\n- Market trends and analysis\n- Stock performance and recommendations\n- Portfolio optimization\n- Economic indicators and news\n\nHow can I assist with your investment research today?",
        timestamp: new Date()
      }]);
    }
  }, []);

  // Handle sidebar button clicks
  const handleSidebarButtonClick = useCallback((section: string, query: string) => {
    // Set the active section
    setActiveSidebarSection(section);
    
    // Set the query in the input field
    handleSuggestedQuerySelect(query);
    
    // Close the sidebar on mobile
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [handleSuggestedQuerySelect]);

  // Market Analysis queries
  const handleMarketAnalysisClick = useCallback(() => {
    handleSidebarButtonClick('market-analysis', 'Provide a market analysis for the top tech stocks today.');
  }, [handleSidebarButtonClick]);

  // Research Reports queries
  const handleResearchReportsClick = useCallback(() => {
    handleSidebarButtonClick('research-reports', 'Show me the latest research reports on emerging market trends.');
  }, [handleSidebarButtonClick]);

  // Portfolio Insights queries
  const handlePortfolioInsightsClick = useCallback(() => {
    if (portfolio.length > 0) {
      handleSidebarButtonClick('portfolio-insights', 'Analyze my portfolio and suggest improvements.');
    } else {
      handleSidebarButtonClick('portfolio-insights', 'What should I consider when building a diversified portfolio?');
    }
  }, [handleSidebarButtonClick, portfolio]);

  // Help & Resources queries
  const handleHelpResourcesClick = useCallback(() => {
    handleSidebarButtonClick('help-resources', 'What investment resources and tools do you recommend for beginners?');
  }, [handleSidebarButtonClick]);

  // Get category-specific suggested queries
  const getCategorySuggestedQueries = useCallback((): SuggestedQuery[] => {
    switch (activeSidebarSection) {
      case 'market-analysis':
        return [
          { icon: TrendingUp, text: "Analyze key technical indicators for major tech stocks", category: "Technical Analysis" },
          { icon: Brain, text: "Explain current market sentiment around AI stocks", category: "Sector Analysis" },
          { icon: BarChart2, text: "What are the key market risks I should be aware of?", category: "Technical Analysis" },
          { icon: Search, text: "Compare performance of different market sectors", category: "Sector Analysis" }
        ];
      case 'research-reports':
        return [
          { icon: FileText, text: "Summarize recent earnings reports for top S&P 500 companies", category: "Research Reports" },
          { icon: Calendar, text: "What important economic events are coming up?", category: "Economic Indicators" },
          { icon: Filter, text: "Find stocks with strong fundamentals in the healthcare sector", category: "Stock Screening" },
          { icon: Lightbulb, text: "What are the emerging trends in renewable energy investments?", category: "Sector Analysis" }
        ];
      case 'portfolio-insights':
        if (portfolio.length > 0) {
          return [
            { icon: BarChart4, text: "Analyze my portfolio and suggest improvements", category: "Portfolio Management" },
            { icon: Search, text: "What sectors am I missing in my portfolio?", category: "Portfolio Management" },
            { icon: TrendingUp, text: "Which of my stocks have the best growth potential?", category: "Portfolio Management" },
            { icon: Brain, text: "What risks are present in my current portfolio?", category: "Portfolio Management" }
          ];
        } else {
          return [
            { icon: Briefcase, text: "What should I consider when building a diversified portfolio?", category: "Portfolio Management" },
            { icon: Lightbulb, text: "Recommend dividend stocks for passive income", category: "Portfolio Management" },
            { icon: BarChart2, text: "Which sectors are expected to outperform in the next year?", category: "Portfolio Management" },
            { icon: Search, text: "What are the best beginner-friendly ETFs to invest in?", category: "Portfolio Management" }
          ];
        }
      case 'help-resources':
        return [
          { icon: HelpCircle, text: "What investment resources and tools do you recommend for beginners?", category: "Help & Resources" },
          { icon: BookOpen, text: "Explain common investment terms and concepts", category: "Help & Resources" },
          { icon: Info, text: "How do I interpret financial statements?", category: "Help & Resources" },
          { icon: MessageCircle, text: "What questions should I ask before investing in a stock?", category: "Help & Resources" }
        ];
      default:
        return SUGGESTED_PROMPTS;
    }
  }, [activeSidebarSection, portfolio]);

  return (
    <div className="min-h-screen bg-[#0a0f1d] flex flex-col">
      {/* Modern Glass Header */}
      <header className="h-[70px] bg-[#0f1429]/95 backdrop-blur-xl border-b border-white/5 z-50 flex-shrink-0 shadow-lg">
        <div className="h-full max-w-[2000px] mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-white flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <Bot className="h-5 w-5 text-white" />
              </div>
              Research Assistant
              <span className="ml-3 px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20">
                PRO
              </span>
            </h1>
            
            <div className="hidden md:flex items-center gap-4">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors text-sm">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors text-sm">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors text-sm">
                <Star className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearMessages}
              className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors md:hidden"
              title="Toggle sidebar"
            >
              {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main container with modern glass sidebar */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 70px - 80px)' }}>
        {/* Sidebar with frosted glass effect */}
        <div className={`${
          isSidebarOpen ? 'w-full md:w-80' : 'w-0'
        } bg-[#0f1429]/95 backdrop-blur-xl border-r border-white/5 transition-all duration-300 overflow-hidden flex-shrink-0 h-full`}>
          <div className="p-4 border-b border-white/5">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-blue-400" />
              Research Tools
            </h3>
            <div className="space-y-2">
              <button 
                onClick={handleMarketAnalysisClick}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg ${
                  activeSidebarSection === 'market-analysis' 
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20' 
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                } transition-all duration-200 text-sm group`}
              >
                <div className="flex items-center">
                  <BarChart4 className="h-4 w-4 mr-2" />
                  <span>Market Analysis</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <button 
                onClick={handleResearchReportsClick}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg ${
                  activeSidebarSection === 'research-reports' 
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20' 
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                } transition-all duration-200 text-sm group`}
              >
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Research Reports</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <button 
                onClick={handlePortfolioInsightsClick}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg ${
                  activeSidebarSection === 'portfolio-insights' 
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20' 
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                } transition-all duration-200 text-sm group`}
              >
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span>Portfolio Insights</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <button 
                onClick={handleHelpResourcesClick}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg ${
                  activeSidebarSection === 'help-resources' 
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20' 
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                } transition-all duration-200 text-sm group`}
              >
                <div className="flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  <span>Help & Resources</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center">
              <MessageCircle className="w-4 h-4 mr-2 text-blue-400" />
              Recent Topics
            </h3>
            <div className="space-y-2">
              {messages
                .filter(m => m.type === 'user')
                .slice(-5)
                .reverse()
                .map(message => (
                  <button
                    key={message.id}
                    onClick={() => handleSuggestedQuerySelect(message.content)}
                    className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-all duration-200 text-xs truncate flex items-center group"
                  >
                    <Clock className="h-3 w-3 mr-2 flex-shrink-0 text-gray-500 group-hover:text-blue-400" />
                    <span className="truncate">{message.content}</span>
                  </button>
                ))}
              
              {messages.filter(m => m.type === 'user').length === 0 && (
                <div className="text-xs text-gray-500 p-2.5 bg-white/5 rounded-lg">
                  No recent topics. Start a conversation to see your history here.
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Main chat area with modern styling */}
        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
          {/* Messages area with subtle gradient */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 bg-gradient-to-b from-[#0a0f1d] to-[#0d1326]"
            style={{ 
              overscrollBehavior: 'contain'
            }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl mb-6 shadow-lg shadow-blue-500/20">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Professional Research Assistant</h2>
                <p className="text-gray-400 max-w-md mb-8 text-base leading-relaxed">
                  Your AI-powered financial research companion. Get instant insights, analysis, and recommendations tailored to your investment needs.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
                  {SUGGESTED_PROMPTS.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuerySelect(prompt.text)}
                      className="bg-[#0f1429] hover:bg-[#131a35] text-gray-200 p-4 rounded-xl text-sm text-left transition-all duration-200 border border-white/5 hover:border-blue-500/20 shadow-lg hover:shadow-xl group"
                    >
                      <div className="flex items-start">
                        <div className="bg-blue-600/10 p-2 rounded-lg mr-3">
                          {prompt.icon && <prompt.icon className="h-5 w-5 text-blue-400" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-blue-400 mb-1">{prompt.category}</p>
                          <p className="font-medium leading-relaxed">{prompt.text}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto w-full pt-2">
                {/* Add extra padding at the top for the first message */}
                {messages.length === 1 && messages[0].type === 'assistant' && (
                  <div className="h-6"></div>
                )}
                
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === 'user' ? 'justify-end mb-4' : 'justify-start mb-4'
                    } ${index === messages.length - 1 && message.type === 'assistant' ? 'animate-fadeIn' : ''} ${
                      message.id === 'welcome' ? 'welcome-message mt-6' : ''
                    }`}
                  >
                    {message.type === 'assistant' && (
                      <div className="flex-shrink-0 mr-3">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}
                    
                    <div className={`max-w-[85%] ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
                      <div className={`rounded-xl px-5 py-4 shadow-lg ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                          : 'bg-[#0f1429]/95 backdrop-blur-xl text-gray-200 border border-white/5'
                      }`}>
                        {/* Message header with sender info */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {message.type === 'user' ? 'You' : 'Research Assistant'}
                            </span>
                            
                            {message.useStocksContext && message.type === 'assistant' && (
                              <span className="bg-blue-500/10 text-blue-400 text-xs font-medium px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center">
                                <Briefcase className="h-3 w-3 mr-1" />
                                Portfolio Context
                              </span>
                            )}
                          </div>
                          <span className="text-xs opacity-70 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        
                        {/* Message content with markdown support */}
                        <div className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-headings:my-3 prose-li:my-1">
                          {message.type === 'assistant' ? (
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Message actions */}
                      {message.type === 'assistant' && (
                        <div className="flex items-center justify-start mt-2 space-x-3">
                          <button className="text-xs text-gray-500 hover:text-white flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-all duration-200">
                            <Paperclip className="h-3 w-3" />
                            Copy
                          </button>
                          <button className="text-xs text-gray-500 hover:text-white flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-all duration-200">
                            <BookOpen className="h-3 w-3" />
                            Expand
                          </button>
                          <button className="text-xs text-gray-500 hover:text-white flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-all duration-200">
                            <Share2 className="h-3 w-3" />
                            Share
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {message.type === 'user' && (
                      <div className="flex-shrink-0 ml-3 order-2">
                        <div className="bg-blue-500/10 w-10 h-10 rounded-xl flex items-center justify-center border border-blue-500/20">
                          <User className="h-5 w-5 text-blue-400" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Modern input area with glass effect */}
          <div className="border-t border-white/5 bg-[#0f1429]/95 backdrop-blur-xl p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => setUseStocksContext(!useStocksContext)}
                  >
                    <Briefcase className={`w-4 h-4 ${useStocksContext ? 'text-blue-400' : 'text-gray-400'}`} />
                    <span className={`text-sm ${useStocksContext ? 'text-blue-400' : 'text-gray-400'}`}>
                      Portfolio Context
                    </span>
                    <MinimalToggle
                      checked={useStocksContext}
                      onChange={(e) => setUseStocksContext(e.target.checked)}
                      className="ml-2"
                    />
                  </div>
                  
                  {portfolio.length > 0 && useStocksContext && (
                    <div className="hidden md:flex items-center gap-2">
                      {portfolio.slice(0, 3).map((symbol, i) => (
                        <span key={symbol} className="px-2 py-1 rounded-lg bg-white/5 text-gray-300 text-sm">
                          {symbol}
                        </span>
                      ))}
                      {portfolio.length > 3 && (
                        <span className="text-gray-500 text-sm">+{portfolio.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <Textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    useStocksContext && portfolio.length > 0
                      ? "Ask about your portfolio, market trends, or investment strategies..."
                      : "Ask about stocks, market analysis, or investment advice..."
                  }
                  className="min-h-[50px] max-h-[120px] bg-white/5 border-white/10 text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none text-sm placeholder:text-gray-500"
                />
                
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className={`p-2.5 rounded-lg ${
                      inputValue.trim() && !isLoading
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg'
                        : 'bg-white/5 text-gray-400 cursor-not-allowed'
                    } transition-all duration-200 flex items-center justify-center`}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Press Enter to send, Shift+Enter for new line</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Response time: ~2s
                  </span>
                  <span className="flex items-center">
                    <Sparkles className="h-3 w-3 mr-1 text-blue-400" />
                    AI Powered
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AppDock />
    </div>
  );
} 