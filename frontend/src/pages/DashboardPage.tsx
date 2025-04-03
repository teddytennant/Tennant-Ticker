import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Users, MessageSquare, Settings } from 'lucide-react';
import { AppDock } from '../components/AppDock';

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Welcome to Your Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stock Monitor Card */}
          <Link
            to="/stock-monitor"
            className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-300"
          >
            <div className="flex items-center mb-4">
              <BarChart3 className="w-8 h-8 text-blue-500" />
              <h2 className="text-xl font-semibold text-white ml-3">Stock Monitor</h2>
            </div>
            <p className="text-gray-400">Track and analyze your favorite stocks in real-time with advanced monitoring tools.</p>
          </Link>

          {/* Investor Insight Card */}
          <Link
            to="/investor-insight"
            className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-300"
          >
            <div className="flex items-center mb-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <h2 className="text-xl font-semibold text-white ml-3">Investor Insight</h2>
            </div>
            <p className="text-gray-400">Get detailed insights and analysis to make informed investment decisions.</p>
          </Link>

          {/* Research Assistant Card */}
          <Link
            to="/research-chat"
            className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-300"
          >
            <div className="flex items-center mb-4">
              <MessageSquare className="w-8 h-8 text-purple-500" />
              <h2 className="text-xl font-semibold text-white ml-3">Research Assistant</h2>
            </div>
            <p className="text-gray-400">Chat with our AI assistant to get instant answers to your investment questions.</p>
          </Link>

          {/* Community Card */}
          <Link
            to="/community"
            className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-300"
          >
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-indigo-500" />
              <h2 className="text-xl font-semibold text-white ml-3">Community</h2>
            </div>
            <p className="text-gray-400">Connect with other investors, share insights, and learn from the community.</p>
          </Link>

          {/* Settings Card */}
          <Link
            to="/settings"
            className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-300"
          >
            <div className="flex items-center mb-4">
              <Settings className="w-8 h-8 text-gray-500" />
              <h2 className="text-xl font-semibold text-white ml-3">Settings</h2>
            </div>
            <p className="text-gray-400">Customize your experience and manage your account preferences.</p>
          </Link>
        </div>
      </div>

      {/* App Dock */}
      <AppDock />
    </div>
  );
} 