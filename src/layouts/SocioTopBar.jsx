import React, { useState, useEffect } from 'react';
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
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md hidden md:flex justify-between items-center w-full px-6 h-16 border-b border-outline-variant/30 print:hidden shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="font-bold text-lg text-emerald-900 tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        
        {/* Support/Contact Info (Optional Visual Element) */}
        <div className="hidden lg:flex items-center gap-2 mr-4 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
          <span className="material-symbols-outlined text-[16px]">support_agent</span>
          <span className="text-[11px] font-bold tracking-wide uppercase">Atención al Socio</span>
        </div>

        <button
          onClick={toggleFullscreen}
          className="relative p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant hover:text-emerald-600"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          <span className="material-symbols-outlined text-[20px]">
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
