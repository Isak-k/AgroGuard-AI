import React, { useState, useEffect } from 'react';
import { debugLog, perfMonitor, isDev } from '@/utils/debug';

interface PerformanceData {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  networkRequests: number;
  errors: number;
}

export function PerformanceMonitor() {
  const [perfData, setPerfData] = useState<PerformanceData>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    networkRequests: 0,
    errors: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isDev) return;

    const startTime = performance.now();
    
    // Update render metrics
    setPerfData(prev => {
      const renderTime = performance.now() - startTime;
      const newRenderCount = prev.renderCount + 1;
      const newAverageRenderTime = (prev.averageRenderTime * (newRenderCount - 1) + renderTime) / newRenderCount;
      
      return {
        ...prev,
        renderCount: newRenderCount,
        lastRenderTime: renderTime,
        averageRenderTime: newAverageRenderTime,
        memoryUsage: (performance as any).memory
      };
    });

    // Monitor network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      setPerfData(prev => ({ ...prev, networkRequests: prev.networkRequests + 1 }));
      debugLog.api('FETCH', args[0]?.toString() || 'unknown', undefined, undefined);
      return originalFetch(...args);
    };

    // Monitor errors
    const handleError = () => {
      setPerfData(prev => ({ ...prev, errors: prev.errors + 1 }));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.fetch = originalFetch;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  if (!isDev) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          zIndex: 10000,
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}
        title="Performance Monitor"
      >
        📊
      </button>

      {/* Performance Panel */}
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: '70px',
            right: '10px',
            width: '300px',
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
            border: '1px solid #333',
            borderRadius: '8px',
            zIndex: 9999,
            fontFamily: 'monospace',
            fontSize: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: '#4CAF50',
              padding: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>📊 Performance Monitor</span>
            <button
              onClick={() => setIsVisible(false)}
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
          <div style={{ padding: '10px' }}>
            <div style={{ marginBottom: '10px' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#4CAF50' }}>🚀 Render Performance</h4>
              <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                <div>Renders: {perfData.renderCount}</div>
                <div>Last: {perfData.lastRenderTime.toFixed(2)}ms</div>
                <div>Average: {perfData.averageRenderTime.toFixed(2)}ms</div>
              </div>
            </div>

            {perfData.memoryUsage && (
              <div style={{ marginBottom: '10px' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#2196F3' }}>💾 Memory Usage</h4>
                <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                  <div>Used: {(perfData.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB</div>
                  <div>Total: {(perfData.memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(1)}MB</div>
                  <div>Limit: {(perfData.memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(1)}MB</div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '10px' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#FF9800' }}>🌐 Network & Errors</h4>
              <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                <div>Network Requests: {perfData.networkRequests}</div>
                <div>Errors: {perfData.errors}</div>
              </div>
            </div>

            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#9C27B0' }}>⚡ Quick Actions</h4>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setPerfData({
                      renderCount: 0,
                      lastRenderTime: 0,
                      averageRenderTime: 0,
                      networkRequests: 0,
                      errors: 0
                    });
                  }}
                  style={{
                    padding: '5px 8px',
                    backgroundColor: '#333',
                    color: 'white',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    if (window.gc) {
                      window.gc();
                      debugLog.info('Manual garbage collection triggered');
                    } else {
                      debugLog.warn('Garbage collection not available');
                    }
                  }}
                  style={{
                    padding: '5px 8px',
                    backgroundColor: '#333',
                    color: 'white',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  GC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}