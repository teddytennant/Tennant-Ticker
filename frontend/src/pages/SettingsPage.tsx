import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import {
  Bell,
  Sun,
  Shield,
  Info,
  ChevronRight
} from 'lucide-react';
import { AppDock } from '../components/AppDock';

export function SettingsPage() {
  const { settings, updateSettings } = useSettings();

  const navigationLinks = [
    { name: 'Product', items: [
      { name: 'Pricing', path: '/pricing' },
      { name: 'Services', path: '/resources' },
    ]},
    { name: 'Legal', items: [
      { name: 'Privacy', path: '/privacy' },
      { name: 'Terms', path: '/terms' },
    ]},
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">
            Customize your Tennant Ticker experience
          </p>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {navigationLinks.map((section) => (
            <div key={section.name} className="bg-gray-800/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">{section.name}</h2>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center justify-between px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    {item.name}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Account Info */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Account Information</h2>
              <p className="text-gray-400">Tennant Ticker Beta</p>
            </div>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
              Beta
            </span>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          <section className="bg-gray-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-blue-400" />
              Notifications
            </h2>
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <span className="text-gray-300">{
                      key === 'priceAlerts' ? 'Price Alerts' :
                      key === 'newsAlerts' ? 'News Alerts' :
                      key === 'marketOpenClose' ? 'Market Open/Close Alerts' :
                      'Email Updates'
                    }</span>
                  </label>
                  <button
                    onClick={() => updateSettings('notifications', key, !value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gray-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Sun className="w-5 h-5 mr-2 text-yellow-400" />
              Display
            </h2>
            <div className="space-y-4">
              {Object.entries(settings.display).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <span className="text-gray-300">{
                      key === 'darkMode' ? 'Dark Mode' :
                      key === 'compactView' ? 'Compact View' :
                      'Show Trading Hours'
                    }</span>
                  </label>
                  <button
                    onClick={() => updateSettings('display', key, !value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gray-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-400" />
              Privacy
            </h2>
            <div className="space-y-4">
              {Object.entries(settings.privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <span className="text-gray-300">{
                      key === 'shareAnalytics' ? 'Share Analytics' :
                      'Public Profile'
                    }</span>
                  </label>
                  <button
                    onClick={() => updateSettings('privacy', key, !value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gray-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-purple-400" />
              About
            </h2>
            <div className="space-y-2 text-gray-400">
              <p>Version: Beta</p>
              <p>© 2025 Tennant Ticker. All rights reserved.</p>
              <div className="flex gap-4 mt-4">
                <Link to="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">Terms of Service</Link>
                <Link to="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">Privacy Policy</Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* App Dock */}
      <AppDock />
    </div>
  );
} 