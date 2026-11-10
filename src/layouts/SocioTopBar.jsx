import  { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const SocioTopBar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Error al activar pantalla completa: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Resumen General';
      case '/billing': return 'Mis Recibos';
      case '/payments': return 'Historial de Pagos';
      default: return 'Portal del Cliente';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-emerald-50 hidden md:flex justify-between items-center w-full px-6 h-16 border-b border-emerald-200 print:hidden motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-500">
      <div className="flex items-center gap-3">
        <h2 className="font-bold text-lg text-emerald-900 tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">

        <button
          onClick={toggleFullscreen}
          className="relative p-2 hover:bg-emerald-100 rounded-full transition-colors text-emerald-800 motion-safe:hover:scale-110 motion-safe:transition-transform motion-safe:duration-200"
          aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          <span className="material-symbols-outlined text-[20px]" translate="no">
            {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
          </span>
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-outline-variant/30">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-on-surface">{user?.nombre_razonsocial}</p>
            <p className="text-[10px] text-on-surface-variant font-data-mono">Socio</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[12px]">
            {user?.nombre_razonsocial ? user.nombre_razonsocial.substring(0, 1) : 'S'}
          </div>
        </div>

      </div>
    </header>
  );
};

export default SocioTopBar;
