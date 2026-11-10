import  { useState, useEffect } from 'react';

const PwaInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [mobileDismissed, setMobileDismissed] = useState(() => {
    try { return localStorage.getItem('pwa_prompt_dismissed') === 'true'; } catch { return false; }
  });

  useEffect(() => {
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

    if (window.deferredPWAEvent) {
      handleBeforeInstallPrompt(window.deferredPWAEvent);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    const handleInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      window.deferredPWAEvent = null;
    };
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      } finally {
        setShowPrompt(false);
        setDeferredPrompt(null);
        window.deferredPWAEvent = null;
      }
    } else if (isIOS) {
      // Para iOS solo podemos mostrar un tooltip/aviso, ya que no hay API directa
      alert('Para instalar en iOS: Pulsa el ícono de "Compartir" en la barra inferior y selecciona "Agregar a Inicio".');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setMobileDismissed(true);
    try { localStorage.setItem('pwa_prompt_dismissed', 'true'); } catch { /* La instalación sigue disponible. */ }
  };

  if (!showPrompt) return null;

  return (
    <>
    {deferredPrompt && <button type="button" onClick={handleInstallClick} className="hidden md:inline-flex fixed bottom-5 right-5 z-50 items-center gap-2 rounded-lg border border-emerald-800 bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
      <span className="material-symbols-outlined text-[20px]" translate="no" aria-hidden="true">install_desktop</span>
      Instalar aplicación
    </button>}
    {!mobileDismissed && <div className="fixed bottom-4 left-4 right-4 md:hidden z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-emerald-900 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 border border-emerald-700/50">
        <div className="w-12 h-12 bg-white rounded-xl shrink-0 flex items-center justify-center overflow-hidden">
          <img src="/logo-192.png" alt="App Logo" className="w-full h-full object-contain" />
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
    </div>}
    </>
  );
};

export default PwaInstallPrompt;
