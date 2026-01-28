import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { Loader2, AlertCircle, Leaf } from 'lucide-react';
import { debugLog, errorTracker } from '@/utils/debug';

// Fallback logo component
const LogoComponent = () => {
  const [logoError, setLogoError] = useState(false);
  
  if (logoError) {
    return (
      <div className="w-32 h-32 mx-auto mb-6 rounded-3xl shadow-xl bg-primary/10 flex items-center justify-center">
        <Leaf className="w-16 h-16 text-primary" />
      </div>
    );
  }
  
  return (
    <motion.img
      src="/src/assets/logo.png"
      alt="AgroGuard AI"
      className="w-32 h-32 mx-auto mb-6 rounded-3xl shadow-xl object-contain"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      onError={() => {
        debugLog.warn('Logo failed to load, using fallback');
        setLogoError(true);
      }}
    />
  );
};

const Index = () => {
  const { user, loading } = useAuth();
  const guardedNavigate = useNavigationGuard();
  const [hasNavigated, setHasNavigated] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    debugLog.component('Index', 'mount', { user: !!user, loading });
    
    // Add debug information
    const info = `Loading: ${loading}, User: ${user ? 'exists' : 'null'}, HasNavigated: ${hasNavigated}, Retry: ${retryCount}`;
    setDebugInfo(info);
    debugLog.info('Index page state', info);
    
    // Prevent multiple navigations
    if (hasNavigated) return;

    // Wait for auth to finish loading
    if (loading) {
      debugLog.info('Auth still loading, waiting...');
      return;
    }

    // Add a delay to prevent rapid redirects
    const timer = setTimeout(() => {
      if (!loading && !hasNavigated) {
        setHasNavigated(true);
        try {
          if (user) {
            debugLog.navigation('Index', 'Dashboard', { userId: user.uid });
            guardedNavigate('/dashboard', { replace: true });
          } else {
            debugLog.navigation('Index', 'Login', { reason: 'No user' });
            guardedNavigate('/login', { replace: true });
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown navigation error';
          debugLog.error('Navigation error in Index', error);
          errorTracker.track(error instanceof Error ? error : new Error(errorMsg), 'Index navigation');
          setError(errorMsg);
          setDebugInfo(`Navigation error: ${errorMsg}`);
        }
      }
    }, 1500); // Increased delay to 1.5 seconds

    return () => {
      clearTimeout(timer);
      debugLog.component('Index', 'cleanup');
    };
  }, [user, loading, guardedNavigate, hasNavigated, retryCount]);

  const handleRetry = () => {
    debugLog.info('User triggered retry from Index page');
    setError(null);
    setHasNavigated(false);
    setRetryCount(prev => prev + 1);
  };

  const handleManualNavigation = (path: string) => {
    debugLog.info(`Manual navigation to ${path}`);
    try {
      guardedNavigate(path, { replace: true });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Navigation failed';
      setError(errorMsg);
      errorTracker.track(error instanceof Error ? error : new Error(errorMsg), 'Manual navigation');
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md p-6"
        >
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="mb-4 text-2xl font-bold text-foreground">Navigation Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleManualNavigation('/login')}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              >
                Go to Login
              </button>
              <button
                onClick={() => handleManualNavigation('/dashboard')}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-muted rounded text-xs text-left">
              <strong>Debug Info:</strong><br />
              {debugInfo}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background hero-gradient">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <LogoComponent />
        <h1 className="mb-4 text-3xl font-bold text-foreground">AgroGuard AI</h1>
        <p className="text-lg text-muted-foreground mb-6">Protecting Ethiopian Crops</p>
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground mt-4">
          {loading ? 'Initializing...' : 'Redirecting...'}
        </p>
        
        {/* Manual navigation buttons for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 space-y-2">
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => handleManualNavigation('/login')}
                className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
              >
                Login
              </button>
              <button
                onClick={() => handleManualNavigation('/dashboard')}
                className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleManualNavigation('/test')}
                className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
              >
                Test
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-muted rounded text-xs text-left max-w-md">
              <strong>Debug Info:</strong><br />
              {debugInfo}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Index;
