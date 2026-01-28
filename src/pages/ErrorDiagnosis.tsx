import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { debugLog } from '@/utils/debug';

interface DiagnosticTest {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  error?: string;
}

export default function ErrorDiagnosis() {
  const [tests, setTests] = useState<DiagnosticTest[]>([
    { name: 'Environment Variables', status: 'pending' },
    { name: 'Firebase Connection', status: 'pending' },
    { name: 'Backend API', status: 'pending' },
    { name: 'React Router', status: 'pending' },
    { name: 'Theme Provider', status: 'pending' },
    { name: 'Auth Context', status: 'pending' },
  ]);

  const updateTest = (name: string, status: DiagnosticTest['status'], message?: string, error?: string) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, status, message, error } : test
    ));
  };

  const runDiagnostics = async () => {
    debugLog.info('Starting error diagnostics');

    // Test 1: Environment Variables
    updateTest('Environment Variables', 'running');
    try {
      const envVars = {
        NODE_ENV: import.meta.env.NODE_ENV,
        MODE: import.meta.env.MODE,
        VITE_DEBUG: import.meta.env.VITE_DEBUG,
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      };
      updateTest('Environment Variables', 'success', `Mode: ${envVars.MODE}, Debug: ${envVars.VITE_DEBUG}`);
    } catch (error) {
      updateTest('Environment Variables', 'error', 'Failed to read environment variables', error.message);
    }

    // Test 2: Firebase Connection
    updateTest('Firebase Connection', 'running');
    try {
      const { auth } = await import('@/lib/firebase');
      if (auth) {
        updateTest('Firebase Connection', 'success', 'Firebase auth initialized');
      } else {
        updateTest('Firebase Connection', 'error', 'Firebase auth not initialized');
      }
    } catch (error) {
      updateTest('Firebase Connection', 'error', 'Firebase import failed', error.message);
    }

    // Test 3: Backend API
    updateTest('Backend API', 'running');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://localhost:3001/health', { 
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        updateTest('Backend API', 'success', `Backend running: ${data.status}`);
      } else {
        updateTest('Backend API', 'error', `Backend responded with ${response.status}`);
      }
    } catch (error) {
      updateTest('Backend API', 'error', 'Backend connection failed', error.message);
    }

    // Test 4: React Router
    updateTest('React Router', 'running');
    try {
      const currentPath = window.location.pathname;
      updateTest('React Router', 'success', `Current path: ${currentPath}`);
    } catch (error) {
      updateTest('React Router', 'error', 'Router error', error.message);
    }

    // Test 5: Theme Provider
    updateTest('Theme Provider', 'running');
    try {
      const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      updateTest('Theme Provider', 'success', `Theme: ${theme}`);
    } catch (error) {
      updateTest('Theme Provider', 'error', 'Theme provider error', error.message);
    }

    // Test 6: Auth Context
    updateTest('Auth Context', 'running');
    try {
      const { useAuth } = await import('@/contexts/AuthContext');
      updateTest('Auth Context', 'success', 'Auth context imported successfully');
    } catch (error) {
      updateTest('Auth Context', 'error', 'Auth context import failed', error.message);
    }

    debugLog.info('Error diagnostics completed');
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
      case 'running':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const allTestsComplete = tests.every(test => test.status === 'success' || test.status === 'error');
  const hasErrors = tests.some(test => test.status === 'error');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Error Diagnosis</h1>
          <p className="text-muted-foreground">
            Running diagnostic tests to identify the issue...
          </p>
        </div>

        <div className="space-y-4">
          {tests.map((test) => (
            <div
              key={test.name}
              className="p-4 border rounded-lg bg-card"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{test.name}</h3>
                  {test.message && (
                    <p className="text-sm text-muted-foreground mt-1">{test.message}</p>
                  )}
                  {test.error && (
                    <p className="text-sm text-red-500 mt-1 font-mono">{test.error}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {allTestsComplete && (
          <div className="mt-8 text-center">
            {hasErrors ? (
              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  Issues Found
                </h3>
                <p className="text-red-700 dark:text-red-300 text-sm mb-4">
                  Some diagnostic tests failed. Please check the errors above and try the following:
                </p>
                <ul className="text-left text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• Ensure the backend server is running on port 3001</li>
                  <li>• Check your internet connection for Firebase</li>
                  <li>• Clear browser cache and localStorage</li>
                  <li>• Restart the development server</li>
                </ul>
              </div>
            ) : (
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  All Tests Passed
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  All diagnostic tests completed successfully. The error might be intermittent.
                </p>
              </div>
            )}

            <div className="mt-6 space-x-4">
              <button
                onClick={runDiagnostics}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Run Again
              </button>
              
              <button
                onClick={() => window.location.href = '/test'}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              >
                Go to Test Page
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              >
                Reload App
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Debug Information</h3>
          <div className="text-sm space-y-1 font-mono">
            <div>URL: {window.location.href}</div>
            <div>User Agent: {navigator.userAgent.substring(0, 100)}...</div>
            <div>Timestamp: {new Date().toISOString()}</div>
            <div>Environment: {import.meta.env.MODE}</div>
          </div>
        </div>
      </div>
    </div>
  );
}