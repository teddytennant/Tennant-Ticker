import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SidebarToggle } from './SidebarToggle';
import { Bell, Search, User, X } from 'lucide-react';
import { useState, KeyboardEvent, FormEvent, ChangeEvent, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Logo } from './ui/logo';

export function Navigation() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Focus the input when mobile search is toggled on
  useEffect(() => {
    if (showMobileSearch && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [showMobileSearch]);

  const handleSearch = (e: KeyboardEvent<HTMLInputElement> | FormEvent<HTMLFormElement>) => {
    // Prevent form submission if this is a form event
    if ('preventDefault' in e) {
      e.preventDefault();
    }
    
    // Only proceed if this is an Enter key press or a form submission
    if ((e as KeyboardEvent).key === 'Enter' || 'preventDefault' in e) {
      if (searchQuery.trim()) {
        // Check if it looks like a stock symbol (1-5 uppercase letters)
        const isStockSymbol = /^[A-Z]{1,5}$/.test(searchQuery.trim());
        
        if (isStockSymbol) {
          navigate(`/stock/${searchQuery.trim()}`);
        } else {
          // If it's not a stock symbol format, search for it
          const searchPath = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
          
          // If we're already on the search page with the same query, force a reload
          // by adding a timestamp to make the URL unique
          if (location.pathname === '/search' && location.search.includes(searchQuery.trim())) {
            navigate(`${searchPath}&t=${Date.now()}`);
          } else {
            navigate(searchPath);
          }
        }
        
        // Clear the search input and hide mobile search
        setSearchQuery('');
        setShowMobileSearch(false);
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Don't render navigation for authenticated users
  if (isAuthenticated) {
    return (
      <header className="sticky top-0 left-0 right-0 z-[9999] w-full glass-panel shadow-lg" style={{ isolation: 'isolate' }}>
        <div className="pro-container">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-4 flex-shrink-0 lg:pl-0">
              <SidebarToggle />
              <Logo variant="default" />
            </div>
            
            {/* Desktop Search */}
            <div className="relative w-full max-w-2xl hidden md:block z-50 mx-6">
              <form onSubmit={handleSearch} style={{ pointerEvents: 'auto' }}>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300 pointer-events-none" />
                  <input 
                    ref={searchInputRef}
                    type="text" 
                    placeholder="Search stocks, news, insights..." 
                    className="w-full h-10 pl-11 pr-4 rounded-xl pro-input text-sm"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyDown={handleSearch}
                    onClick={(e) => e.stopPropagation()}
                    autoComplete="off"
                    id="main-search-input"
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Mobile Search Button */}
              <button 
                className="md:hidden pro-icon-container" 
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                aria-label="Toggle search"
              >
                <Search className="h-4 w-4" />
              </button>
              
              <button className="pro-icon-container relative group">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
              </button>
              
              <button className="pro-icon-container group">
                <User className="h-4 w-4 group-hover:text-white transition-colors duration-300" />
              </button>
            </div>
          </div>
          
          {/* Mobile Search Bar - shown when toggled */}
          {showMobileSearch && (
            <div className="py-3 px-3 md:hidden border-t border-white/[0.05]">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input 
                  ref={mobileSearchInputRef}
                  type="text" 
                  placeholder="Search stocks, news, insights..." 
                  className="w-full h-10 pl-11 pr-10 rounded-xl pro-input text-sm"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyDown={handleSearch}
                  autoComplete="off"
                />
                {searchQuery ? (
                  <button 
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setShowMobileSearch(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300"
                    aria-label="Close search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <nav className="sticky top-0 left-0 right-0 w-full z-[9999] glass-panel shadow-lg" style={{ isolation: 'isolate' }}>
      <div className="pro-container">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4 flex-shrink-0 lg:pl-0">
            <Logo variant="default" />
          </div>

          <div className="flex items-center gap-6 flex-shrink-0">
            <Link to="/pricing" className="pro-nav-link">
              Pricing
            </Link>
            <Link to="/resources" className="pro-nav-link">
              Services
            </Link>
            <Link to="/signin" className="pro-nav-link">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="pro-button-primary"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 