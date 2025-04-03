import { Link } from 'react-router-dom';
import { LineChart, Shield, Code2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { AppDock } from '../components/AppDock';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <PageHeader
        title="About"
        subtitle="Learn more about our platform"
      />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-24">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Professional
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              Market Analysis Tools
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Advanced financial market intelligence platform designed for professional investors and traders.
          </p>
        </div>

        {/* Features Section */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-6 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LineChart className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-Time Analysis</h3>
              <p className="text-gray-400">
                Advanced stock monitoring with real-time data and technical indicators.
              </p>
            </div>
            <div className="group p-6 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Integration</h3>
              <p className="text-gray-400">
                AI-powered market research and predictive analytics capabilities.
              </p>
            </div>
            <div className="group p-6 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Security First</h3>
              <p className="text-gray-400">
                Enterprise-grade security protecting your data and investments.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div>
          <h2 className="text-3xl font-bold text-white text-center mb-12">Built With Modern Technology</h2>
          <div className="bg-gray-800/50 rounded-2xl p-8">
            <p className="text-gray-400 text-center max-w-3xl mx-auto">
              Our platform leverages cutting-edge technologies and APIs to provide accurate, real-time market data and analysis tools. We continuously update our systems to ensure you have access to the latest features and security measures.
            </p>
          </div>
        </div>
      </div>

      {/* App Dock */}
      <AppDock />
    </div>
  );
} 