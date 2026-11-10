import  { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppNavigate } from '../context/NavigationFeedbackContext';

const SocioSidebar = ({ isMobileMenuOpen, onCloseMobileMenu }) => {
  const navigate = useAppNavigate();
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
    <aside className={`fixed left-0 top-0 h-full w-[280px] md:w-[260px] flex flex-col z-50 bg-[#075b50] border-r border-emerald-900/30 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-in-out print:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

      {/* Logo Area */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-white/15 bg-black/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-center overflow-hidden shrink-0">
            <img src="/logo-192.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col mt-1">
            <span className="font-bold text-white text-[15px] leading-tight tracking-wide font-headline-sm">Portal Cliente</span>
            <span className="text-[10px] text-emerald-200 font-bold tracking-[0.1em] uppercase">PQI Jicamarca</span>
          </div>
        </div>
        <button onClick={onCloseMobileMenu} aria-label="Cerrar menú" className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg">
          <span className="material-symbols-outlined" translate="no">close</span>
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-4 py-6 flex-grow overflow-y-auto custom-scrollbar motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-4 motion-safe:duration-500">
        <p className="px-2 text-[10px] font-bold text-emerald-200/80 uppercase tracking-widest mb-2">Principal</p>

        {menuItems.map(item => {
          const isActive = currentPath === item.view;
          return (
            <button
              key={item.view}
              onClick={() => handleNavClick(item.view)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-safe:hover:translate-y-1 motion-safe:active:scale-[0.98] w-full text-left group relative focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 ${
                isActive
                  ? 'bg-white text-emerald-800 font-bold border border-white'
                  : 'text-emerald-50 hover:bg-white/10 hover:text-white border border-transparent'
              }`}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-1 bg-emerald-500 rounded-r-full"></div>}
              <span translate="no"
                className={`material-symbols-outlined text-[20px] motion-safe:transition-transform motion-safe:duration-200 ${isActive ? 'scale-110' : 'motion-safe:group-hover:scale-110'}`}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="flex-1 text-[13px] tracking-wide">{item.name}</span>
              <span aria-hidden="true" className={`material-symbols-outlined text-[16px] motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:translate-x-1 ${isActive ? 'text-emerald-600' : 'text-emerald-200/70'}`} translate="no">chevron_right</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-white/15 bg-black/10">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl border border-white/20 bg-white/10">
          <div className="w-10 h-10 rounded-xl bg-emerald-300 flex items-center justify-center font-bold text-emerald-950 text-[14px] uppercase">
            {user?.nombre_razonsocial ? user.nombre_razonsocial.substring(0, 2) : 'SO'}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-[12px] font-bold text-white truncate" title={user?.nombre_razonsocial}>
              {user?.nombre_razonsocial || 'Socio'}
            </p>
            <p className="text-[10px] text-emerald-100 font-data-mono truncate">
              {user?.documento_identidad || 'RUC/DNI'}
            </p>
          </div>

          <div className="flex gap-1 ml-auto">
            <button
              onClick={logout}
              className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/15 rounded-lg motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:translate-x-1 focus-visible:outline-2 focus-visible:outline-emerald-200"
              aria-label="Cerrar sesión"
              title="Cerrar Sesión"
            >
              <span className="material-symbols-outlined text-[18px]" translate="no">logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SocioSidebar;
