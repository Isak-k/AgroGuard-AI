// Development debugging utilities

export const isDev = import.meta.env.DEV;
export const isDebug = import.meta.env.VITE_DEBUG === 'true';
export const isVerbose = import.meta.env.VITE_VERBOSE_LOGGING === 'true';

// Enhanced console logging for development
export const debugLog = {
  info: (message: string, ...args: any[]) => {
    if (isDev && isDebug) {
      console.log(`🔍 [DEBUG] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (isDev) {
      console.warn(`⚠️ [WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, error?: any, ...args: any[]) => {
    if (isDev) {
      console.error(`❌ [ERROR] ${message}`, error, ...args);
      if (error?.stack) {
        console.error('Stack trace:', error.stack);
      }
    }
  },
  
  success: (message: string, ...args: any[]) => {
    if (isDev && isDebug) {
      console.log(`✅ [SUCCESS] ${message}`, ...args);
    }
  },
  
  api: (method: string, url: string, data?: any, response?: any) => {
    if (isDev && isVerbose) {
      console.group(`🌐 [API] ${method.toUpperCase()} ${url}`);
      if (data) console.log('Request:', data);
      if (response) console.log('Response:', response);
      console.groupEnd();
    }
  },
  
  component: (componentName: string, action: string, data?: any) => {
    if (isDev && isVerbose) {
      console.log(`🧩 [${componentName}] ${action}`, data || '');
    }
  },
  
  auth: (action: string, data?: any) => {
    if (isDev && isDebug) {
      console.log(`🔐 [AUTH] ${action}`, data || '');
    }
  },
  
  firebase: (action: string, data?: any) => {
    if (isDev && isDebug) {
      console.log(`🔥 [FIREBASE] ${action}`, data || '');
    }
  },
  
  navigation: (from: string, to: string, data?: any) => {
    if (isDev && isDebug) {
      console.log(`🧭 [NAV] ${from} → ${to}`, data || '');
    }
  },
  
  performance: (label: string, startTime: number) => {
    if (isDev && isDebug) {
      const duration = performance.now() - startTime;
      console.log(`⚡ [PERF] ${label}: ${duration.toFixed(2)}ms`);
    }
  }
};

// Performance monitoring
export const perfMonitor = {
  start: (label: string): number => {
    if (isDev) {
      const startTime = performance.now();
      debugLog.info(`Starting performance measurement: ${label}`);
      return startTime;
    }
    return 0;
  },
  
  end: (label: string, startTime: number) => {
    if (isDev && startTime > 0) {
      debugLog.performance(label, startTime);
    }
  }
};

// Error tracking for development
export const errorTracker = {
  track: (error: Error, context?: string) => {
    if (isDev) {
      debugLog.error(`Error in ${context || 'unknown context'}`, error);
      
      // Additional error details
      console.group('🔍 Error Details');
      console.log('Name:', error.name);
      console.log('Message:', error.message);
      console.log('Stack:', error.stack);
      if (context) console.log('Context:', context);
      console.groupEnd();
    }
  }
};

// Development tools
export const devTools = {
  // Log component renders
  logRender: (componentName: string, props?: any) => {
    if (isDev && isVerbose) {
      debugLog.component(componentName, 'render', props);
    }
  },
  
  // Log state changes
  logStateChange: (componentName: string, stateName: string, oldValue: any, newValue: any) => {
    if (isDev && isVerbose) {
      console.log(`🔄 [${componentName}] ${stateName}: ${oldValue} → ${newValue}`);
    }
  },
  
  // Log effect runs
  logEffect: (componentName: string, effectName: string, dependencies?: any[]) => {
    if (isDev && isVerbose) {
      debugLog.component(componentName, `effect: ${effectName}`, dependencies);
    }
  },
  
  // Network request logging
  logRequest: (url: string, options?: RequestInit) => {
    if (isDev && isVerbose) {
      debugLog.api(options?.method || 'GET', url, options?.body);
    }
  },
  
  // Response logging
  logResponse: (url: string, response: Response, data?: any) => {
    if (isDev && isVerbose) {
      console.log(`📥 [RESPONSE] ${response.status} ${url}`, data);
    }
  }
};

// Mobile debugging helpers
export const mobileDebug = {
  isEnabled: import.meta.env.VITE_MOBILE_DEBUG === 'true',
  
  log: (message: string, ...args: any[]) => {
    if (mobileDebug.isEnabled) {
      // For mobile debugging, also try to show in UI
      console.log(`📱 [MOBILE] ${message}`, ...args);
      
      // Create a debug overlay for mobile
      if (typeof window !== 'undefined' && window.document) {
        const debugDiv = document.getElementById('mobile-debug') || (() => {
          const div = document.createElement('div');
          div.id = 'mobile-debug';
          div.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            font-size: 12px;
            max-width: 300px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 9999;
            font-family: monospace;
          `;
          document.body.appendChild(div);
          return div;
        })();
        
        const timestamp = new Date().toLocaleTimeString();
        debugDiv.innerHTML += `<div>[${timestamp}] ${message}</div>`;
        
        // Keep only last 10 messages
        const messages = debugDiv.children;
        if (messages.length > 10) {
          debugDiv.removeChild(messages[0]);
        }
      }
    }
  }
};

// Global error handler for development
if (isDev) {
  window.addEventListener('error', (event) => {
    errorTracker.track(event.error, 'Global error handler');
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.track(new Error(event.reason), 'Unhandled promise rejection');
  });
}

// Export debug info for console inspection
if (isDev && typeof window !== 'undefined') {
  (window as any).__AGROGUARD_DEBUG__ = {
    debugLog,
    perfMonitor,
    errorTracker,
    devTools,
    mobileDebug,
    env: import.meta.env
  };
}