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
  Calendar
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
}

const SUGGESTED_PROMPTS = [
  {
    icon: TrendingUp,
    text: "Analyze key technical indicators for major tech stocks"
  },
  {
    icon: Brain,
    text: "Explain current market sentiment around AI stocks"
  },
  {
    icon: BarChart2,
    text: "What are the key market risks I should be aware of?"
  },
  {
    icon: Search,
    text: "Compare performance of different market sectors"
  },
  {
    icon: Lightbulb,
    text: "Recommend dividend stocks for passive income"
  },
  {
    icon: Calendar,
    text: "What important economic events are coming up?"
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
        const headerHeight = 60; // Proper header height
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
        { icon: BarChart4, text: "Analyze my portfolio and suggest improvements." },
        { icon: Search, text: "What sectors am I missing in my portfolio?" },
        { icon: TrendingUp, text: "Which of my stocks have the best growth potential?" },
        { icon: Brain, text: "What risks are present in my current portfolio?" }
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
          { icon: TrendingUp, text: "Analyze key technical indicators for major tech stocks" },
          { icon: Brain, text: "Explain current market sentiment around AI stocks" },
          { icon: BarChart2, text: "What are the key market risks I should be aware of?" },
          { icon: Search, text: "Compare performance of different market sectors" }
        ];
      case 'research-reports':
        return [
          { icon: FileText, text: "Summarize recent earnings reports for top S&P 500 companies" },
          { icon: Calendar, text: "What important economic events are coming up?" },
          { icon: Filter, text: "Find stocks with strong fundamentals in the healthcare sector" },
          { icon: Lightbulb, text: "What are the emerging trends in renewable energy investments?" }
        ];
      case 'portfolio-insights':
        if (portfolio.length > 0) {
          return [
            { icon: BarChart4, text: "Analyze my portfolio and suggest improvements" },
            { icon: Search, text: "What sectors am I missing in my portfolio?" },
            { icon: TrendingUp, text: "Which of my stocks have the best growth potential?" },
            { icon: Brain, text: "What risks are present in my current portfolio?" }
          ];
        } else {
          return [
            { icon: Briefcase, text: "What should I consider when building a diversified portfolio?" },
            { icon: Lightbulb, text: "Recommend dividend stocks for passive income" },
            { icon: BarChart2, text: "Which sectors are expected to outperform in the next year?" },
            { icon: Search, text: "What are the best beginner-friendly ETFs to invest in?" }
          ];
        }
      case 'help-resources':
        return [
          { icon: HelpCircle, text: "What investment resources and tools do you recommend for beginners?" },
          { icon: BookOpen, text: "Explain common investment terms and concepts" },
          { icon: Info, text: "How do I interpret financial statements?" },
          { icon: MessageCircle, text: "What questions should I ask before investing in a stock?" }
        ];
      default:
        return SUGGESTED_PROMPTS;
    }
  }, [activeSidebarSection, portfolio]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col h-screen">
      {/* Header - with proper height */}
      <header className="h-[60px] bg-gray-900/95 backdrop-blur-md border-b border-gray-800 z-50 flex-shrink-0">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white flex items-center">
              <Bot className="h-5 w-5 mr-2 text-blue-400" />
              Research Assistant
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearMessages}
              className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
              title="Clear all messages"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors md:hidden"
              title="Toggle sidebar"
            >
              {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - moved to left side */}
        <div
          className={`md:relative md:flex-shrink-0 h-full overflow-y-auto bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out z-40 w-56 ${
            isSidebarOpen ? 'fixed inset-y-14 left-0 translate-x-0' : 'fixed inset-y-14 left-0 -translate-x-full md:translate-x-0'
          }`}
        >
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-medium text-white mb-2">Research Tools</h3>
            <div className="space-y-2">
              <button 
                onClick={handleMarketAnalysisClick}
                className={`w-full flex items-center justify-between p-2 rounded-lg ${
                  activeSidebarSection === 'market-analysis' 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 hover:bg-blue-600/20' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
                } transition-colors text-sm`}
              >
                <div className="flex items-center">
                  <BarChart4 className="h-4 w-4 mr-2" />
                  <span>Market Analysis</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
              
              <button 
                onClick={handleResearchReportsClick}
                className={`w-full flex items-center justify-between p-2 rounded-lg ${
                  activeSidebarSection === 'research-reports' 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 hover:bg-blue-600/20' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
                } transition-colors text-sm`}
              >
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Research Reports</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
              
              <button 
                onClick={handlePortfolioInsightsClick}
                className={`w-full flex items-center justify-between p-2 rounded-lg ${
                  activeSidebarSection === 'portfolio-insights' 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 hover:bg-blue-600/20' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
                } transition-colors text-sm`}
              >
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span>Portfolio Insights</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
              
              <button 
                onClick={handleHelpResourcesClick}
                className={`w-full flex items-center justify-between p-2 rounded-lg ${
                  activeSidebarSection === 'help-resources' 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 hover:bg-blue-600/20' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
                } transition-colors text-sm`}
              >
                <div className="flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  <span>Help & Resources</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="text-sm font-medium text-white mb-2">Recent Topics</h3>
            <div className="space-y-2">
              {messages
                .filter(m => m.type === 'user')
                .slice(-5)
                .reverse()
                .map(message => (
                  <button
                    key={message.id}
                    onClick={() => handleSuggestedQuerySelect(message.content)}
                    className="w-full text-left p-2 rounded-lg bg-gray-800 hover:bg-gray-750 text-gray-300 transition-colors text-xs truncate flex items-center group"
                  >
                    <MessageCircle className="h-3 w-3 mr-2 flex-shrink-0 text-gray-500 group-hover:text-blue-400" />
                    <span className="truncate">{message.content}</span>
                  </button>
                ))}
              
              {/* Show a message if there are no recent topics */}
              {messages.filter(m => m.type === 'user').length === 0 && (
                <div className="text-xs text-gray-500 p-2">
                  No recent topics. Start a conversation to see your history here.
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col h-full relative">
          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-3 md:px-4 py-4 space-y-3 bg-gradient-to-b from-gray-900 to-gray-950"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-full mb-3 shadow-lg shadow-blue-500/20">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Research Assistant</h2>
                <p className="text-gray-400 max-w-md mb-4 text-base">
                  Your AI-powered financial research companion
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl w-full">
                  {getCategorySuggestedQueries().map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuerySelect(query.text)}
                      className="bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-750 hover:to-gray-850 text-gray-200 p-3 rounded-lg text-sm text-left transition-all duration-200 border border-gray-700/50 hover:border-gray-600 shadow-md hover:shadow-lg group"
                    >
                      <div className="flex items-start">
                        <div className="bg-blue-500/20 p-2 rounded-lg mr-3">
                          {query.icon && <query.icon className="h-4 w-4 text-blue-400" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{query.text}</p>
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
                      message.type === 'user' ? 'justify-end mb-3' : 'justify-start mb-3'
                    } ${index === messages.length - 1 && message.type === 'assistant' ? 'animate-fadeIn' : ''} ${
                      message.id === 'welcome' ? 'welcome-message mt-6' : ''
                    }`}
                  >
                    {message.type === 'assistant' && (
                      <div className="flex-shrink-0 mr-2">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                    
                    <div className={`max-w-[85%] ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
                      <div className={`rounded-lg px-4 py-3 shadow-md ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                          : 'bg-gradient-to-br from-gray-800 to-gray-850 text-gray-200 border border-gray-700/50'
                      }`}>
                        {/* Message header with sender info */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <span className="text-sm font-medium opacity-90">
                              {message.type === 'user' ? 'You' : 'Research Assistant'}
                            </span>
                            
                            {message.useStocksContext && message.type === 'assistant' && (
                              <span className="bg-green-600/20 text-green-400 text-xs font-medium px-2 py-0.5 rounded-full ml-2 flex items-center">
                                <Briefcase className="h-3 w-3 mr-1" />
                                Portfolio
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
                        <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-li:my-1">
                          {message.type === 'assistant' ? (
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Message actions */}
                      {message.type === 'assistant' && (
                        <div className="flex items-center justify-start mt-1 space-x-2">
                          <button className="text-xs text-gray-500 hover:text-gray-300 flex items-center">
                            <Paperclip className="h-3 w-3 mr-1" />
                            Copy
                          </button>
                          <button className="text-xs text-gray-500 hover:text-gray-300 flex items-center">
                            <BookOpen className="h-3 w-3 mr-1" />
                            Expand
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {message.type === 'user' && (
                      <div className="flex-shrink-0 ml-2 order-2">
                        <div className="bg-blue-500/20 w-8 h-8 rounded-full flex items-center justify-center border border-blue-500/30">
                          <User className="h-4 w-4 text-blue-400" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area - with proper height */}
          <div className="border-t border-gray-800 bg-gray-900 p-3 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    <MinimalToggle
                      checked={useStocksContext}
                      onChange={(e) => setUseStocksContext(e.target.checked)}
                      className="mr-2 scale-100 transform origin-left"
                    />
                    <span className="text-sm text-gray-400 flex items-center">
                      <Briefcase className="h-4 w-4 mr-1 text-blue-400" />
                      Use Portfolio Context
                    </span>
                  </div>
                  
                  {portfolio.length > 0 && useStocksContext && (
                    <div className="text-sm text-gray-500">
                      <span className="mr-1">Portfolio:</span>
                      {portfolio.slice(0, 3).map((symbol, i) => (
                        <span key={symbol} className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded mr-1">
                          {symbol}
                        </span>
                      ))}
                      {portfolio.length > 3 && (
                        <span className="text-gray-500">+{portfolio.length - 3} more</span>
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
                  className="min-h-[45px] max-h-[120px] bg-gray-800 border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none text-sm placeholder:text-gray-500"
                />
                
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className={`p-2 rounded-lg ${
                      inputValue.trim() && !isLoading
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    } transition-all duration-200 flex items-center justify-center shadow-md`}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mt-1 text-xs text-gray-500 flex items-center justify-between">
                <div className="flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Press Enter to send, Shift+Enter for new line</span>
                </div>
                
                <div className="flex items-center">
                  <Sparkles className="h-3 w-3 mr-1 text-blue-400" />
                  <span>Powered by AI</span>
                </div>
              </div>
              
              {/* Suggested Prompts */}
              {messages.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-400 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-1 text-blue-400" />
                      Suggested Prompts
                    </h4>
                    
                    {/* Category selector */}
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => setActiveSidebarSection('market-analysis')}
                        className={`p-1 rounded-md ${activeSidebarSection === 'market-analysis' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                        title="Market Analysis"
                      >
                        <BarChart4 className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => setActiveSidebarSection('research-reports')}
                        className={`p-1 rounded-md ${activeSidebarSection === 'research-reports' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                        title="Research Reports"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => setActiveSidebarSection('portfolio-insights')}
                        className={`p-1 rounded-md ${activeSidebarSection === 'portfolio-insights' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                        title="Portfolio Insights"
                      >
                        <Briefcase className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => setActiveSidebarSection('help-resources')}
                        className={`p-1 rounded-md ${activeSidebarSection === 'help-resources' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                        title="Help & Resources"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 overflow-x-auto">
                    {getCategorySuggestedQueries().slice(0, 4).map((query, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuerySelect(query.text)}
                        className="bg-gray-800 hover:bg-gray-750 text-gray-300 text-sm px-3 py-2 rounded-lg transition-colors flex items-center flex-shrink-0"
                      >
                        {query.icon && <query.icon className="h-4 w-4 mr-2 text-blue-400" />}
                        <span className="truncate max-w-[180px]">{query.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <AppDock />
    </div>
  );
} 