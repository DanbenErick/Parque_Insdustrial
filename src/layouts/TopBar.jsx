import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const TopBar = () => {
  const navigate = useNavigate();



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







  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md flex md:hidden justify-between items-center w-full px-4 h-12 border-b border-outline-variant print:hidden">
      {/* Logo & Marca en móvil */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-outline-variant/30">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xs text-on-surface leading-none">Parque Industrial</span>
          <span className="text-[8px] text-on-surface-variant font-bold tracking-widest uppercase">Jicamarca</span>
        </div>
      </div>

      {/* Acciones en móvil */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleFullscreen}
          className="p-1.5 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          <span className="material-symbols-outlined text-[18px]" translate="no">
            {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
          </span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="p-1.5 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
          title="Configuración"
        >
          <span className="material-symbols-outlined text-[18px]" translate="no">settings</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
