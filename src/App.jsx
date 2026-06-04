import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useYear } from './context/YearContext';
import PageTransition from './components/PageTransition';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TenantsAndSectors from './components/TenantsAndSectors';
import Billing from './components/Billing';
import Payments from './components/Payments';
import Reports from './components/Reports';
import UserManagement from './components/UserManagement';
import GenerateInvoices from './components/GenerateInvoices';
import ReceiptDetail from './components/ReceiptDetail';

import ManualBilling from './components/ManualBilling';
import Settings from './components/Settings';
import Support from './components/Support';

function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const userRole = user?.nombre_rol || 'Miembro';
  const { isDarkMode, toggleTheme } = useTheme();
  const { activeYear, setActiveYear } = useYear();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.substring(1) || 'dashboard';

  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  useEffect(() => {
    const handleGlobalLoading = (e) => {
      setIsGlobalLoading(e.detail);
    };
    window.addEventListener('globalLoading', handleGlobalLoading);
    return () => window.removeEventListener('globalLoading', handleGlobalLoading);
  }, []);

  const userRutas = user?.rutas || [];

  const appScreens = [
    { view: 'dashboard', name: 'Panel de Control', icon: 'dashboard', keywords: ['inicio', 'home', 'kpi', 'resumen'], hasAccess: userRutas.includes('dashboard') },
    { view: 'tenants', name: 'Empresas', icon: 'factory', keywords: ['empresas', 'fabricas', 'miembros', 'sectores', 'manzanas', 'propietarios'], hasAccess: userRutas.includes('tenants') },
    { view: 'billing', name: 'Facturación', icon: 'receipt_long', keywords: ['facturas', 'cobros', 'recibos', 'generar', 'boletas'], hasAccess: userRutas.includes('billing') },
    { view: 'payments', name: 'Pagos Recibidos', icon: 'payments', keywords: ['pagos', 'ingresos', 'dinero', 'historial'], hasAccess: userRutas.includes('payments') },
    { view: 'reports', name: 'Reportes', icon: 'bar_chart', keywords: ['estadisticas', 'graficos', 'analisis'], hasAccess: userRutas.includes('reports') },
    { view: 'manual_billing', name: 'Registro de Lecturas', icon: 'edit_document', keywords: ['lectura', 'kwh', 'medidor', 'consumo'], hasAccess: userRutas.includes('manual_billing') },
    { view: 'users', name: 'Gestión de Usuarios', icon: 'manage_accounts', keywords: ['administradores', 'moderadores', 'cuentas', 'permisos', 'contraseñas'], isConfig: true, hasAccess: userRutas.includes('users') },
    { view: 'settings', name: 'Ajustes Generales', icon: 'settings', keywords: ['configuracion', 'parametros', 'sistema'], isConfig: true, hasAccess: userRutas.includes('settings') },
    { view: 'support', name: 'Soporte Técnico', icon: 'support_agent', keywords: ['ayuda', 'contacto', 'problemas', 'ticket'], hasAccess: userRutas.includes('support') }
  ];

  const visibleScreens = appScreens.filter(screen => screen.hasAccess);

  const handleGlobalSearch = (e) => {
    const term = e.target.value;
    setGlobalSearchTerm(term);

    if (term.trim().length > 1) {
      const results = visibleScreens.filter(screen =>
        screen.name.toLowerCase().includes(term.toLowerCase()) ||
        screen.keywords.some(k => k.includes(term.toLowerCase()))
      );
      setGlobalSearchResults(results);
    } else {
      setGlobalSearchResults([]);
    }
  };

  const handleNavClick = (view) => {
    navigate(`/${view}`);
    setIsMobileMenuOpen(false); // Close menu on mobile after selection
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-on-surface-variant font-body-sm font-bold animate-pulse">Cargando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" theme={isDarkMode ? 'dark' : 'light'} richColors />
      <div className="bg-surface font-body-md text-on-surface antialiased flex flex-col md:flex-row min-h-screen relative overflow-x-hidden">

        {/* Mobile Top Bar */}
        <header className="md:hidden flex items-center justify-between p-4 bg-surface-dim text-white shadow-md z-40 sticky top-0 print:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[28px]">menu</span>
            </button>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Jicamarca Logo" className="w-[85%] h-[85%] object-contain" />
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-on-primary text-xs uppercase">
            {user?.nombre_razonsocial ? user.nombre_razonsocial.substring(0, 2) : 'AD'}
          </div>
        </header>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* SideNavBar */}
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
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-lg">
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
                {[2024, 2025, 2026, 2027].map(year => (
                  <option key={year} value={year} className="bg-surface text-on-surface">Año {year}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none text-[18px]">
                calendar_month
              </span>
            </div>
          </div>

          <nav className="flex flex-col gap-1 px-4 py-4 flex-grow overflow-y-auto custom-scrollbar">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Menú Principal</p>
            {visibleScreens.filter(s => !s.isConfig).map(screen => (
              <button
                key={screen.view}
                onClick={() => handleNavClick(screen.view)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-left group relative overflow-hidden ${currentPath === screen.view ? 'bg-primary text-on-primary font-bold shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
              >
                {currentPath === screen.view && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>}
                <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${currentPath === screen.view ? 'scale-110' : 'group-hover:scale-110'}`} style={{ fontVariationSettings: currentPath === screen.view ? "'FILL' 1" : "'FILL' 0" }}>{screen.icon}</span>
                <span className="text-[13px] tracking-wide">{screen.name}</span>
              </button>
            ))}

            {visibleScreens.some(s => s.isConfig) && (
              <>
                <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-6">Configuración</p>
                {visibleScreens.filter(s => s.isConfig).map(screen => (
                  <button
                    key={screen.view}
                    onClick={() => handleNavClick(screen.view)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-left group relative overflow-hidden ${currentPath === screen.view ? 'bg-primary text-on-primary font-bold shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                  >
                    {currentPath === screen.view && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>}
                    <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${currentPath === screen.view ? 'scale-110' : 'group-hover:scale-110'}`} style={{ fontVariationSettings: currentPath === screen.view ? "'FILL' 1" : "'FILL' 0" }}>{screen.icon}</span>
                    <span className="text-[13px] tracking-wide">{screen.name}</span>
                  </button>
                ))}
              </>
            )}
          </nav>
          
          <div className="p-4 border-t border-white/10 bg-surface-dim">
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer border border-transparent hover:border-white/20">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-on-primary text-[12px] shadow-inner uppercase border border-white/20 group-hover:border-white/50 transition-colors">
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

        {/* Main Content Area */}
        <div className="flex-1 ml-0 md:ml-[260px] flex flex-col h-screen overflow-hidden bg-background dark:bg-[#1a1c1e]">

          {/* Desktop Top Bar */}
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
                          onClick={() => {
                            handleNavClick(screen.view);
                            setGlobalSearchTerm('');
                            setGlobalSearchResults([]);
                          }}
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
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-surface-container rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <button onClick={() => handleNavClick('settings')} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-low transition-colors rounded-full text-on-surface-variant">
                <span className="material-symbols-outlined">settings</span>
              </button>

              {/* Global Notifications Modal */}
              {showNotifications && (
                <div className="absolute top-12 right-0 w-80 bg-surface border border-outline-variant rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                    <h3 className="font-headline-sm font-bold text-on-surface">Notificaciones</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-on-surface-variant hover:text-on-surface">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-md border-b border-outline-variant/50 hover:bg-surface-container-lowest transition-colors cursor-pointer bg-primary-container/10">
                      <div className="flex gap-sm">
                        <span className="material-symbols-outlined text-primary">receipt_long</span>
                        <div>
                          <p className="font-body-sm font-bold text-on-surface">Nueva Factura Emitida</p>
                          <p className="text-xs text-on-surface-variant mt-1">Corporación Textil ha generado su factura de Octubre.</p>
                          <span className="text-[10px] text-primary font-bold mt-2 block">Hace 5 min</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-md border-b border-outline-variant/50 hover:bg-surface-container-lowest transition-colors cursor-pointer">
                      <div className="flex gap-sm">
                        <span className="material-symbols-outlined text-error">warning</span>
                        <div>
                          <p className="font-body-sm font-bold text-on-surface">Vencimiento de Pago</p>
                          <p className="text-xs text-on-surface-variant mt-1">Aceros Industriales tiene 2 días de retraso.</p>
                          <span className="text-[10px] text-on-surface-variant mt-2 block">Hace 2 horas</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-md border-b border-outline-variant/50 hover:bg-surface-container-lowest transition-colors cursor-pointer">
                      <div className="flex gap-sm">
                        <span className="material-symbols-outlined text-secondary">check_circle</span>
                        <div>
                          <p className="font-body-sm font-bold text-on-surface">Cierre de Mes Completado</p>
                          <p className="text-xs text-on-surface-variant mt-1">El reporte de septiembre ha sido consolidado con éxito.</p>
                          <span className="text-[10px] text-on-surface-variant mt-2 block">Ayer</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-sm text-center border-t border-outline-variant bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
                    <span className="text-xs font-bold text-primary">Marcar todas como leídas</span>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
                <Route path="/tenants" element={<PageTransition><TenantsAndSectors /></PageTransition>} />
                <Route path="/billing" element={<PageTransition><Billing /></PageTransition>} />
                <Route path="/payments" element={<PageTransition><Payments /></PageTransition>} />
                <Route path="/reports" element={<PageTransition><Reports /></PageTransition>} />

                <Route path="/generate_invoices" element={<PageTransition><GenerateInvoices /></PageTransition>} />
                <Route path="/manual_billing" element={<PageTransition><ManualBilling /></PageTransition>} />
                <Route path="/receipt_detail" element={<PageTransition><ReceiptDetail /></PageTransition>} />
                <Route path="/users" element={<PageTransition><UserManagement /></PageTransition>} />
                <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
                <Route path="/support" element={<PageTransition><Support /></PageTransition>} />
                <Route path="/login" element={<Navigate to="/dashboard" />} />
                <Route path="*" element={<PageTransition><Dashboard /></PageTransition>} />
              </Routes>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <footer className="mt-auto bg-surface-container-highest flex justify-center items-center px-lg py-sm w-full border-t border-outline-variant print:hidden">
            <span className="font-label-caps text-label-caps text-on-surface-variant font-bold">© 2026 Parque Industrial Jicamarca</span>
          </footer>
        </div>
      </div>

      {/* Global Loader Overlay */}
      <AnimatePresence>
        {isGlobalLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white"
          >
            <div className="w-16 h-16 border-4 border-white/20 border-t-primary rounded-full animate-spin mb-4 shadow-xl"></div>
            <h2 className="text-xl font-bold font-headline-sm animate-pulse drop-shadow-md">Procesando solicitud...</h2>
            <p className="text-sm text-white/70 mt-2">Por favor, no cierre ni recargue esta ventana.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
