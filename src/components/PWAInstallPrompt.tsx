import React, { useState } from 'react';
import { Download, X, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isOnline, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await installApp();
    } catch (error) {
      console.error('Erro ao instalar app:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Salvar no localStorage para não mostrar novamente por um tempo
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Não mostrar se já está instalado ou não é instalável
  if (isInstalled || !isInstallable || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Download className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Instalar EstudaConcurso
            </h3>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mt-1">
            Instale o app para acessar rapidamente e usar offline
          </p>
          
          <div className="flex items-center space-x-2 mt-2">
            <Smartphone className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">Acesso rápido</span>
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-400" />
                <span className="text-xs text-gray-500">Funciona offline</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">Modo offline</span>
              </>
            )}
          </div>
          
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isInstalling ? 'Instalando...' : 'Instalar'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt; 