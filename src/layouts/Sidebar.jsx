import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useYear } from '../context/YearContext';

const Sidebar = ({ isMobileMenuOpen, onCloseMobileMenu, screens }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { activeYear, setActiveYear } = useYear();
  const userRole = user?.nombre_rol || 'Socio';
  const currentPath = location.pathname.substring(1) || 'dashboard';

  const handleNavClick = useCallback((view) => {
    navigate(`/${view}`);
    onCloseMobileMenu();
  }, [navigate, onCloseMobileMenu]);

  return (
    <aside className={`fixed left-0 top-0 h-full w-[280px] md:w-[260px] flex flex-col z-50 bg-surface-dim text-white shadow-2xl transition-transform duration-300 ease-in-out print:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      {/* Logo Area */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-white/10 bg-surface-dim">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0">
            <img src="/logo.png" alt="Logo" className="w-[85%] h-[85%] object-contain" />
          </div>
          <div className="flex flex-col mt-1">
            <span className="font-bold text-white text-[15px] leading-tight tracking-wide font-headline-sm">Parque Industrial</span>
            <span className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">Jicamarca</span>
          </div>
        </div>
        <button onClick={onCloseMobileMenu} className="md:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-lg">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Year Selector */}
      <div className="px-4 py-3 border-b border-white/5 bg-surface-dim">
        <div className="relative">
          <select
            value={activeYear}
            onChange={(e) => setActiveYear(parseInt(e.target.value))}
            className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-bold focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-colors cursor-pointer"
          >
            {Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - 1 + i).map(year => (
              <option key={year} value={year} className="bg-surface text-on-surface">Año {year}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none text-[18px]">
            calendar_month
          </span>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-3 py-3 flex-grow overflow-y-auto custom-scrollbar">
        <p className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Menú Principal</p>
        {screens.filter(s => !s.isConfig).map(screen => (
          <button
            key={screen.view}
            onClick={() => handleNavClick(screen.view)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 w-full text-left group relative overflow-hidden ${currentPath === screen.view ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
            {currentPath === screen.view && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>}
            <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${currentPath === screen.view ? 'scale-110' : 'group-hover:scale-110'}`} style={{ fontVariationSettings: currentPath === screen.view ? "'FILL' 1" : "'FILL' 0" }}>{screen.icon}</span>
            <span className="text-xs tracking-wide">{screen.name}</span>
          </button>
        ))}

        {screens.some(s => s.isConfig) && (
          <>
            <p className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 mt-4">Configuración</p>
            {screens.filter(s => s.isConfig).map(screen => (
              <button
                key={screen.view}
                onClick={() => handleNavClick(screen.view)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 w-full text-left group relative overflow-hidden ${currentPath === screen.view ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
              >
                {currentPath === screen.view && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>}
                <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${currentPath === screen.view ? 'scale-110' : 'group-hover:scale-110'}`} style={{ fontVariationSettings: currentPath === screen.view ? "'FILL' 1" : "'FILL' 0" }}>{screen.icon}</span>
                <span className="text-xs tracking-wide">{screen.name}</span>
              </button>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-white/10 bg-surface-dim">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl border border-transparent">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-on-primary text-[12px] shadow-inner uppercase border border-white/20">
            {user?.nombre_razonsocial ? user.nombre_razonsocial.substring(0, 2) : 'AD'}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-[12px] font-bold text-white truncate">{user?.nombre_razonsocial || 'Usuario'}</p>
            <p className="text-[10px] text-white/60 capitalize truncate">{userRole}</p>
          </div>
          <button onClick={logout} className="p-1.5 text-white/60 hover:text-error hover:bg-error/20 rounded-lg transition-colors ml-auto" title="Cerrar Sesión">
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
