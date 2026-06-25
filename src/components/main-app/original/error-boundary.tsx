// @ts-nocheck
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service (e.g., Sentry)
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-white rounded-lg border border-[#E5E7EB] shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#DC2626] px-6 py-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-white" />
              <h1 className="text-xl font-semibold text-white">
                Application Error
              </h1>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div>
                <p className="text-[#111827] mb-2">
                  We're sorry, but something went wrong. The application encountered an unexpected error.
                </p>
                <p className="text-sm text-[#6B7280]">
                  Our team has been notified and is working to fix the issue. You can try one of the options below.
                </p>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                  <div className="bg-[#F9FAFB] px-4 py-2 border-b border-[#E5E7EB]">
                    <h3 className="text-sm font-semibold text-[#111827]">Error Details</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-[#6B7280] mb-1">Error Message:</div>
                      <div className="bg-[#FEE2E2] text-[#DC2626] px-3 py-2 rounded text-sm font-mono">
                        {this.state.error.message}
                      </div>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <div className="text-xs font-semibold text-[#6B7280] mb-1">Component Stack:</div>
                        <div className="bg-[#F9FAFB] text-[#111827] px-3 py-2 rounded text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto">
                          {this.state.errorInfo.componentStack}
                        </div>
                      </div>
                    )}
                    {this.state.error.stack && (
                      <div>
                        <div className="text-xs font-semibold text-[#6B7280] mb-1">Stack Trace:</div>
                        <div className="bg-[#F9FAFB] text-[#111827] px-3 py-2 rounded text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto">
                          {this.state.error.stack}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 px-4 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 px-4 py-3 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Go to Home
                </button>
                <button
                  onClick={this.handleReload}
                  className="px-4 py-3 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </button>
              </div>

              {/* Support Information */}
              <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                <h4 className="text-sm font-semibold text-[#111827] mb-2">Need Help?</h4>
                <p className="text-sm text-[#6B7280] mb-2">
                  If this problem persists, please contact support with the following information:
                </p>
                <ul className="text-sm text-[#6B7280] space-y-1">
                  <li>• Time of error: {new Date().toLocaleString()}</li>
                  <li>• Error ID: {Date.now().toString(36)}</li>
                  <li>• Browser: {navigator.userAgent}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Feature-specific error boundary for isolated error handling
interface FeatureErrorBoundaryProps {
  children: ReactNode;
  featureName: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class FeatureErrorBoundary extends Component<FeatureErrorBoundaryProps, State> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in ${this.props.featureName}:`, error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-6 m-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-[#92400E] mb-2">
                Error in {this.props.featureName}
              </h3>
              <p className="text-sm text-[#92400E] mb-3">
                This feature encountered an error and couldn't be displayed. The rest of the application should work normally.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-white border border-[#FDE68A] rounded p-3 mb-3">
                  <p className="text-xs font-mono text-[#DC2626]">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] text-sm font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

