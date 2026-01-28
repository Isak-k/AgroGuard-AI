import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { debugLog, errorTracker, isDev } from '@/utils/debug';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    debugLog.error('ErrorBoundary caught error', error);
    
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error info
    this.setState({ errorInfo });
    
    // Use our error tracker
    errorTracker.track(error, 'ErrorBoundary');
    
    debugLog.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Enhanced error logging for development
    if (isDev) {
      console.group('🚨 ErrorBoundary - Detailed Error Report');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Component stack:', errorInfo.componentStack);
      console.error('Error ID:', this.state.errorId);
      console.error('Timestamp:', new Date().toISOString());
      console.error('URL:', window.location.href);
      console.error('User Agent:', navigator.userAgent);
      console.groupEnd();
    }
    
    // Categorize error types for better debugging
    const errorCategories = [];
    if (error.message.includes('Firebase') || error.message.includes('auth') || error.message.includes('firestore')) {
      errorCategories.push('Firebase');
    }
    if (error.message.includes('theme') || error.message.includes('next-themes')) {
      errorCategories.push('Theme');
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      errorCategories.push('Network');
    }
    if (error.message.includes('chunk') || error.message.includes('loading')) {
      errorCategories.push('Code Splitting');
    }
    
    if (errorCategories.length > 0) {
      debugLog.warn(`Error categories detected: ${errorCategories.join(', ')}`);
    }
  }

  private handleReload = () => {
    debugLog.info('User triggered page reload from ErrorBoundary');
    window.location.reload();
  };

  private handleReset = () => {
    debugLog.info('User triggered error reset from ErrorBoundary');
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined });
  };

  private copyErrorDetails = () => {
    if (!this.state.error) return;
    
    const errorDetails = {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      error: {
        name: this.state.error.name,
        message: this.state.error.message,
        stack: this.state.error.stack
      },
      componentStack: this.state.errorInfo?.componentStack
    };
    
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => debugLog.success('Error details copied to clipboard'))
      .catch(err => debugLog.error('Failed to copy error details', err));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center max-w-2xl">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              The application encountered an unexpected error. Please try refreshing the page.
            </p>
            
            {isDev && this.state.errorId && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <Bug className="w-4 h-4 inline mr-1" />
                  Error ID: <code className="bg-background px-2 py-1 rounded">{this.state.errorId}</code>
                </p>
              </div>
            )}
            
            <div className="flex gap-3 justify-center mb-6">
              <Button onClick={this.handleReload} variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
              <Button onClick={this.handleReset} variant="outline">
                Try Again
              </Button>
              {isDev && (
                <>
                  <Button onClick={this.copyErrorDetails} variant="secondary" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Debug Info
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/error-diagnosis'} 
                    variant="secondary" 
                    size="sm"
                  >
                    <Bug className="w-4 h-4 mr-2" />
                    Diagnose
                  </Button>
                </>
              )}
            </div>
            
            {isDev && this.state.error && (
              <div className="text-left">
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
                    🐛 Error Details (Development Mode)
                  </summary>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded">
                      <h4 className="font-semibold text-sm mb-2">Error Information</h4>
                      <div className="text-xs space-y-1">
                        <div><strong>Name:</strong> {this.state.error.name}</div>
                        <div><strong>Message:</strong> {this.state.error.message}</div>
                        <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
                        <div><strong>URL:</strong> {window.location.href}</div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-muted rounded">
                      <h4 className="font-semibold text-sm mb-2">Stack Trace</h4>
                      <pre className="text-xs overflow-auto max-h-40 bg-background p-2 rounded">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    
                    {this.state.errorInfo?.componentStack && (
                      <div className="p-3 bg-muted rounded">
                        <h4 className="font-semibold text-sm mb-2">Component Stack</h4>
                        <pre className="text-xs overflow-auto max-h-40 bg-background p-2 rounded">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 text-blue-800 dark:text-blue-200">
                    🔧 Development Tips
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Check the browser console for additional error details</li>
                    <li>• Use the DevTools panel (🛠️ button) for real-time debugging</li>
                    <li>• Copy debug info and check recent code changes</li>
                    <li>• Try clearing browser cache and localStorage</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;