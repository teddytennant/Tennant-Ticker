import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { memo, useEffect, useState, useRef } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Fixed ProtectedRoute that prevents re-render loops
export const ProtectedRoute = memo(function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Use synchronous approach only - no state changes that could cause re-renders
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Critical check: Prevent infinite redirect loop
    if (location.pathname === '/login') {
      return null; // Don't render anything if we're already on login page
    }
    
    // Otherwise redirect to login
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render children directly without state changes
  return <>{children}</>;
}); 