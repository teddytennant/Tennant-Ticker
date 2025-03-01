import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  Brain,
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Search,
  BarChart2,
  RefreshCw,
  AlertCircle,
  Plus,
  Clock,
  Settings,
  ChevronRight,
  Bell
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import toast from 'react-hot-toast';

const SUGGESTED_PROMPTS = [
  {
    icon: TrendingUp,
    text: "Technical Analysis",
    prompt: "Analyze key technical indicators and chart patterns for major tech stocks"
  },
  {
    icon: Brain,
    text: "Market Sentiment",
    prompt: "Current market sentiment around AI and technology stocks"
  },
  {
    icon: BarChart2,
    text: "Risk Assessment",
    prompt: "Key market risks and optimal portfolio positioning"
  },
  {
    icon: Search,
    text: "Sector Research",
    prompt: "Performance analysis of market sectors and opportunities"
  }
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

export function ResearchAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent, promptText?: string) => {
    e.preventDefault();
    const messageText = promptText || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Placeholder for future Perplexity API integration
    toast('AI integration coming soon with Perplexity API!');
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success('Chat history cleared');
  };

  return (
    <div className="fixed inset-0 bg-gray-900">
      {/* Top Navigation */}
      <div className="h-14 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-white font-medium hover:text-gray-300 transition-colors" title="Go to Home">
            Tennant Ticker
          </Link>
          <div className="h-4 border-r border-gray-800" />
          <div className="text-gray-400 text-sm">AI Research Assistant</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors" title="Add new item">
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors" title="View notifications">
            <Bell className="w-4 h-4" />
          </button>
          <Link to="/settings" className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors" title="Open settings">
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="h-[calc(100vh-3.5rem)] mt-14 flex">
        {/* Left Panel */}
        <div className="w-60 border-r border-gray-800 flex flex-col bg-gray-900">
          {/* Tools */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <div className="mb-6">
                <div className="px-2 mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400">QUICK ACTIONS</span>
                  <Plus className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div className="space-y-0.5">
                  {SUGGESTED_PROMPTS.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={(e) => handleSubmit(e, prompt.prompt)}
                      disabled={isLoading}
                      className="w-full px-2 py-1.5 text-left text-gray-300 hover:bg-gray-800 rounded-md text-sm flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title={`Prompt: ${prompt.text}`}
                    >
                      <prompt.icon className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                      <span className="flex-1">{prompt.text}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="px-2 mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400">RECENT</span>
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div className="space-y-0.5">
                  <button className="w-full px-2 py-1.5 text-left text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-md text-sm transition-colors truncate" title="View recent analysis">
                    Technical Analysis: NVDA, AMD
                  </button>
                  <button className="w-full px-2 py-1.5 text-left text-gray-400 hover:text-gray-200 hover:bg-[#333] rounded-md text-sm transition-colors truncate" title="View recent sentiment">
                    Market Sentiment: AI Sector
                  </button>
                  <button className="w-full px-2 py-1.5 text-left text-gray-400 hover:text-gray-200 hover:bg-[#333] rounded-md text-sm transition-colors truncate" title="View recent risk assessment">
                    Risk Assessment: Tech Stocks
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-800">
            <button 
              onClick={handleClearChat}
              className="w-full px-3 py-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-md transition-colors text-sm flex items-center justify-center gap-2"
              title="Clear chat history"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Clear conversation
            </button>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col bg-gray-900">
          {/* Empty State or Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="h-full max-w-3xl mx-auto px-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="mb-2">
                    <Brain className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-lg text-white mb-1">How can I help?</h2>
                  <p className="text-sm text-gray-400 mb-6">
                    Ask about market analysis, trends, or trading strategies
                  </p>
                  <div className="w-full max-w-md grid grid-cols-2 gap-2">
                    {SUGGESTED_PROMPTS.slice(0, 2).map((prompt, index) => (
                      <button
                        key={index}
                        onClick={(e) => handleSubmit(e, prompt.prompt)}
                        className="p-3 text-left bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group"
                        title={`Prompt: ${prompt.text}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <prompt.icon className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                          <span className="text-sm font-medium text-white">{prompt.text}</span>
                        </div>
                        <p className="text-xs text-gray-400">{prompt.prompt}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-2xl rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-[#333] text-gray-200'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-1">
                            <Bot className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-xs font-medium text-gray-400">Assistant</span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className="mt-1 text-xs text-gray-400">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-[#333] p-4">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message..."
                  className="flex-1 bg-[#333] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 