import { Link, useLocation } from 'react-router-dom';
import { LineChart, Lightbulb, Users, Info, X, Home, Bot, MessageSquareText, Twitter, MessageCircle } from 'lucide-react';
import { useSidebar } from '../contexts/SidebarContext';

const navigation = [
  {
    name: 'Home',
    path: '/',
    icon: Home,
  },
  {
    name: 'Stock Monitor',
    path: '/stock-monitor',
    icon: LineChart,
  },
  {
    name: 'Investor Insight',
    path: '/investor-insight',
    icon: Lightbulb,
  },
  {
    name: 'Research Assistant',
    path: '/research-chat',
    icon: Bot,
  },
  {
    name: 'About',
    path: '/about',
    icon: Info,
  },
];

export function Sidebar() {
  const location = useLocation();
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              to="/" 
              onClick={close}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
                TT
              </div>
              <span className="text-lg font-bold text-white">Tennant Ticker</span>
            </Link>
            <button
              onClick={close}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={close}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Social Media Links - Added at the bottom */}
          <div className="mt-auto pt-6 border-t border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Connect With Us</h3>
            <div className="flex space-x-3">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg text-blue-400 hover:bg-gray-700 transition-colors"
                title="Follow us on X (Twitter)"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://discord.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg text-indigo-400 hover:bg-gray-700 transition-colors"
                title="Join our Discord community"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 