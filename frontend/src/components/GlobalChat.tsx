import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { MessageCircle, Send, User, X, HelpCircle, TrendingUp, ChevronDown, Bot, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import toast from 'react-hot-toast';

// Lazy load ReactMarkdown to improve initial load time
const ReactMarkdown = lazy(() => import('react-markdown'));

// Define mock API functions to use as fallbacks
const mockApiServices = {
  getFinancialAdvice: async (query: string) => {
    return `This is a mock response to your query: "${query}"\n\nThe API service is currently unavailable. Please try again later.`;
  },
  getWebsiteHelp: async (query: string) => {
    return `This is a mock response to your query: "${query}"\n\nThe help service is currently unavailable. Please try again later.`;
  }
};

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
}

type ChatMode = 'financial' | 'website-help';

interface GlobalChatProps {
  onClose?: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
}

export function GlobalChat({ onClose, isMinimized = false, onMinimize }: GlobalChatProps) {
  const [chatMode, setChatMode] = useState<ChatMode>('financial');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(!isMinimized);
  const [isNewMessage, setIsNewMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiServices, setApiServices] = useState<any>(mockApiServices);
  const [hasLoadedMessages, setHasLoadedMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API services dynamically
  useEffect(() => {
    let isMounted = true;
    
    const loadApiServices = async () => {
      try {
        const services = await import('../services/researchApi');
        if (isMounted) {
          setApiServices({
            getFinancialAdvice: services.getFinancialAdvice || mockApiServices.getFinancialAdvice,
            getWebsiteHelp: services.getWebsiteHelp || mockApiServices.getWebsiteHelp
          });
        }
      } catch (error) {
        console.error('Failed to load API services:', error);
        // Keep using mock services on error
      }
    };
    
    // Add a welcome message
    setMessages([{
      id: Date.now().toString(),
      content: "How can I help with your research today?",
      sender: 'assistant',
      timestamp: new Date()
    }]);
    
    // Load API services with a slight delay to prevent blocking the UI
    setTimeout(() => {
      loadApiServices();
    }, 1000);
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Update expanded state when isMinimized prop changes
  useEffect(() => {
    setIsExpanded(!isMinimized);
  }, [isMinimized]);

  // Load saved messages only after component is fully mounted
  useEffect(() => {
    if (!hasLoadedMessages && isExpanded) {
      try {
        const savedMessages = localStorage.getItem('globalChatMessages');
        if (savedMessages) {
          const parsed = JSON.parse(savedMessages);
          if (parsed && Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })));
          }
        }
        setHasLoadedMessages(true);
      } catch (e) {
        console.error('Failed to parse saved messages', e);
        // Keep the default welcome message
      }
    }
  }, [hasLoadedMessages, isExpanded]);

  // Save messages to localStorage when they change, but only if we have messages
  useEffect(() => {
    if (messages.length > 0) {
      try {
        // Convert Date objects to strings before storing
        const messagesToStore = messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        }));
        localStorage.setItem('globalChatMessages', JSON.stringify(messagesToStore));
      } catch (e) {
        console.error('Failed to save messages', e);
      }
    }
  }, [messages]);

  // Auto-scroll to bottom of messages, but only if chat is expanded
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Store the current input value before clearing it
    const currentInput = inputValue;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentInput,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsNewMessage(false);
    setIsLoading(true);

    // Add a loading message
    const loadingMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingMessageId,
        content: "Thinking...",
        sender: 'assistant',
        timestamp: new Date(),
        isLoading: true
      }
    ]);

    try {
      // Get response from the API based on chat mode
      let response;
      if (chatMode === 'financial') {
        response = await apiServices.getFinancialAdvice(currentInput);
      } else {
        response = await apiServices.getWebsiteHelp(currentInput);
      }

      // Remove the loading message and add the real response
      setMessages((prev) => {
        const filtered = prev.filter(msg => msg.id !== loadingMessageId);
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            content: response,
            sender: 'assistant',
            timestamp: new Date()
          }
        ];
      });
    } catch (error) {
      console.error('Error getting response:', error);
      toast.error('Failed to get a response. Please try again.');
      
      // Remove the loading message and add an error message
      setMessages((prev) => {
        const filtered = prev.filter(msg => msg.id !== loadingMessageId);
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            content: "I'm sorry, I couldn't process your request. Please try again.",
            sender: 'assistant',
            timestamp: new Date()
          }
        ];
      });
    } finally {
      setIsLoading(false);
    }
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
    
    // Add a welcome message for the new mode
    const welcomeMessage = mode === 'financial' 
      ? "How can I help with your financial research today?"
      : "How can I help you navigate the platform?";
      
    setMessages([{
      id: Date.now().toString(),
      content: welcomeMessage,
      sender: 'assistant',
      timestamp: new Date()
    }]);
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

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      content: "How can I help with your research today?",
      sender: 'assistant',
      timestamp: new Date()
    }]);
    toast.success('Chat history cleared');
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

          {/* Chat Modes */}
          <div className="flex border-b border-gray-700">
            <button
              className={`flex-1 py-2 text-xs font-medium ${chatMode === 'financial' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => switchMode('financial')}
            >
              <div className="flex items-center justify-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Financial Research
              </div>
            </button>
            <button
              className={`flex-1 py-2 text-xs font-medium ${chatMode === 'website-help' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => switchMode('website-help')}
            >
              <div className="flex items-center justify-center">
                <HelpCircle className="h-3 w-3 mr-1" />
                Platform Help
              </div>
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <Bot className="h-12 w-12 mb-2 text-gray-600" />
                <p className="text-sm mb-1">No messages yet</p>
                <p className="text-xs">Ask me about market trends, stock analysis, or how to use the platform.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white'
                    } ${message.isLoading ? 'animate-pulse' : ''}`}
                  >
                    {message.sender === 'assistant' && !message.isLoading ? (
                      <Suspense fallback={<div>{message.content}</div>}>
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </Suspense>
                    ) : (
                      <div>{message.content}</div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-700 bg-gray-800">
            <div className="flex items-center">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-10 max-h-32 min-h-[2.5rem]"
                style={{ minHeight: '40px' }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="ml-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between mt-2">
              <button
                onClick={clearChat}
                className="text-xs text-gray-400 hover:text-gray-300"
              >
                Clear chat
              </button>
              <div className="text-xs text-gray-500 flex items-center">
                <Sparkles className="h-3 w-3 mr-1 text-blue-400" />
                AI Powered
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 