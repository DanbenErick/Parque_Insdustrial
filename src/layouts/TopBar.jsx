import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const TopBar = ({ screens }) => {
  const navigate = useNavigate();

  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
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



  const handleGlobalSearch = useCallback(
    (e) => {
      const term = e.target.value;
      setGlobalSearchTerm(term);

      if (term.trim().length > 1) {
        const results = screens.filter(
          (screen) =>
            screen.name.toLowerCase().includes(term.toLowerCase()) ||
            screen.keywords.some((k) => k.includes(term.toLowerCase())),
        );
        setGlobalSearchResults(results);
      } else {
        setGlobalSearchResults([]);
      }
    },
    [screens],
  );

  const handleNavClick = useCallback(
    (view) => {
      navigate(`/${view}`);
      setGlobalSearchTerm('');
      setGlobalSearchResults([]);
    },
    [navigate],
  );

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md hidden md:flex justify-between items-center w-full px-lg h-16 border-b border-outline-variant print:hidden">
      <div className="flex items-center gap-lg">
        <div className="relative hidden lg:block">
          <input
            type="text"
            value={globalSearchTerm}
            onChange={handleGlobalSearch}
            placeholder="Buscar pantallas..."
            className="bg-surface-container border border-outline-variant rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:border-primary outline-none focus:w-80 transition-all"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>

          {/* Search Results Dropdown */}
          {globalSearchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-surface border border-outline-variant rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
              <ul className="divide-y divide-outline-variant">
                {globalSearchResults.map((screen) => (
                  <li
                    key={screen.view}
                    onClick={() => handleNavClick(screen.view)}
                    className="px-4 py-3 hover:bg-surface-container cursor-pointer flex items-center gap-3 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[18px]">{screen.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">{screen.name}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Pantalla del Sistema</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-md relative">
        <button
          onClick={toggleFullscreen}
          className="relative p-2 hover:bg-surface-container rounded-full transition-colors hidden sm:block"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          <span className="material-symbols-outlined text-on-surface-variant">
            {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
          </span>
        </button>



        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-low transition-colors rounded-full text-on-surface-variant"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>


      </div>
    </header>
  );
};

export default TopBar;
