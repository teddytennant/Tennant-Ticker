import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Calculator, Brain, PieChart, TrendingUp, FileText, HelpCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

// Message interface
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Chat interface
export interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  mode: AssistantMode;
  messages: Message[];
}

// Assistant mode interfaces
export interface AssistantMode {
  id: string;
  name: string;
  description: string;
  icon: any; // Lucide icon component
  systemPrompt: string;
  temperature: number;
}

interface AssistantContextType {
  modes: AssistantMode[];
  currentMode: AssistantMode;
  chats: Chat[];
  currentChat: Chat | null;
  setCurrentMode: (mode: AssistantMode) => void;
  createNewChat: (mode?: AssistantMode) => Chat;
  updateChat: (chatId: string, newMessages: Message[]) => void;
  deleteChat: (chatId: string) => void;
  clearAllChats: () => void;
  setCurrentChat: (chatId: string | null) => void;
}

// Define the different assistant modes
const assistantModes: AssistantMode[] = [
  {
    id: 'research',
    name: 'Research Assistant',
    description: 'Get comprehensive market research and analysis',
    icon: Brain,
    systemPrompt: `You are a financial research assistant on a professional stock monitoring platform. Provide users with in-depth market research, stock insights, industry trends, and investment strategies. Your responses should be data-driven, comprehensive, and professional. Avoid unnecessary disclaimers about certification unless directly asked about qualifications. Be concise but thorough in your analysis.`,
    temperature: 0.7
  },
  {
    id: 'tax',
    name: 'Tax Advisor',
    description: 'Get help with tax planning and optimization',
    icon: Calculator,
    systemPrompt: `You are a tax advisor on a financial platform. Provide users with tax planning strategies, information about tax implications of various investments, and general tax optimization advice. Your responses should be technically accurate but accessible to non-specialists. Always clarify that you're providing general information, not personalized tax advice. Focus on educational content about investment-related taxation concepts.`,
    temperature: 0.5
  },
  {
    id: 'portfolio',
    name: 'Portfolio Manager',
    description: 'Analyze and optimize your investment portfolio',
    icon: PieChart,
    systemPrompt: `You are a portfolio management assistant on a professional financial platform. Help users analyze their investment portfolios, suggest optimizations for diversification, risk management, and performance improvement. Focus on practical, actionable advice about asset allocation, rebalancing strategies, and portfolio construction principles. When discussing specific assets, focus on their role in a diversified portfolio rather than making specific buy/sell recommendations.`,
    temperature: 0.6
  },
  {
    id: 'trading',
    name: 'Trading Assistant',
    description: 'Get real-time trading advice and insights',
    icon: TrendingUp,
    systemPrompt: `You are a trading assistant on a professional financial platform. Provide users with insights on technical analysis, chart patterns, trading strategies, and market timing concepts. Your responses should be educational and focus on explaining various trading methodologies and risk management approaches. Avoid making specific trading recommendations, but rather explain how different approaches work and their potential applications. Emphasize the importance of risk management and proper position sizing.`,
    temperature: 0.7
  },
  {
    id: 'compliance',
    name: 'Compliance Advisor',
    description: 'Navigate regulations and compliance requirements',
    icon: ShieldCheck,
    systemPrompt: `You are a compliance advisor on a financial platform. Help users understand regulatory requirements, compliance best practices, and relevant laws affecting investors. Your responses should clarify complex regulatory concepts in accessible language without oversimplifying critical legal distinctions. Always clarify that you're providing general information about regulations, not legal advice. Focus on educational content about how regulations impact investment activities.`,
    temperature: 0.4
  },
  {
    id: 'help',
    name: 'Platform Guide',
    description: 'Get help using the platform features',
    icon: HelpCircle,
    systemPrompt: `You are a helpful assistant for a stock monitoring platform. Help users navigate the site and understand its features. The platform includes stock monitoring, portfolio tracking, market analysis, and research tools. Answer questions about how to use these features, find information, and maximize the platform's capabilities. Keep responses friendly, clear, and focused on practical guidance.`,
    temperature: 0.5
  }
];

// Create context
const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

// Provider component
export function AssistantProvider({ children }: { children: ReactNode }) {
  const [modes] = useState<AssistantMode[]>(assistantModes);
  const [currentMode, setCurrentMode] = useState<AssistantMode>(assistantModes[0]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChatState] = useState<Chat | null>(null);

  // Load chats from localStorage on initial render
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem('assistant_chats');
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        console.log('Loaded chats from localStorage:', parsedChats);
        setChats(parsedChats);
        
        // Set the most recent chat as current if there is no current chat
        if (parsedChats.length > 0 && !currentChat) {
          setCurrentChatState(parsedChats[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load chat history', error);
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('assistant_chats', JSON.stringify(chats));
    } catch (error) {
      console.error('Failed to save chat history', error);
    }
  }, [chats]);

  // Create a new chat
  const createNewChat = (mode?: AssistantMode) => {
    const selectedMode = mode || currentMode;
    const welcomeMessage = `Welcome to the ${selectedMode.name}. How can I help you today?`;
    
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New conversation",
      timestamp: new Date(),
      mode: selectedMode,
      messages: [
        {
          id: `system-${Date.now()}`,
          role: 'system',
          content: selectedMode.systemPrompt,
          timestamp: new Date()
        },
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date()
        }
      ]
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatState(newChat);
    return newChat;
  };

  // Update an existing chat
  const updateChat = (chatId: string, newMessages: Message[]) => {
    setChats(prev => {
      const updated = prev.map(chat => {
        if (chat.id === chatId) {
          // Update the title based on the first user message
          const firstUserMessage = [...chat.messages, ...newMessages].find(m => m.role === 'user');
          const title = firstUserMessage 
            ? firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '')
            : "New conversation";
            
          return {
            ...chat,
            title,
            messages: [...chat.messages, ...newMessages],
            timestamp: new Date() // Update timestamp to move this chat to the top
          };
        }
        return chat;
      });
      
      // Sort by most recent first
      return updated.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    });
  };

  // Delete a chat
  const deleteChat = (chatId: string) => {
    setChats(prev => {
      const remaining = prev.filter(chat => chat.id !== chatId);
      
      // If we're deleting the current chat, set a new current chat
      if (currentChat && currentChat.id === chatId) {
        setCurrentChatState(remaining.length > 0 ? remaining[0] : null);
      }
      
      return remaining;
    });
    toast.success("Chat deleted successfully");
  };

  // Clear all chats
  const clearAllChats = () => {
    setChats([]);
    setCurrentChatState(null);
    localStorage.removeItem('assistant_chats');
    toast.success("All chats cleared");
  };

  // Set current chat
  const setCurrentChat = (chatId: string | null) => {
    if (chatId === null) {
      setCurrentChatState(null);
      return;
    }
    
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatState(chat);
    } else {
      console.error(`Chat with ID ${chatId} not found`);
    }
  };

  return (
    <AssistantContext.Provider 
      value={{ 
        modes, 
        currentMode, 
        chats, 
        currentChat, 
        setCurrentMode, 
        createNewChat, 
        updateChat, 
        deleteChat, 
        clearAllChats, 
        setCurrentChat 
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

// Custom hook for using the context
export function useAssistant() {
  const context = useContext(AssistantContext);
  if (context === undefined) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
} 