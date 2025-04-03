import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense, lazy, useState, useEffect, memo, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './components/LoginPage';
// Correctly import the ResearchAssistantPage component
import { ResearchAssistantPage } from './pages/ResearchAssistantPage'; 
import { ChatDetail } from './pages/ChatDetail';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorProvider } from './context/ErrorContext';
import { SettingsProvider } from './context/SettingsContext';
import { SidebarProvider } from './context/SidebarContext';
import { AdvisorProvider } from './context/AdvisorContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/MainLayout';
import { LoadingScreen, ErrorScreen } from './components/ui/loading-screen';
import { ErrorBoundary } from './components/ui/error-boundary';
import StockRecommendationsPage from './pages/StockRecommendationsPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { AssistantProvider } from './context/AssistantContext';
import { GlobalNotifications } from './components/GlobalNotifications';

// Prevent route change loops by storing the last navigation time
window.__LAST_NAVIGATION_TIME = window.__LAST_NAVIGATION_TIME || 0;
window.__NAVIGATION_COUNT = window.__NAVIGATION_COUNT || 0;

// Custom router watcher component
const RouterDebugger = () => {
  useEffect(() => {
    const now = Date.now();
    window.__NAVIGATION_COUNT++;
    
    // If navigations are happening too frequently, log a warning
    if (now - window.__LAST_NAVIGATION_TIME < 1000) {
      console.warn(`Rapid navigation detected: ${window.__NAVIGATION_COUNT} navigations in the last second`);
      
      // If we have too many navigations in a short time, it might be a loop
      if (window.__NAVIGATION_COUNT > 5) {
        console.error('Possible navigation loop detected!');
      }
    } else {
      // Reset counter after a second of no rapid navigation
      window.__NAVIGATION_COUNT = 1;
    }
    
    window.__LAST_NAVIGATION_TIME = now;
    console.log(`Navigation to: ${window.location.pathname}`);
    
    return () => {
      console.log(`Leaving: ${window.location.pathname}`);
    };
  }, []);
  
  return null;
};

// Handle lazy loading fallback errors
const tryCatchImport = async (importFn: () => Promise<any>, fallback: string) => {
  try {
    return await importFn();
  } catch (error) {
    console.error(`Error loading module "${fallback}":`, error);
    // Return a simple component that displays the error
    return {
      default: (props: any) => (
        <div className="p-6 bg-gray-800 rounded-lg border border-red-500/30 mx-auto my-8 max-w-xl">
          <h2 className="text-xl font-bold text-red-400 mb-3">Module Failed to Load</h2>
          <p className="text-gray-300 mb-4">There was an error loading the <strong>{fallback}</strong> module.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )
    };
  }
};

// Lazy load other non-critical pages safely
const DashboardPage = lazy(() => 
  tryCatchImport(
    () => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })),
    "DashboardPage"
  )
);

const StockMonitorPage = lazy(() => 
  tryCatchImport(
    () => import('./pages/StockMonitorPage').then(module => ({ default: module.StockMonitorPage })),
    "StockMonitorPage"
  )
);

const StockDetailPage = lazy(() => 
  tryCatchImport(
    () => import('./pages/StockDetailPage').then(module => ({ default: module.StockDetailPage })),
    "StockDetailPage"
  )
);

const SearchPage = lazy(() => 
  tryCatchImport(
    () => import('./pages/SearchPage').then(module => ({ default: module.SearchPage })),
    "SearchPage"
  )
);

const InvestorInsight = lazy(() => 
  tryCatchImport(
    () => import('./pages/InvestorInsight').then(module => ({ default: module.InvestorInsight })),
    "InvestorInsight"
  )
);

const SettingsPage = lazy(() => 
  tryCatchImport(
    () => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })),
    "SettingsPage"
  )
);

const PricingPage = lazy(() => 
  tryCatchImport(
    () => import('./pages/PricingPage').then(module => ({ default: module.PricingPage })),
    "PricingPage"
  )
);

const ServicesPage = lazy(() => 
  tryCatchImport(
    () => import('./pages/ServicesPage').then(module => ({ default: module.ServicesPage })),
    "ServicesPage"
  )
);

const CommunityPage = lazy(() => 
  tryCatchImport(
    () => import('./pages/CommunityPage').then(module => ({ default: module.CommunityPage })),
    "CommunityPage"
  )
);

const AboutPage = lazy(() => 
  tryCatchImport(
    () => import('./pages/AboutPage').then(module => ({ default: module.AboutPage })),
    "AboutPage"
  )
);

const EconomicCalendarPage = lazy(() =>
  tryCatchImport(
    () => import('./pages/EconomicCalendarPage').then(module => ({ default: module.default })), // Assuming default export
    "EconomicCalendarPage"
  )
);

