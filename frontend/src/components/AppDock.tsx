import { Link, useLocation } from 'react-router-dom';
import { 
  LineChart, 
  BarChart3, 
  MessageSquareText, 
  Home,
  Settings,
  TrendingUp,
  Lightbulb,
  Brain
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { MinimalDock, MinimalDockItem, MinimalDockIcon } from './ui/minimal-dock';

interface AppDockProps {
  className?: string;
  activeItem?: string;
}

export function AppDock({ className, activeItem }: AppDockProps) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state to true on component mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render the dock if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Get the active path from location
  const activePath = location.pathname.split('/')[1];
  
  // Build navigation items with proper active state
  const navItems = [
    { 
      name: 'Home', 
      path: '/', 
      icon: Home,
      active: activePath === '' || activePath === 'home' || activeItem === 'home'
    },
    { 
      name: 'Markets', 
      path: '/investor-insight', 
      icon: BarChart3,
      active: activePath === 'investor-insight' || activeItem === 'markets'
    },
    { 
      name: 'Stocks', 
      path: '/stock-monitor', 
      icon: LineChart,
      active: activePath === 'stock-monitor' || activePath === 'stock' || activeItem === 'stocks'
    },
    { 
      name: 'Assistant', 
      path: '/assistant', 
      icon: Brain,
      active: activePath === 'assistant' || activeItem === 'assistant'
    },
    { 
      name: 'Research', 
      path: '/research-chat', 
      icon: Lightbulb,
      active: activePath === 'research-chat' || activePath === 'chat' || activeItem === 'research'
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: Settings,
      active: activePath === 'settings' || activeItem === 'settings'
    }
  ];
  
  const isActive = (path: string) => {
    if (activeItem) {
      if (activeItem === 'monitor' && path === '/stock-monitor') return true;
      if (activeItem === 'home' && path === '/') return true;
      if (activeItem === 'insight' && path === '/investor-insight') return true;
      if (activeItem === 'recommendations' && path === '/stock-recommendations') return true;
      if (activeItem === 'chat' && path === '/research-chat') return true;
      if (activeItem === 'assistant' && path === '/assistant') return true;
      if (activeItem === 'settings' && path === '/settings') return true;
      return false;
    }
    return location.pathname === path;
  };
  
  const getIconColor = (path: string) => {
    return isActive(path) ? 'text-blue-400' : 'text-gray-400';
  };

  const getIconBackground = (path: string) => {
    return isActive(path) ? 'bg-[#1a2344]' : 'bg-transparent';
  };

  // Hide AppDock on larger screens where sidebar is visible
  const [showDock, setShowDock] = useState(true);
  
  useEffect(() => {
    const handleResize = () => {
      setShowDock(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!showDock) return null;

  return (
    <div className={cn("fixed bottom-6 left-1/2 -translate-x-1/2 z-50", className)}>
      <div 
        className="border rounded-full shadow-lg p-2 flex items-center justify-center"
        style={{ 
          backgroundColor: '#0f1429', 
          borderColor: '#1a2344'
        }}
      >
        <Link 
          to="/" 
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full mx-1 transition-colors", 
            getIconBackground('/')
          )}
        >
          <Home className={`w-5 h-5 ${getIconColor('/')}`} />
        </Link>
        
        <Link 
          to={isAuthenticated ? "/stock-monitor" : "/signup"} 
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full mx-1 transition-colors", 
            getIconBackground('/stock-monitor')
          )}
        >
          <LineChart className={`w-5 h-5 ${getIconColor('/stock-monitor')}`} />
        </Link>
        
        <Link 
          to={isAuthenticated ? "/investor-insight" : "/signup"} 
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full mx-1 transition-colors", 
            getIconBackground('/investor-insight')
          )}
        >
          <Lightbulb className={`w-5 h-5 ${getIconColor('/investor-insight')}`} />
        </Link>
        
        <Link 
          to={isAuthenticated ? "/assistant" : "/signup"} 
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full mx-1 transition-colors", 
            getIconBackground('/assistant')
          )}
        >
          <Brain className={`w-5 h-5 ${getIconColor('/assistant')}`} />
        </Link>
        
        <Link 
          to={isAuthenticated ? "/research-chat" : "/signup"} 
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full mx-1 transition-colors", 
            getIconBackground('/research-chat')
          )}
        >
          <MessageSquareText className={`w-5 h-5 ${getIconColor('/research-chat')}`} />
        </Link>
        
        {isAuthenticated && (
          <Link 
            to="/settings" 
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full mx-1 transition-colors", 
              getIconBackground('/settings')
            )}
          >
            <Settings className={`w-5 h-5 ${getIconColor('/settings')}`} />
          </Link>
        )}
      </div>
    </div>
  );
} 