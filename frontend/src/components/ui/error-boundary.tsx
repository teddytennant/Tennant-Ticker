import React, { Component, ErrorInfo, ReactNode, useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isApiError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isApiError: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is an API connection error
    const isApiError = 
      error.message?.includes('Network Error') || 
      error.message?.includes('ERR_CONNECTION_REFUSED') ||
      error.message?.includes('Failed to fetch');
      
    return {
      hasError: true,
      error,
      isApiError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isApiError: false
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Show a more specific message for API connection errors
      if (this.state.isApiError) {
        return (
          <div className="pro-section flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-8 w-8 text-blue-500"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 className="pro-heading mb-2">Connection Issue</h2>
            <p className="pro-subheading max-w-md mb-6">
              We're having trouble connecting to the server. The application will use offline data where possible.
            </p>
            
            <button 
              onClick={this.handleReset}
              className="pro-button-primary flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        );
      }
      
      return (
        <div className="pro-section flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-8 w-8 text-destructive"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h2 className="pro-heading mb-2">Something went wrong</h2>
          <p className="pro-subheading max-w-md mb-6">
            We apologize for the inconvenience. The application encountered an unexpected error.
          </p>
          
          <div className="pro-card p-4 mb-6 max-w-md mx-auto text-left overflow-auto max-h-48">
            <p className="font-mono text-sm text-destructive mb-2">{this.state.error?.toString()}</p>
            {this.state.errorInfo && (
              <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </div>
          
          <button 
            onClick={this.handleReset}
            className="pro-button-primary flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// A simpler error boundary that just shows a fallback UI
export function SimpleErrorBoundary({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error('Error caught by window error handler:', event.error);
      setHasError(true);
    };
    
    window.addEventListener('error', errorHandler);
    
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);
  
  if (hasError) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="p-4 bg-red-500/10 text-red-500 rounded-lg">
        Something went wrong. Please try again.
      </div>
    );
  }
  
  return <>{children}</>;
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
  }
): React.ComponentType<P> {
  return function WithErrorBoundary(props: P): JSX.Element {
    return (
      <ErrorBoundary fallback={options?.fallback} onError={options?.onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
} 