import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navigation() {
  const { isAuthenticated } = useAuth();

  // Don't render navigation for authenticated users
  if (isAuthenticated) return null;

  return (
    <nav className="fixed w-full z-50 glass-effect-dark border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold text-white flex items-center">
              Tennant Ticker<span className="text-xs align-top ml-1">™</span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link to="/resources" className="text-gray-300 hover:text-white transition-colors">
              Services
            </Link>
            <Link to="/signin" className="text-gray-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 