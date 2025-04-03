import React, { useState, useRef, useEffect, useCallback } from 'react'; // Import React
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
  Layers,
  ChevronLeft // Added ChevronLeft
} from 'lucide-react';
import { getFinancialAdvice, getPortfolioAdvice, getWebsiteHelp, getStockNewsSummary } from '../services/researchApi';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { AppDock } from '../components/AppDock';
import { Textarea } from '../components/ui/textarea';
import { cn } from '../lib/utils';
import { PageHeader } from '../components/PageHeader';
import { MinimalToggle } from '../components/ui/toggle';
import { Button } from '../components/ui/button'; // Keep Button if used elsewhere, otherwise remove if unused

// Define THEME object locally for this component, mirroring StockMonitorPage
// (Ideally, this would be in a shared theme context/file)
const THEME = {
  background: '#0d1117', 
  cardBackground: '#161b22', 
  elementBackground: '#21262d', 
  border: '#30363d', 
  hoverBackground: '#1f6feb26', // Subtle blue hover for general elements
  accentHoverBackground: '#58a6ff1A', // Lighter blue hover for accent elements
  textPrimary: '#c9d1d9', 
  textSecondary: '#8b949e', 
  accent: '#58a6ff', 
  positive: '#3fb950', 
  negative: '#f85149', 
};

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
  // State for sidebar - default open on larger screens
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768); 
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
    <div style={{ backgroundColor: THEME.background, color: THEME.textPrimary }} className="min-h-screen flex flex-col">
      {/* Header */}
      <header 
        className="h-[70px] backdrop-blur-lg border-b z-50 flex-shrink-0 shadow-sm"
        style={{ backgroundColor: `${THEME.cardBackground}E6`, borderColor: THEME.border }} // Use theme colors with opacity
      >
        <div className="h-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle for Mobile */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md md:hidden" // Show only on mobile
              style={{ color: THEME.textSecondary, backgroundColor: THEME.elementBackground }}
              title="Toggle sidebar"
            >
              {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            {/* Title */}
            <h1 className="text-xl font-semibold flex items-center" style={{ color: THEME.textPrimary }}>
              <div 
                className="w-8 h-8 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-md mr-3"
                style={{ background: `linear-gradient(to bottom right, ${THEME.accent}, #3b82f6)` }} // Use accent
              >
                <Bot className="h-4 w-4 text-white" />
              </div>
              Research Assistant
              <span 
                className="ml-3 px-2 py-0.5 text-xs font-medium rounded-full"
                style={{ backgroundColor: `${THEME.accent}26`, color: THEME.accent, border: `1px solid ${THEME.accent}4D` }} // Use theme accent
              >
                PRO
              </span>
            </h1>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors" style={{ backgroundColor: THEME.elementBackground, color: THEME.textSecondary, border: `1px solid ${THEME.border}` }}>
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors" style={{ backgroundColor: THEME.elementBackground, color: THEME.textSecondary, border: `1px solid ${THEME.border}` }}>
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors" style={{ backgroundColor: THEME.elementBackground, color: THEME.textSecondary, border: `1px solid ${THEME.border}` }}>
                <Star className="w-3.5 h-3.5" /> Save
              </button>
            </div>
            {/* Clear Button */}
            <button
              onClick={handleClearMessages}
              className="p-2 rounded-md transition-colors"
              style={{ color: THEME.textSecondary, backgroundColor: THEME.elementBackground, border: `1px solid ${THEME.border}` }}
              title="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            {/* Mobile Sidebar Toggle (redundant, handled above) */}
          </div>
        </div>
      </header>

      {/* Main container */}
      <div className="flex flex-1 overflow-hidden" style={{ height: `calc(100vh - 70px - ${80}px)` }}> {/* Adjusted height calc */}
        {/* Sidebar */}
        <div 
          className={`transition-all duration-300 overflow-y-auto flex-shrink-0 h-full border-r ${
            isSidebarOpen ? 'w-full md:w-72' : 'w-0 md:w-0 p-0 border-r-0' // Adjusted width and padding
          }`}
          style={{ backgroundColor: THEME.cardBackground, borderColor: THEME.border }}
        >
          {/* Only render content if sidebar is open */}
          {isSidebarOpen && (
            <div className="flex flex-col h-full">
              {/* Research Tools Section */}
              <div className="p-4 border-b" style={{ borderColor: THEME.border }}>
                <h3 className="text-xs font-semibold uppercase mb-3 flex items-center" style={{ color: THEME.textSecondary }}>
                  <Layers className="w-4 h-4 mr-2" style={{ color: THEME.accent }} />
                  Research Tools
                </h3>
                <div className="space-y-1.5"> {/* Reduced spacing */}
                  {[
                    { id: 'market-analysis', label: 'Market Analysis', icon: BarChart4, action: handleMarketAnalysisClick },
                    { id: 'research-reports', label: 'Research Reports', icon: FileText, action: handleResearchReportsClick },
                    { id: 'portfolio-insights', label: 'Portfolio Insights', icon: Briefcase, action: handlePortfolioInsightsClick },
                    { id: 'help-resources', label: 'Help & Resources', icon: HelpCircle, action: handleHelpResourcesClick },
                  ].map(item => (
                    <button 
                      key={item.id}
                      onClick={item.action}
                      className={`w-full flex items-center justify-between p-2 rounded-md transition-all duration-150 text-sm group ${
                        activeSidebarSection === item.id 
                          ? '' // Active style applied via style prop
                          : 'hover:bg-opacity-70'
                      }`}
                      style={{
                        backgroundColor: activeSidebarSection === item.id ? THEME.accentHoverBackground : THEME.elementBackground,
                        color: activeSidebarSection === item.id ? THEME.accent : THEME.textSecondary,
                        border: `1px solid ${activeSidebarSection === item.id ? `${THEME.accent}4D` : THEME.border}`
                      }}
                    >
                      <div className="flex items-center">
                        <item.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: THEME.textSecondary }} />
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Recent Topics Section */}
              <div className="p-4 flex-1 overflow-y-auto">
                <h3 className="text-xs font-semibold uppercase mb-3 flex items-center" style={{ color: THEME.textSecondary }}>
                  <MessageCircle className="w-4 h-4 mr-2" style={{ color: THEME.accent }} />
                  Recent Topics
                </h3>
                <div className="space-y-1.5"> {/* Reduced spacing */}
                  {messages
                    .filter(m => m.type === 'user')
                    .slice(-5)
                    .reverse()
                    .map(message => (
                      <button
                        key={message.id}
                        onClick={() => handleSuggestedQuerySelect(message.content)}
                        className="w-full text-left p-2 rounded-md transition-colors text-xs truncate flex items-center group hover:bg-opacity-70" // Added hover effect class
                        style={{ 
                          backgroundColor: THEME.elementBackground, 
                          color: THEME.textSecondary, 
                          border: `1px solid ${THEME.border}` 
                        }}
                        // Add hover style inline for reliability
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = THEME.hoverBackground}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = THEME.elementBackground}
                      >
                        <Clock className="h-3 w-3 mr-1.5 flex-shrink-0" style={{ color: THEME.textSecondary }} />
                        <span className="truncate flex-1">{message.content}</span>
                      </button>
                    ))}
                  
                  {messages.filter(m => m.type === 'user').length === 0 && (
                    <div className="text-xs p-2 rounded-md" style={{ color: THEME.textSecondary, backgroundColor: THEME.elementBackground, border: `1px solid ${THEME.border}` }}>
                      No recent topics.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col h-full relative overflow-hidden" style={{ backgroundColor: THEME.background }}>
          {/* Messages area */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4" // Adjusted padding and spacing
            style={{ overscrollBehavior: 'contain' }}
          >
            {messages.length === 0 ? (
              // Empty State / Welcome Screen
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                 <div 
                   className="p-3 rounded-xl mb-4 shadow-lg"
                   style={{ background: `linear-gradient(to bottom right, ${THEME.accent}, #3b82f6)` }} 
                 >
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold mb-2" style={{ color: THEME.textPrimary }}>Research Assistant</h2>
                <p className="max-w-md mb-6 text-sm" style={{ color: THEME.textSecondary }}>
                  Your AI companion for financial insights and analysis.
                </p>
                {/* Suggested Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
                  {getCategorySuggestedQueries().map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuerySelect(prompt.text)}
                      className="p-3 rounded-lg text-sm text-left transition-all duration-150 group hover:border-opacity-50" // Added hover effect
                      style={{ 
                        backgroundColor: THEME.cardBackground, 
                        border: `1px solid ${THEME.border}`,
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = THEME.accent} // Hover border color
                      onMouseOut={(e) => e.currentTarget.style.borderColor = THEME.border}
                    >
                      <div className="flex items-start">
                        {prompt.icon && (
                          <div className="p-1.5 rounded-md mr-2.5" style={{ backgroundColor: THEME.elementBackground }}>
                             <prompt.icon className="h-4 w-4" style={{ color: THEME.accent }} />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-xs mb-0.5" style={{ color: THEME.accent }}>{prompt.category}</p>
                          <p className="font-medium leading-snug" style={{ color: THEME.textPrimary }}>{prompt.text}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Chat Messages
              <div className="max-w-4xl mx-auto w-full">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${ message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`} // Consistent margin
                  >
                    {/* Assistant Avatar */}
                    {message.type === 'assistant' && (
                      <div className="flex-shrink-0 mr-2.5">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
                          style={{ background: `linear-gradient(to bottom right, ${THEME.accent}, #3b82f6)` }}
                        >
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                    
                    {/* Message Bubble */}
                    <div className={`max-w-[85%] ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
                      <div 
                        className={`rounded-lg px-4 py-3 shadow-sm ${ message.type === 'user' ? '' : 'border' }`}
                        style={{
                          backgroundColor: message.type === 'user' ? THEME.accent : THEME.cardBackground,
                          color: message.type === 'user' ? '#FFFFFF' : THEME.textPrimary, // White text for user bubble
                          borderColor: message.type === 'user' ? 'transparent' : THEME.border,
                        }}
                      >
                        {/* Message Header (Optional - can be simplified) */}
                        <div className="flex items-center justify-between mb-1.5 text-xs" style={{ color: message.type === 'user' ? 'rgba(255,255,255,0.7)' : THEME.textSecondary }}>
                          <span>{message.type === 'user' ? 'You' : 'Assistant'}</span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        {/* Message Content */}
                        <div className={`prose prose-sm max-w-none prose-p:my-1 prose-li:my-0.5 ${message.type === 'user' ? 'prose-invert' : ''}`} style={{ color: 'inherit' }}>
                          {message.type === 'assistant' ? (
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p> // Ensure user text wraps
                          )}
                        </div>
                      </div>
                      
                      {/* Assistant Message Actions */}
                      {message.type === 'assistant' && (
                        <div className="flex items-center justify-start mt-1.5 space-x-2">
                          {[
                            { label: 'Copy', icon: Paperclip },
                            { label: 'Expand', icon: BookOpen },
                            { label: 'Share', icon: Share2 },
                          ].map(action => (
                            <button 
                              key={action.label}
                              className="text-xs flex items-center gap-1 p-1 rounded transition-colors hover:bg-opacity-70" // Added hover effect class
                              style={{ color: THEME.textSecondary, backgroundColor: 'transparent' }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = THEME.elementBackground} 
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <action.icon className="h-3 w-3" />
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* User Avatar */}
                    {message.type === 'user' && (
                      <div className="flex-shrink-0 ml-2.5 order-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: THEME.elementBackground, border: `1px solid ${THEME.border}` }}>
                          <User className="h-4 w-4" style={{ color: THEME.accent }} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {/* Loading Indicator */}
                {isLoading && messages[messages.length - 1]?.type === 'user' && (
                  <div className="flex justify-start mb-4">
                    <div className="flex-shrink-0 mr-2.5">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
                        style={{ background: `linear-gradient(to bottom right, ${THEME.accent}, #3b82f6)` }}
                      >
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="max-w-[85%]">
                      <div 
                        className="rounded-lg px-4 py-3 shadow-sm border"
                        style={{ backgroundColor: THEME.cardBackground, borderColor: THEME.border }}
                      >
                        <div className="flex space-x-1 animate-pulse">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME.textSecondary }}></div>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME.textSecondary }}></div>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME.textSecondary }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t p-4 md:px-6 md:py-4" style={{ backgroundColor: THEME.cardBackground, borderColor: THEME.border }}>
            <div className="max-w-4xl mx-auto">
              {/* Context Toggle */}
              <div className="flex items-center justify-start mb-3">
                <div 
                  className="flex items-center gap-2 py-1 px-2.5 rounded-md transition-colors cursor-pointer hover:bg-opacity-70" // Added hover effect class
                  style={{ backgroundColor: THEME.elementBackground, border: `1px solid ${THEME.border}` }}
                  onClick={() => setUseStocksContext(!useStocksContext)}
                  title="Toggle using your portfolio context in responses"
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = THEME.hoverBackground}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = THEME.elementBackground}
                >
                  <Briefcase className={`w-3.5 h-3.5 ${useStocksContext ? `text-[${THEME.accent}]` : `text-[${THEME.textSecondary}]`}`} />
                  <span className={`text-xs font-medium ${useStocksContext ? `text-[${THEME.accent}]` : `text-[${THEME.textSecondary}]`}`}>
                    Portfolio Context
                  </span>
                  <MinimalToggle
                    checked={useStocksContext}
                    onChange={(e) => setUseStocksContext(e.target.checked)}
                    className="ml-1"
                    // Pass theme colors to MinimalToggle if it accepts them
                  />
                </div>
                {/* Display portfolio symbols if context is on */}
                {portfolio.length > 0 && useStocksContext && (
                  <div className="hidden md:flex items-center gap-1.5 ml-3 overflow-hidden">
                    {portfolio.slice(0, 4).map((symbol) => (
                      <span key={symbol} className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: THEME.elementBackground, color: THEME.textSecondary }}>
                        {symbol}
                      </span>
                    ))}
                    {portfolio.length > 4 && (
                      <span className="text-xs" style={{ color: THEME.textSecondary }}>+{portfolio.length - 4} more</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Textarea and Send Button */}
              <div className="relative flex items-end gap-2">
                <Textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about markets, stocks, or your portfolio..."
                  className="flex-1 min-h-[44px] max-h-[120px] border rounded-lg px-3.5 py-2.5 pr-12 focus:ring-1 focus:ring-offset-0 resize-none text-sm placeholder:text-gray-500" // Adjusted padding, focus ring
                  style={{ 
                    backgroundColor: THEME.elementBackground, 
                    borderColor: THEME.border, 
                    color: THEME.textPrimary
                    // Removed invalid CSS custom property for focus ring
                  }}
                />
                <div className="absolute right-2 bottom-2 flex items-center">
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className={`p-2 rounded-md transition-all duration-150 flex items-center justify-center ${
                      inputValue.trim() && !isLoading
                        ? 'shadow-sm hover:opacity-90' // Added hover effect
                        : 'cursor-not-allowed opacity-50'
                    }`}
                    style={{
                      backgroundColor: inputValue.trim() && !isLoading ? THEME.accent : THEME.elementBackground,
                      color: inputValue.trim() && !isLoading ? '#FFFFFF' : THEME.textSecondary, // White icon on active button
                    }}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Helper Text */}
              <div className="mt-1.5 text-xs" style={{ color: THEME.textSecondary }}>
                Press Enter to send, Shift+Enter for new line. AI responses may be inaccurate.
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AppDock />
    </div>
  );
}
