import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SocioSidebar = ({ isMobileMenuOpen, onCloseMobileMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const currentPath = location.pathname.substring(1) || 'dashboard';

  const handleNavClick = useCallback((view) => {
    navigate(`/${view}`);
    onCloseMobileMenu();
  }, [navigate, onCloseMobileMenu]);

  const menuItems = [
    { view: 'dashboard', name: 'Mi Resumen', icon: 'dashboard' },
    { view: 'billing', name: 'Mis Recibos', icon: 'receipt_long' },
    { view: 'payments', name: 'Mis Pagos', icon: 'payments' },
    { view: 'profile', name: 'Cambiar Contraseña', icon: 'lock_reset' },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-full w-[280px] md:w-[260px] flex flex-col z-50 bg-white border-r border-outline-variant/30 shadow-lg md:shadow-none transition-transform duration-300 ease-in-out print:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      
      {/* Logo Area */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-outline-variant/30 bg-surface-container-lowest">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-center overflow-hidden shrink-0 p-1">
            <img src="/logo.png" alt="Logo" className="w-[90%] h-[90%] object-contain drop-shadow-sm" />
          </div>
          <div className="flex flex-col mt-1">
            <span className="font-bold text-emerald-900 text-[15px] leading-tight tracking-wide font-headline-sm">Portal Cliente</span>
            <span className="text-[10px] text-emerald-600 font-bold tracking-[0.1em] uppercase">PQI Jicamarca</span>
          </div>
        </div>
        <button onClick={onCloseMobileMenu} className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-lg">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-4 py-6 flex-grow overflow-y-auto custom-scrollbar">
        <p className="px-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Principal</p>
        
        {menuItems.map(item => {
          const isActive = currentPath === item.view;
          return (
            <button
              key={item.view}
              onClick={() => handleNavClick(item.view)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-left group relative ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 shadow-sm' 
                  : 'text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface border border-transparent'
              }`}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-1 bg-emerald-500 rounded-r-full"></div>}
              <span 
                className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="text-[13px] tracking-wide">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl border border-outline-variant/50 bg-white shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-[14px] shadow-inner uppercase">
            {user?.nombre_razonsocial ? user.nombre_razonsocial.substring(0, 2) : 'SO'}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-[12px] font-bold text-on-surface truncate" title={user?.nombre_razonsocial}>
              {user?.nombre_razonsocial || 'Socio'}
            </p>
            <p className="text-[10px] text-on-surface-variant font-data-mono truncate">
              {user?.documento_identidad || 'RUC/DNI'}
            </p>
          </div>
          
          <div className="flex gap-1 ml-auto">
            <button 
              onClick={logout} 
              className="p-1.5 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
              title="Cerrar Sesión"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SocioSidebar;