// Remove potentially conflicting ModernResearchAssistant import
// const ModernResearchAssistant = lazy(() =>
//   tryCatchImport(
//     () => import('./pages/ModernResearchAssistant').then(module => ({ default: module.ModernResearchAssistant })),
//     "ModernResearchAssistant"
//   )
// );

// Create a stable fallback component for Suspense
const SuspenseFallback = memo(() => <LoadingScreen message="Loading content..." />);

// Wrap each lazy-loaded component to reduce nesting and simplify error handling
const LazyPageWrapper = memo(({ component: Component }: { component: React.ComponentType }) => (
  <ErrorBoundary>
    <Suspense fallback={<SuspenseFallback />}>
      <Component />
    </Suspense>
  </ErrorBoundary>
));

const AppRoutes = memo(function AppRoutes() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [appReady, setAppReady] = useState(true); // Set to true by default to skip initialization
  const [loadingError, setLoadingError] = useState(false);

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (loadingError) {
    return (
      <ErrorScreen 
        message="We're having trouble loading the application. Please try refreshing the page."
        onRefresh={() => window.location.reload()}
      />
    );
  }

  if (!appReady) {
    return <LoadingScreen message="Initializing application..." />;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <RouterDebugger />
      <Routes>
        {/* Public route */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        } />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <HomePage />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Route for stock recommendations with direct import - no lazy loading */}
        <Route path="/stock-recommendations" element={
          <ProtectedRoute>
            <MainLayout>
              <StockRecommendationsPage />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Other routes with lazy loading */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <MainLayout>
              <LazyPageWrapper component={DashboardPage} />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/stock-monitor" element={
          <ProtectedRoute>
            <MainLayout>
              <LazyPageWrapper component={StockMonitorPage} />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/investor-insight" element={
          <ProtectedRoute>
            <MainLayout>
              <LazyPageWrapper component={InvestorInsight} />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/research-chat" element={
          <ProtectedRoute>
            <MainLayout>
              {/* Use the correctly imported component */}
              <ResearchAssistantPage /> 
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/chat/:chatId" element={
          <ProtectedRoute>
            <MainLayout>
              <ChatDetail />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/stock/:symbol" element={
          <ProtectedRoute>
            <MainLayout>
              <LazyPageWrapper component={StockDetailPage} />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/search" element={
          <ProtectedRoute>
            <MainLayout>
              <LazyPageWrapper component={SearchPage} />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <MainLayout>
              <LazyPageWrapper component={SettingsPage} />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/about" element={
          <ProtectedRoute>
            <MainLayout>
              <LazyPageWrapper component={AboutPage} />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/pricing" element={
          <ProtectedRoute>
            <MainLayout>
              <LazyPageWrapper component={PricingPage} />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/resources" element={
          <ProtectedRoute>
            <MainLayout>
              <LazyPageWrapper component={ServicesPage} />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/community" element={
          <ProtectedRoute>
            <MainLayout>
              <LazyPageWrapper component={CommunityPage} />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/privacy" element={
          <ProtectedRoute>
            <MainLayout>
              <PrivacyPolicy />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/terms" element={
          <ProtectedRoute>
            <MainLayout>
              <TermsOfService />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/economic-calendar" element={
          <ProtectedRoute>
            <MainLayout>
              <LazyPageWrapper component={EconomicCalendarPage} />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Remove potentially conflicting /assistant route */}
        {/* <Route path="/assistant" element={
          <ProtectedRoute>
            <MainLayout>
              <LazyPageWrapper component={ModernResearchAssistant} />
            </MainLayout>
          </ProtectedRoute>
        } /> */}

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
});

// Add a global error handler to catch and display API-related errors
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  
  // Check if it's an API connection error
  if (error?.message?.includes('Network Error') || error?.code === 'ERR_NETWORK' || error?.code === 'ECONNREFUSED') {
    console.error('API connection error detected:', error);
    // Prevent the default "Something went wrong" screen for API connection errors
    event.preventDefault();
  }
});

// Use the existing AppRoutes component instead of inline routes
export function App() {
  return (
    <ErrorBoundary fallback={<ErrorScreen />}>
      <Router>
        <AuthProvider>
          <ErrorProvider>
            <SettingsProvider>
              <SidebarProvider>
                <AdvisorProvider>
                  <AssistantProvider>
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 3000,
                        style: {
                          background: '#2c3440',
                          color: '#fff',
                          borderRadius: '8px',
                        },
                      }}
                    />
                    <GlobalNotifications />
                    <Suspense fallback={<SuspenseFallback />}>
                      <AppRoutes />
                    </Suspense>
                  </AssistantProvider>
                </AdvisorProvider>
              </SidebarProvider>
            </SettingsProvider>
          </ErrorProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
