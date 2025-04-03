import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  LineChart,
  BarChart3,
  MessageSquare,
  ArrowRight,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppDock } from '../components/AppDock';

export function ServicesPage() {
  const { isAuthenticated } = useAuth();

  const services = [
    {
      title: 'Stock Monitor',
      description: 'Real-time stock tracking with advanced analytics and customizable alerts.',
      icon: LineChart,
      color: 'blue',
      features: [
        'Real-time market data',
        'Custom watchlists',
        'Price alerts',
        'Technical indicators',
        'Portfolio tracking',
      ],
      path: '/stock-monitor',
    },
    {
      title: 'Investor Insight',
      description: 'Comprehensive market analysis with live data and technical indicators.',
      icon: BarChart3,
      color: 'green',
      features: [
        'Advanced charting',
        'Market indicators',
        'Volume analysis',
        'Pattern recognition',
        'Historical data',
      ],
      path: '/investor-insight',
    },
    {
      title: 'AI Research Assistant',
      description: 'AI-powered research assistant to help you make informed decisions.',
      icon: MessageSquare,
      color: 'purple',
      features: [
        'Market sentiment analysis',
        'Company research',
        'News analysis',
        'Trend predictions',
        'Investment suggestions',
      ],
      path: '/research-chat',
    },
    {
      title: 'Market Analysis',
      description: 'Deep dive into market trends and advanced trading strategies.',
      icon: BarChart3,
      color: 'indigo',
      features: [
        'Technical analysis',
        'Trading strategies',
        'Risk assessment',
        'Market trends',
        'Performance metrics',
      ],
      path: '/market-analysis',
    },
  ];

  const additionalFeatures = [
    {
      title: 'Real-Time Updates',
      description: 'Get instant updates on market movements and news.',
      icon: TrendingUp,
      color: 'yellow',
    },
    {
      title: 'Global Coverage',
      description: 'Access markets and data from around the world.',
      icon: Star,
      color: 'indigo',
    },
    {
      title: 'Community',
      description: 'Connect with other traders and share insights.',
      icon: Users,
      color: 'pink',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24">
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

        {/* Main Services */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-white text-center mb-16">Core Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.title}
                className="group p-8 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:bg-gray-800/80"
              >
                <div className={`w-12 h-12 bg-${service.color}-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <service.icon className={`w-6 h-6 text-${service.color}-400`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{service.title}</h3>
                <p className="text-gray-400 mb-6">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-400">
                      <ArrowRight className="w-4 h-4 mr-2 text-blue-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to={isAuthenticated ? service.path : `/signup?from=${service.path.slice(1)}`}
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 group"
                >
                  {isAuthenticated ? "Try it now" : "Get started"}
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Features */}
        <div>
          <h2 className="text-3xl font-bold text-white text-center mb-16">Additional Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {additionalFeatures.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-${feature.color}-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* App Dock */}
      <AppDock />
    </div>
  );
} 