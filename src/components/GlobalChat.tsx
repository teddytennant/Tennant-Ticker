import { useState, useEffect } from 'react';
import { MessageCircle, Send, User, X, HelpCircle, TrendingUp, ChevronDown } from 'lucide-react';
import { 
  ExpandableChat, 
  ExpandableChatHeader, 
  ExpandableChatBody, 
  ExpandableChatFooter 
} from './ui/expandable-chat';
import { Button } from './ui/button';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

type ChatMode = 'financial' | 'website-help';

interface GlobalChatProps {
  onClose?: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
}

export function GlobalChat({ onClose, isMinimized = false, onMinimize }: GlobalChatProps) {
  const [chatMode, setChatMode] = useState<ChatMode>('financial');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! How can I help you with your financial questions today?',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(!isMinimized);
  const [isNewMessage, setIsNewMessage] = useState(false);

  // Update expanded state when isMinimized prop changes
  useEffect(() => {
    setIsExpanded(!isMinimized);
  }, [isMinimized]);

  // Simulate a new message notification after component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isExpanded) {
        setIsNewMessage(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isExpanded]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsNewMessage(false);

    // Simulate assistant response after a short delay
    setTimeout(() => {
      let responseContent = '';
      
      if (chatMode === 'financial') {
        responseContent = "I'm your financial advisor. I can help you track stocks, analyze market trends, and provide investment insights. What would you like to know?";
      } else {
        responseContent = "I can help you navigate our website. You can ask about features, how to use tools, account settings, or any other questions about the platform.";
      }

      // Check for specific website help questions
      if (chatMode === 'website-help') {
        const lowerCaseInput = inputValue.toLowerCase();
        
        if (lowerCaseInput.includes('dashboard') || lowerCaseInput.includes('home')) {
          responseContent = "The dashboard is your central hub where you can view your portfolio summary, recent market movements, and watchlists. You can customize widgets by clicking the gear icon in the top-right of each section.";
        } else if (lowerCaseInput.includes('watchlist') || lowerCaseInput.includes('track stock')) {
          responseContent = "To create a watchlist, go to the Watchlists tab and click 'Create New Watchlist'. You can add stocks by searching for symbols or company names, and organize them into different lists for easier tracking.";
        } else if (lowerCaseInput.includes('account') || lowerCaseInput.includes('profile') || lowerCaseInput.includes('settings')) {
          responseContent = "You can manage your account settings by clicking on your profile icon in the top-right corner and selecting 'Account Settings'. There you can update your personal information, notification preferences, and security settings.";
        } else if (lowerCaseInput.includes('notification') || lowerCaseInput.includes('alert')) {
          responseContent = "You can set up price alerts by going to a stock's detail page and clicking 'Create Alert'. You can customize notification settings in your account preferences.";
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const switchMode = (mode: ChatMode) => {
    if (mode === chatMode) return;
    
    setChatMode(mode);
    
    // Clear previous messages and set welcome message for the new mode
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: mode === 'financial' 
        ? 'Hello! How can I help you with your financial questions today?' 
        : 'Hello! I am your website assistant. How can I assist you with navigating our platform?',
      sender: 'assistant',
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
  };

  const toggleChat = () => {
    if (onMinimize) {
      onMinimize();
    } else {
      setIsExpanded(!isExpanded);
    }
    
    if (!isExpanded) {
      setIsNewMessage(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // If minimized by parent, don't render the expanded chat
  if (isMinimized && !isExpanded) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Chat Button with White Circle */}
      {!isExpanded && (
        <button 
          onClick={toggleChat}
          className="relative group"
          aria-label="Open chat assistant"
        >
          <div className="absolute inset-0 bg-white rounded-full scale-125 opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="absolute inset-0 bg-white rounded-full scale-110 opacity-40 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white p-4 rounded-full shadow-lg hover:shadow-blue-500/20 transition-all duration-300 flex items-center justify-center">
            <MessageCircle className="h-6 w-6" />
            {isNewMessage && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">1</span>
            )}
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isExpanded && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-80 md:w-96 overflow-hidden transition-all duration-300 transform scale-100 opacity-100">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white border-b border-gray-700 flex items-center justify-between p-3">
            <div className="flex items-center">
              <div className="bg-blue-500/30 p-1.5 rounded-full mr-2">
                <MessageCircle className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="font-medium text-sm">Research Assistant</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 flex items-center">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                Online
              </span>
              <button 
                onClick={toggleChat}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button 
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Mode Toggle */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 flex items-center justify-center p-2 gap-2">
            <Button
              onClick={() => switchMode('financial')}
              className={`text-xs py-1 px-3 rounded-full flex items-center gap-1 transition-all duration-200 ${
                chatMode === 'financial'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/80'
              }`}
            >
              <TrendingUp className="h-3 w-3" />
              <span>Financial Advice</span>
            </Button>
            <Button
              onClick={() => switchMode('website-help')}
              className={`text-xs py-1 px-3 rounded-full flex items-center gap-1 transition-all duration-200 ${
                chatMode === 'website-help'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/80'
              }`}
            >
              <HelpCircle className="h-3 w-3" />
              <span>Help</span>
            </Button>
          </div>
          
          <div className="bg-gradient-to-b from-gray-900 to-gray-950 p-4 space-y-4 h-80 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                } ${index === messages.length - 1 && message.sender === 'assistant' ? 'animate-fadeIn' : ''}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 shadow-md ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      : 'bg-gradient-to-r from-gray-800 to-gray-850 text-gray-200 border border-gray-700/50'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {message.sender === 'assistant' ? (
                      <div className="bg-blue-500/20 p-0.5 rounded-full mr-1">
                        <MessageCircle className="h-2.5 w-2.5 text-blue-400" />
                      </div>
                    ) : (
                      <div className="bg-blue-500/20 p-0.5 rounded-full mr-1">
                        <User className="h-2.5 w-2.5 text-blue-300" />
                      </div>
                    )}
                    <span className="text-xs opacity-75">
                      {message.sender === 'user' ? 'You' : 'Assistant'}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  <div className="text-xs opacity-50 text-right mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700 p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={chatMode === 'financial' 
                  ? "Ask about stocks, market trends, or portfolio advice..." 
                  : "Ask about website features, navigation, or account settings..."}
                className="flex-1 bg-gray-700/70 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[40px] max-h-[120px] border border-gray-600/50 text-sm"
                rows={1}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-2 h-10 w-10 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-gray-400 flex items-center">
              <MessageCircle className="h-3 w-3 mr-1 text-blue-400" />
              <span>{chatMode === 'financial' 
                ? "For reference only. Do your own research before investing." 
                : "For assistance with website features and navigation."}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 