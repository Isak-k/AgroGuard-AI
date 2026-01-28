import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.tsx";
import "./index.css";
import { debugLog, mobileDebug } from "./utils/debug";

// Initialize debugging
debugLog.info('🚀 AgroGuard AI starting in development mode');
mobileDebug.log('App initialization started');

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        debugLog.success('Service Worker registered successfully', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          debugLog.info('Service Worker update found');
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                debugLog.info('New Service Worker installed, update available');
                // Optionally show update notification to user
              }
            });
          }
        });
      })
      .catch((error) => {
        debugLog.error('Service Worker registration failed', error);
      });
  });
}

// PWA Install Prompt
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  debugLog.info('PWA install prompt available');
  e.preventDefault();
  deferredPrompt = e;
  
  // Show custom install button or notification
  // You can trigger this later with: deferredPrompt.prompt()
});

window.addEventListener('appinstalled', () => {
  debugLog.success('PWA installed successfully');
  deferredPrompt = null;
});

const root = createRoot(document.getElementById("root")!);

// Enhanced error handling for development
const renderApp = () => {
  try {
    // Only use StrictMode in development to catch issues early
    if (import.meta.env.DEV) {
      debugLog.info('Rendering app with React StrictMode');
      root.render(
        <StrictMode>
          <App />
        </StrictMode>
      );
    } else {
      root.render(<App />);
    }
    debugLog.success('App rendered successfully');
  } catch (error) {
    debugLog.error('Failed to render app', error);
    mobileDebug.log(`Render error: ${error.message}`);
    
    // Fallback error display
    root.render(
      <div style={{
        padding: '20px',
        fontFamily: 'monospace',
        backgroundColor: '#fee',
        color: '#c00',
        border: '2px solid #c00',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h2>🚨 Development Error</h2>
        <p><strong>Error:</strong> {error.message}</p>
        <p><strong>Check console for details</strong></p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#c00',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload App
        </button>
      </div>
    );
  }
};

renderApp();
