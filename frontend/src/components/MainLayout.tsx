import { ReactNode } from 'react';
import { DeploymentInfo } from './DeploymentInfo';
import { Sidebar } from './Sidebar';
import { Navigation } from './Navigation';
import { useSidebar } from '../context/SidebarContext';
import { AppDock } from './AppDock';
import { FeedbackForm } from './FeedbackForm';
import { Link } from 'react-router-dom';
import { Logo } from './ui/logo';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isOpen } = useSidebar();

  return (
    <div className="flex min-h-screen bg-[#0a0f1d] overflow-x-hidden relative">
      {/* Sidebar - highest z-index */}
      <div className="fixed inset-y-0 left-0 z-[10000]">
        <Sidebar />
      </div>
      
      {/* Main content wrapper - add left margin to account for sidebar */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 lg:ml-16">
        {/* Top navigation */}
        <Navigation />
        
        {/* Main content - scrollable */}
        <main className="flex-1 w-full overflow-x-hidden">
          <div className="pro-container py-4 md:py-6">
            {children}
          </div>
        </main>
        
        {/* Footer - stays at bottom */}
        <footer className="w-full py-4 glass-panel mt-auto">
          <div className="pro-container">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <Logo variant="default" showBeta={false} />
              
              <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Tennant Ticker. All rights reserved.
              </div>
              
              <div className="flex gap-6">
                <Link to="/privacy" className="pro-nav-link">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="pro-nav-link">
                  Terms of Service
                </Link>
                <a href="#" className="pro-nav-link">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
      
      {/* App dock - fixed */}
      <AppDock />
      
      {/* Deployment info - fixed */}
      <DeploymentInfo />
    </div>
  );
} 