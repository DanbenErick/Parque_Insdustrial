import React, { useState, useEffect } from 'react';

const PwaInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar si el usuario ya ocultó el prompt anteriormente
    const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (hasDismissed) return;

    // Detectar iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    // Detectar si ya está en modo standalone (instalado)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (isIOSDevice && !isStandalone) {
      setIsIOS(true);
      setShowPrompt(true);
    }

    // Manejar el evento PWA de Android/Chrome
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Para iOS solo podemos mostrar un tooltip/aviso, ya que no hay API directa
      alert('Para instalar en iOS: Pulsa el ícono de "Compartir" en la barra inferior y selecciona "Agregar a Inicio".');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:hidden z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-emerald-900 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 border border-emerald-700/50">
        <div className="w-12 h-12 bg-white rounded-xl p-2 shrink-0 flex items-center justify-center">
          <img src="/logo.png" alt="App Logo" className="w-full h-full object-contain" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm truncate">Portal Cliente PQI</h4>
          <p className="text-[11px] text-emerald-200 leading-tight mt-0.5">
            Instala la app en tu celular para un acceso más rápido.
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <button 
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Instalar
          </button>
          <button 
            onClick={handleDismiss}
            className="px-3 py-1 bg-transparent text-emerald-300 text-[10px] font-bold hover:text-white transition-colors"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
