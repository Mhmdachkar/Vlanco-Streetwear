import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorRecovery, PerformanceMonitor } from '@/utils/performance';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private errorRecovery = ErrorRecovery.getInstance();
  private performanceMonitor = PerformanceMonitor.getInstance();
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Record error in performance monitoring
    this.performanceMonitor.recordApiCall(0, false);
    
    // Handle error recovery
    this.errorRecovery.handleError(error, 'ErrorBoundary');
    
    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-900 rounded-lg p-6 border border-red-500/20">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              {/* Error Message */}
              <h2 className="text-xl font-bold text-red-400 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-300 mb-4">
                We're experiencing technical difficulties. Please try again.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mb-4 p-3 bg-gray-800 rounded border">
                  <summary className="cursor-pointer text-sm text-gray-400 mb-2">
                    Error Details
                  </summary>
                  <div className="text-xs text-gray-300 space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 text-xs overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 text-xs overflow-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                {this.state.retryCount < this.maxRetries && (
                  <button
                    onClick={this.handleRetry}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Try Again ({this.maxRetries - this.state.retryCount} left)
                  </button>
                )}
                <button
                  onClick={this.handleReload}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Reload Page
                </button>
              </div>

              {/* Performance Status */}
              <div className="mt-4 text-xs text-gray-500">
                <div>Error Count: {this.errorRecovery.getErrorCount()}</div>
                <div>Retry Attempt: {this.state.retryCount + 1}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for error handling in functional components
export function useErrorHandler() {
  const errorRecovery = ErrorRecovery.getInstance();
  const performanceMonitor = PerformanceMonitor.getInstance();

  const handleError = React.useCallback((error: Error, context: string = 'Unknown') => {
    errorRecovery.handleError(error, context);
    performanceMonitor.recordApiCall(0, false);
  }, []);

  return { handleError };
}

export default ErrorBoundary;
