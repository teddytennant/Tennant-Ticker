import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  ArrowLeft,
  RefreshCw,
  Menu
} from 'lucide-react';
import { AdvisorSidebar } from '../components/AdvisorSidebar';
import { useSidebar } from '../context/SidebarContext';
import { useAdvisor } from '../context/AdvisorContext';
import { getResearchResponse } from '../services/researchApi';
import { PageHeader } from '../components/PageHeader';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatDetail() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { getChatById, previousChats } = useAdvisor();
  
  // Add debug logging
  console.log("ChatDetail: Loading chat with ID:", chatId);
  console.log("Available chats:", previousChats);
  
  const chat = getChatById(chatId || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toggle } = useSidebar();

  // Redirect if chat doesn't exist
  useEffect(() => {
    if (!chatId) {
      console.error("ChatDetail: No chatId provided");
      toast.error("No chat ID provided");
      navigate('/research-chat');
      return;
    }
    
    if (!chat) {
      console.error("ChatDetail: Chat not found with ID:", chatId);
      toast.error("Chat session not found");
      navigate('/research-chat');
      return;
    }
    
    console.log("ChatDetail: Chat found:", chat);
    
    // Initialize with the first message
    setMessages([
      {
        id: '1',
        role: 'user',
        content: chat.preview,
        timestamp: chat.timestamp
      }
    ]);
  }, [chat, chatId, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Add a temporary loading indicator message
    const loadingIndicatorId = 'loading-' + Date.now().toString();
    setMessages(prev => [...prev, {
      id: loadingIndicatorId,
      role: 'assistant',
      content: '',  // Empty content for loading indicator
      timestamp: new Date()
    }]);
    
    try {
      // Map advisor mode IDs to prompt types
      let promptType: 'GENERAL_ADVISOR' | 'PORTFOLIO_ADVISOR' | 'NEWS_SUMMARY' | 'WEBSITE_HELP' | 'STOCK_RECOMMENDATIONS' = 'GENERAL_ADVISOR';
      
      // Adjust prompt type based on advisor mode
      switch (chat.mode.id) {
        case 'tax':
          promptType = 'GENERAL_ADVISOR'; // For tax advice
          break;
        case 'portfolio':
          promptType = 'PORTFOLIO_ADVISOR';
          break;
        case 'trading':
          promptType = 'GENERAL_ADVISOR'; // For trading advice
          break;
        case 'research':
        default:
          promptType = 'GENERAL_ADVISOR';
          break;
      }

      // Build context from the conversation history
      const conversationContext = 
        "Previous messages: " + messages.map(m => 
          `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        ).join('\n');
      
      // Call XAI API through the research service with conversation context
      const response = await getResearchResponse(
        `${conversationContext}\nUser: ${input}`, 
        promptType
      );
      
      // Remove the loading indicator
      setMessages(prev => prev.filter(msg => msg.id !== loadingIndicatorId));
      
      // Add the assistant's response all at once
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Remove the loading indicator if there was an error
      setMessages(prev => prev.filter(msg => msg.id !== loadingIndicatorId));
      
      console.error('Error getting response:', error);
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!chat) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageHeader
        title={chat.title}
        description={`${chat.mode.name} • ${chat.timestamp.toLocaleDateString()}`}
      >
        <button
          onClick={() => navigate('/research-chat')}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Advisor</span>
        </button>
      </PageHeader>
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="flex">
          {/* Sidebar */}
          <AdvisorSidebar />

          {/* Main Area */}
          <div className="flex-1 flex flex-col bg-gray-900">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto h-[500px]">
              <div className="h-full max-w-3xl mx-auto px-6">
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
                            {message.content === '' && (
                              <div className="flex space-x-1 ml-1">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                              </div>
                            )}
                          </div>
                        )}
                        {(message.role !== 'assistant' || message.content !== '') && (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        )}
                        <div className="mt-1 text-xs text-gray-400">
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
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
                    placeholder={`Continue the conversation...`}
                    className="flex-1 bg-[#333] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-blue-500 text-white rounded-lg px-4 py-2.5 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 