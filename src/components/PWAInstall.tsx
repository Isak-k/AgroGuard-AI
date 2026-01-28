import { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { debugLog } from '@/utils/debug';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      debugLog.info('PWA is already installed');
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      debugLog.info('PWA install prompt triggered');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      debugLog.success('PWA installed successfully');
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Auto-show banner after 30 seconds if not installed
    const timer = setTimeout(() => {
      if (!isInstalled && deferredPrompt) {
        setShowInstallBanner(true);
      }
    }, 30000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      debugLog.warn('No install prompt available');
      return;
    }

    try {
      debugLog.info('Showing PWA install prompt');
      await deferredPrompt.prompt();
      
      const { outcome } = await deferredPrompt.userChoice;
      debugLog.info(`PWA install prompt result: ${outcome}`);
      
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      debugLog.error('PWA install failed', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || !showInstallBanner || !deferredPrompt) {
    return null;
  }

  // Check if dismissed this session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Smartphone className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">
              Install AgroGuard AI
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Add to your home screen for quick access and offline use
            </p>
            
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-1" />
                Install
              </Button>
              
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Manual install instructions component
export function PWAInstallInstructions() {
  const [showInstructions, setShowInstructions] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  if (!showInstructions) {
    return (
      <Button
        onClick={() => setShowInstructions(true)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Smartphone className="w-4 h-4" />
        Install App
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Install AgroGuard AI</h3>
          <Button
            onClick={() => setShowInstructions(false)}
            variant="ghost"
            size="sm"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {isIOS && (
            <div>
              <h4 className="font-medium mb-2">On iPhone/iPad:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Tap the Share button (square with arrow)</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to confirm</li>
              </ol>
            </div>
          )}

          {isAndroid && (
            <div>
              <h4 className="font-medium mb-2">On Android:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Tap the menu (three dots) in Chrome</li>
                <li>Tap "Add to Home screen"</li>
                <li>Tap "Add" to confirm</li>
              </ol>
            </div>
          )}

          <div className="bg-muted p-3 rounded text-sm">
            <strong>Benefits:</strong>
            <ul className="mt-1 space-y-1 text-muted-foreground">
              <li>• Works offline</li>
              <li>• Faster loading</li>
              <li>• Home screen icon</li>
              <li>• Full screen experience</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}