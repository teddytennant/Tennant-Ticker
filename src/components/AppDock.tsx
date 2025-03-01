import { Link, useLocation } from 'react-router-dom';
import { Dock, DockIcon, DockItem, DockLabel } from './ui/dock';
import { 
  LineChart, 
  BarChart3, 
  MessageSquareText, 
  Home,
  Settings,
  MessageCircle,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { GlobalChat } from './GlobalChat';
import { cn } from '../lib/utils';

interface AppDockProps {
  className?: string;
}

export function AppDock({ className }: AppDockProps) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const getIconColor = (path: string) => {
    return isActive(path) ? 'text-blue-400' : 'text-gray-400';
  };

  const toggleChat = () => {
    if (showChat) {
      setIsChatMinimized(!isChatMinimized);
    } else {
      setShowChat(true);
      setIsChatMinimized(false);
    }
  };

  return (
    <>
      {showChat && (
        <GlobalChat 
          onClose={() => setShowChat(false)} 
          isMinimized={isChatMinimized}
          onMinimize={() => setIsChatMinimized(!isChatMinimized)}
        />
      )}
      
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <Dock className="border border-gray-700 bg-gray-800/90 backdrop-blur-sm shadow-lg rounded-full py-2">
          <DockItem className="p-2">
            <DockIcon>
              <Link to="/" className="flex items-center justify-center">
                <Home className={`w-5 h-5 ${getIconColor('/')}`} />
              </Link>
            </DockIcon>
            <DockLabel className="bg-gray-800 text-gray-200 border border-gray-700">Home</DockLabel>
          </DockItem>
          
          <DockItem className="p-2">
            <DockIcon>
              <Link to={isAuthenticated ? "/stock-monitor" : "/signup"} className="flex items-center justify-center">
                <LineChart className={`w-5 h-5 ${getIconColor('/stock-monitor')}`} />
              </Link>
            </DockIcon>
            <DockLabel className="bg-gray-800 text-gray-200 border border-gray-700">Stock Monitor</DockLabel>
          </DockItem>
          
          <DockItem className="p-2">
            <DockIcon>
              <Link to={isAuthenticated ? "/investor-insight" : "/signup"} className="flex items-center justify-center">
                <BarChart3 className={`w-5 h-5 ${getIconColor('/investor-insight')}`} />
              </Link>
            </DockIcon>
            <DockLabel className="bg-gray-800 text-gray-200 border border-gray-700">Investor Insight</DockLabel>
          </DockItem>
          
          <DockItem className="p-2">
            <DockIcon>
              <Link to={isAuthenticated ? "/stock-recommendations" : "/signup"} className="flex items-center justify-center">
                <TrendingUp className={`w-5 h-5 ${getIconColor('/stock-recommendations')}`} />
              </Link>
            </DockIcon>
            <DockLabel className="bg-gray-800 text-gray-200 border border-gray-700">AI Recommendations</DockLabel>
          </DockItem>
          
          <DockItem className="p-2">
            <DockIcon>
              <Link to={isAuthenticated ? "/research-chat" : "/signup"} className="flex items-center justify-center">
                <MessageSquareText className={`w-5 h-5 ${getIconColor('/research-chat')}`} />
              </Link>
            </DockIcon>
            <DockLabel className="bg-gray-800 text-gray-200 border border-gray-700">Research Chat</DockLabel>
          </DockItem>
          
          {isAuthenticated && (
            <DockItem className="p-2">
              <DockIcon>
                <Link to="/settings" className="flex items-center justify-center">
                  <Settings className={`w-5 h-5 ${getIconColor('/settings')}`} />
                </Link>
              </DockIcon>
              <DockLabel className="bg-gray-800 text-gray-200 border border-gray-700">Settings</DockLabel>
            </DockItem>
          )}
          
          {/* Chat button with white circle emphasis */}
          <DockItem className="p-2 ml-1 relative">
            <div className="absolute inset-0 bg-white/20 rounded-full"></div>
            <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse"></div>
            <DockIcon>
              <button 
                onClick={toggleChat} 
                className="flex items-center justify-center w-full h-full relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-blue-400/30 rounded-full"></div>
                <MessageCircle className={`w-5 h-5 relative z-10 ${showChat ? 'text-blue-400' : 'text-white'}`} />
              </button>
            </DockIcon>
            <DockLabel className="bg-gray-800 text-gray-200 border border-gray-700">AI Assistant</DockLabel>
          </DockItem>
        </Dock>
      </div>
    </>
  );
} 