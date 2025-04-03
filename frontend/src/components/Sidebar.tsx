import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LineChart, Lightbulb, Info, X, Home, Bot, Settings, Users, BarChart3, CalendarDays } from 'lucide-react'; // Added CalendarDays
import { useSidebar } from '../context/SidebarContext';
import { Logo } from './ui/logo';

const navigation = [
  {
    path: '/',
    icon: Home,
    label: 'Home'
  },
  {
    path: '/stock-monitor',
    icon: LineChart,
    label: 'Stock Monitor'
  },
  {
    path: '/economic-calendar', // Added Economic Calendar link
    icon: CalendarDays,
    label: 'Economic Calendar'
  },
  {
    path: '/investor-insight',
    icon: Lightbulb,
    label: 'Insights'
  },
  {
    path: '/assistant',
    icon: Bot,
    label: 'AI Advisor'
  },
  {
    path: '/stock-recommendations',
    icon: BarChart3,
    label: 'Analytics'
  },
  {
    path: '/settings',
    icon: Settings,
    label: 'Settings'
  },
  {
    path: '/about',
    icon: Info,
    label: 'About'
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-16 bg-card/90 backdrop-blur-md border-r border-border/30 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-2 flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-center mb-6 mt-4">
            <Logo variant="small" onClick={close} showBeta={false} />
          </div>
          
          <button
            onClick={close}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors mx-auto mb-6 lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Navigation Links */}
          <nav className="space-y-4 flex flex-col items-center flex-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={close}
                  className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all group relative ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                  title={item.label}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                  
                  {/* Tooltip - Only visible on hover */}
                  <span className="sidebar-tooltip absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md whitespace-nowrap z-50">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
