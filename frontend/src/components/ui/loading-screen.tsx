import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({ message = 'Loading...', fullScreen = true }: LoadingScreenProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50' : 'py-12'}`}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-4 border-primary/30"></div>
        </div>
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
      <p className="mt-4 text-lg font-medium text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
}

interface ErrorScreenProps {
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  fullScreen?: boolean;
  type?: 'generic' | 'api' | 'network';
  onRefresh?: () => void;
}

export function ErrorScreen({ 
  message = 'Something went wrong', 
  error, 
  onRetry,
  fullScreen = true,
  type = 'generic',
  onRefresh = () => window.location.reload()
}: ErrorScreenProps) {
  // Check if it's a network error based on the error message
  const errorMessage = typeof error === 'string' ? error : error?.message || '';
  const isNetworkError = errorMessage.includes('Network Error') || 
                         errorMessage.includes('ERR_CONNECTION_REFUSED') ||
                         errorMessage.includes('Failed to fetch');
  
  // If type is 'generic' but it appears to be a network error, override the type
  const errorType = type === 'generic' && isNetworkError ? 'network' : type;
  
  // Get display message based on error type
  const displayMessage = errorType === 'network' || errorType === 'api'
    ? 'Connection Issue'
    : message;
    
  // Get description based on error type
  const description = errorType === 'network' || errorType === 'api'
    ? "We're having trouble connecting to the server. The application will use offline data where possible."
    : (typeof error === 'string' ? error : error?.message);
  
  // Icon and color based on error type
  const iconColor = errorType === 'network' || errorType === 'api' ? 'text-blue-500' : 'text-destructive';
  const bgColor = errorType === 'network' || errorType === 'api' ? 'bg-blue-500/10' : 'bg-destructive/10';
  
  return (
    <div className={`flex flex-col items-center justify-center text-center ${fullScreen ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50' : 'py-12'}`}>
      <div className={`w-16 h-16 rounded-full ${bgColor} flex items-center justify-center mb-4`}>
        {errorType === 'network' || errorType === 'api' ? (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={`h-8 w-8 ${iconColor}`}
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={`h-8 w-8 ${iconColor}`}
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        )}
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">{displayMessage}</h2>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-4">
          {description}
        </p>
      )}
      <div className="flex gap-3">
        {onRetry && (
          <button 
            onClick={onRetry}
            className="pro-button-primary"
          >
            Try Again
          </button>
        )}
        {(errorType === 'network' || errorType === 'api') && (
          <button 
            onClick={onRefresh}
            className="pro-button-secondary"
          >
            Refresh Page
          </button>
        )}
      </div>
    </div>
  );
} 