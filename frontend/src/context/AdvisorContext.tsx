import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import toast from 'react-hot-toast';

export interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  mode: AdvisorMode;
  preview: string;
}

export interface AdvisorMode {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface AdvisorContextType {
  currentMode: AdvisorMode;
  availableModes: AdvisorMode[];
  previousChats: Chat[];
  usePortfolioContext: boolean;
  setUsePortfolioContext: (value: boolean) => void;
  setCurrentMode: (mode: AdvisorMode) => void;
  addChat: (chat: Omit<Chat, 'id' | 'timestamp'>) => void;
  deleteChat: (id: string) => void;
  clearAllChats: () => void;
  getChatById: (id: string) => Chat | undefined;
}

const defaultModes: AdvisorMode[] = [
  {
    id: 'research',
    name: 'Research Assistant',
    description: 'Get comprehensive market research and analysis',
    icon: 'Brain'
  },
  {
    id: 'tax',
    name: 'Tax Advisor',
    description: 'Get help with tax planning and optimization',
    icon: 'Calculator'
  },
  {
    id: 'portfolio',
    name: 'Portfolio Manager',
    description: 'Analyze and optimize your investment portfolio',
    icon: 'PieChart'
  },
  {
    id: 'trading',
    name: 'Trading Assistant',
    description: 'Get real-time trading advice and insights',
    icon: 'TrendingUp'
  }
];

const AdvisorContext = createContext<AdvisorContextType | undefined>(undefined);

export function AdvisorProvider({ children }: { children: ReactNode }) {
  const [currentMode, setCurrentMode] = useState<AdvisorMode>(defaultModes[0]);
  const [availableModes] = useState<AdvisorMode[]>(defaultModes);
  const [previousChats, setPreviousChats] = useState<Chat[]>([]);
  const [usePortfolioContext, setUsePortfolioContext] = useState<boolean>(true);

  // Load chat history and settings from localStorage on initial render
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem('advisor_chats');
      if (savedChats) {
        try {
          const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
            ...chat,
            timestamp: new Date(chat.timestamp)
          }));
          console.log('Loaded chats from localStorage:', parsedChats);
          setPreviousChats(parsedChats);
        } catch (e) {
          console.error('Failed to parse saved chats, resetting:', e);
          localStorage.removeItem('advisor_chats');
        }
      }
      
      // Load portfolio context preference
      const savedPortfolioContext = localStorage.getItem('advisor_use_portfolio_context');
      if (savedPortfolioContext !== null) {
        setUsePortfolioContext(JSON.parse(savedPortfolioContext));
      }
    } catch (error) {
      console.error('Failed to load chat history or settings', error);
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('advisor_chats', JSON.stringify(previousChats));
      console.log('Saved chats to localStorage:', previousChats);
    } catch (error) {
      console.error('Failed to save chat history', error);
    }
  }, [previousChats]);
  
  // Save portfolio context preference whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('advisor_use_portfolio_context', JSON.stringify(usePortfolioContext));
    } catch (error) {
      console.error('Failed to save portfolio context preference', error);
    }
  }, [usePortfolioContext]);

  const addChat = (chat: Omit<Chat, 'id' | 'timestamp'>) => {
    const newChat: Chat = {
      ...chat,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setPreviousChats(prev => {
      const newChats = [newChat, ...prev];
      console.log('Added new chat:', newChat);
      return newChats;
    });
  };

  const deleteChat = (id: string) => {
    console.log("AdvisorContext: Attempting to delete chat with ID:", id);
    
    if (!id) {
      console.error("Delete chat failed: Invalid ID provided");
      toast.error("Unable to delete chat: Invalid ID");
      return;
    }
    
    // Log the chat we're trying to delete
    const chatToDelete = previousChats.find(chat => chat.id === id);
    if (!chatToDelete) {
      console.error("Delete chat failed: Chat not found with ID:", id);
      toast.error("Unable to delete chat: Not found");
      return;
    }
    
    console.log("Deleting chat:", chatToDelete);
    
    // Filter out the chat and update state
    setPreviousChats(prev => {
      const remaining = prev.filter(chat => chat.id !== id);
      console.log("Chats remaining after deletion:", remaining);
      
      // Immediately update localStorage to be sure
      try {
        localStorage.setItem('advisor_chats', JSON.stringify(remaining));
      } catch (error) {
        console.error('Failed to save updated chat history after deletion', error);
      }
      
      return remaining;
    });
    
    toast.success("Chat deleted successfully");
  };

  const clearAllChats = () => {
    console.log("AdvisorContext: Clearing all chats");
    setPreviousChats([]);
    // Immediately clear localStorage
    localStorage.removeItem('advisor_chats');
    toast.success("All chats cleared");
  };

  const getChatById = (id: string) => {
    return previousChats.find(chat => chat.id === id);
  };

  return (
    <AdvisorContext.Provider 
      value={{ 
        currentMode, 
        availableModes, 
        previousChats, 
        usePortfolioContext,
        setUsePortfolioContext,
        setCurrentMode, 
        addChat, 
        deleteChat,
        clearAllChats,
        getChatById
      }}
    >
      {children}
    </AdvisorContext.Provider>
  );
}

export function useAdvisor() {
  const context = useContext(AdvisorContext);
  if (context === undefined) {
    throw new Error('useAdvisor must be used within an AdvisorProvider');
  }
  return context;
} 