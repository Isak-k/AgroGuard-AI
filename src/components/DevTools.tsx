import { useState, useEffect } from 'react';
import { debugLog, isDev, isDebug } from '@/utils/debug';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface DevToolsProps {
  show?: boolean;
}

export function DevTools({ show = isDev && isDebug }: DevToolsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { user, userData, loading } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    if (!show) return;

    // Capture console logs for display
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args: any[]) => {
      originalLog(...args);
      setLogs(prev => [...prev.slice(-49), `[LOG] ${args.join(' ')}`]);
    };

    console.error = (...args: any[]) => {
      originalError(...args);
      setLogs(prev => [...prev.slice(-49), `[ERROR] ${args.join(' ')}`]);
    };

    console.warn = (...args: any[]) => {
      originalWarn(...args);
      setLogs(prev => [...prev.slice(-49), `[WARN] ${args.join(' ')}`]);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, [show]);

  if (!show) return null;

  const clearLogs = () => setLogs([]);
  
  const exportLogs = () => {
    const logData = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      user: user ? { uid: user.uid, email: user.email } : null,
      userData,
      language,
      logs: logs.slice(-100) // Last 100 logs
    };
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agroguard-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const testError = () => {
    throw new Error('Test error for debugging');
  };

  const testApiCall = async () => {
    try {
      const response = await fetch('/api/health');
      debugLog.success('API test successful', await response.json());
    } catch (error) {
      debugLog.error('API test failed', error);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 10000,
          backgroundColor: '#007acc',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}
        title="Toggle Dev Tools"
      >
        🛠️
      </button>

      {/* Dev Tools Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            right: '10px',
            width: '400px',
            maxHeight: '80vh',
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
            border: '1px solid #333',
            borderRadius: '8px',
            zIndex: 9999,
            fontFamily: 'monospace',
            fontSize: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: '#007acc',
              padding: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>🛠️ AgroGuard Dev Tools</span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '10px', maxHeight: '60vh', overflowY: 'auto' }}>
            {/* System Info */}
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#4CAF50' }}>📊 System Info</h4>
              <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                <div>🌐 URL: {window.location.pathname}</div>
                <div>👤 User: {user ? `${user.email} (${user.uid.slice(0, 8)}...)` : 'Not logged in'}</div>
                <div>🔄 Loading: {loading ? 'Yes' : 'No'}</div>
                <div>🌍 Language: {language}</div>
                <div>📍 Location: {userData?.location || 'Not set'}</div>
                <div>⚡ Mode: {import.meta.env.MODE}</div>
                <div>🔧 Debug: {isDebug ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#FF9800' }}>⚡ Quick Actions</h4>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                <button
                  onClick={clearLogs}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#333',
                    color: 'white',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Clear Logs
                </button>
                <button
                  onClick={exportLogs}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#333',
                    color: 'white',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Export Debug
                </button>
                <button
                  onClick={testApiCall}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#333',
                    color: 'white',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Test API
                </button>
                <button
                  onClick={testError}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Test Error
                </button>
              </div>
            </div>

            {/* Console Logs */}
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#2196F3' }}>📝 Console Logs ({logs.length})</h4>
              <div
                style={{
                  backgroundColor: '#000',
                  padding: '10px',
                  borderRadius: '4px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  fontSize: '10px',
                  lineHeight: '1.3'
                }}
              >
                {logs.length === 0 ? (
                  <div style={{ color: '#666' }}>No logs yet...</div>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: '2px',
                        color: log.includes('[ERROR]') ? '#f44336' :
                              log.includes('[WARN]') ? '#ff9800' :
                              log.includes('[SUCCESS]') ? '#4caf50' : '#fff'
                      }}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}