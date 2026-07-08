import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useYear } from '../../context/YearContext';

const MobileMenuSheet = ({ isOpen, onClose, screens, currentPath, onNavClick }) => {
  const { user, logout } = useAuth();
  const { activeYear, setActiveYear, availableYears } = useYear();
  const userRole = user?.nombre_rol || 'Socio';

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="fixed bottom-0 left-0 right-0 bg-surface z-[60] md:hidden rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom flex flex-col max-h-[85vh]">
        {/* Handle bar */}
        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-12 h-1.5 bg-outline-variant rounded-full" />
        </div>

        {/* User Info / Header */}
        <div className="px-6 py-4 flex items-center gap-3 border-b border-outline-variant">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-bold text-on-primary text-sm shadow-inner uppercase">
            {user?.nombre_razonsocial ? user.nombre_razonsocial.substring(0, 2) : 'AD'}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">{user?.nombre_razonsocial || 'Usuario'}</p>
            <p className="text-xs text-on-surface-variant capitalize truncate">{userRole}</p>
          </div>
          <button onClick={logout} className="p-2 text-error bg-error/10 hover:bg-error/20 rounded-full transition-colors flex items-center justify-center" title="Cerrar Sesión">
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
          
          {/* Year Selector */}
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Año Activo</p>
            <div className="relative">
              <select
                value={activeYear}
                onChange={(e) => setActiveYear(parseInt(e.target.value))}
                className="w-full appearance-none bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface font-bold focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>Gestión {year}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                calendar_month
              </span>
            </div>
          </div>

          {/* Menú Principal */}
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Todas las Opciones</p>
            <div className="grid grid-cols-2 gap-2">
              {screens.map(screen => (
                <button
                  key={screen.view}
                  onClick={() => onNavClick(screen.view)}
                  className={`flex flex-col items-start gap-1 p-3 rounded-xl transition-all border ${currentPath === screen.view ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container'}`}
                >
                  <span className={`material-symbols-outlined text-[22px] ${currentPath === screen.view ? 'text-primary' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: currentPath === screen.view ? "'FILL' 1" : "'FILL' 0" }}>
                    {screen.icon}
                  </span>
                  <span className="text-xs font-bold truncate w-full text-left">{screen.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenuSheet;
