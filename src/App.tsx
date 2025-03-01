import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { StockMonitorPage } from './pages/StockMonitorPage';
import { StockDetailPage } from './pages/StockDetailPage';
import { LoginPage } from './components/LoginPage';
import { InvestorInsight } from './pages/InvestorInsight';
import { SettingsPage } from './pages/SettingsPage';
import { ResearchAssistantPage } from './pages/ResearchAssistantPage';
import { PricingPage } from './pages/PricingPage';
import { ServicesPage } from './pages/ServicesPage';
import { CommunityPage } from './pages/CommunityPage';
import { StockRecommendationsPage } from './pages/StockRecommendationsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorProvider } from './context/ErrorContext';
import { SettingsProvider } from './context/SettingsContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AboutPage } from './pages/AboutPage';
import { MainLayout } from './components/MainLayout';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <div className="relative">
        <main>
          <MainLayout>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
              } />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <div className="pt-16">
                    <DashboardPage />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/community" element={
                <ProtectedRoute>
                  <div className="pt-16">
                    <CommunityPage />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/stock-monitor" element={
                <ProtectedRoute>
                  <div className="pt-16">
                    <StockMonitorPage />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/investor-insight" element={
                <ProtectedRoute>
                  <div className="pt-16">
                    <InvestorInsight />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/research-chat" element={
                <ProtectedRoute>
                  <div>
                    <ResearchAssistantPage />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/stock-recommendations" element={
                <ProtectedRoute>
                  <StockRecommendationsPage />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <div className="pt-16">
                    <SettingsPage />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/stock/:symbol" element={
                <ProtectedRoute>
                  <div className="pt-16">
                    <StockDetailPage />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/about" element={
                <ProtectedRoute>
                  <div className="pt-16">
                    <AboutPage />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/pricing" element={
                <ProtectedRoute>
                  <div className="pt-16">
                    <PricingPage />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/resources" element={
                <ProtectedRoute>
                  <div className="pt-16">
                    <ServicesPage />
                  </div>
                </ProtectedRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </MainLayout>
        </main>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#1f2937',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900">
        <ErrorProvider>
          <Router>
            <AuthProvider>
              <SettingsProvider>
                <AppRoutes />
              </SettingsProvider>
            </AuthProvider>
          </Router>
        </ErrorProvider>
      </div>
    </ErrorBoundary>
  );
}