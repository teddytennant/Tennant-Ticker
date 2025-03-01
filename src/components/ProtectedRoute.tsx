import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, checkAuth } = useAuth();
  
  if (!isAuthenticated && !checkAuth()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
} 