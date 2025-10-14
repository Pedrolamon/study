import { useState, useEffect } from 'react';

interface PWAState {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  deferredPrompt: any;
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    isInstallable: false,
    isOnline: navigator.onLine,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    deferredPrompt: null
  });

  useEffect(() => {
    // Verificar se o app está instalado
    const checkInstallation = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;
      
      setPwaState(prev => ({ ...prev, isInstalled }));
    };

    // Verificar conectividade
    const handleOnline = () => setPwaState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setPwaState(prev => ({ ...prev, isOnline: false }));

    // Verificar se é standalone
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setPwaState(prev => ({ ...prev, isStandalone: e.matches }));
    };

    // Registrar service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registrado:', registration);
        } catch (error) {
          console.error('Erro ao registrar Service Worker:', error);
        }
      }
    };

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setPwaState(prev => ({ 
        ...prev, 
        isInstallable: true, 
        deferredPrompt: e 
      }));
    });

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    // Inicialização
    checkInstallation();
    registerServiceWorker();

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const installApp = async () => {
    if (pwaState.deferredPrompt) {
      pwaState.deferredPrompt.prompt();
      const { outcome } = await pwaState.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setPwaState(prev => ({ 
          ...prev, 
          isInstalled: true, 
          isInstallable: false, 
          deferredPrompt: null 
        }));
      }
    }
  };

  const checkForUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        ...options
      });
    }
  };

  const syncData = async () => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register('background-sync');
    }
  };

  return {
    ...pwaState,
    installApp,
    checkForUpdate,
    requestNotificationPermission,
    sendNotification,
    syncData
  };
};
