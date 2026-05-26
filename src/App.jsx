import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TenantsAndSectors from './components/TenantsAndSectors';
import Billing from './components/Billing';
import Payments from './components/Payments';
import Reports from './components/Reports';
import UserManagement from './components/UserManagement';
import GenerateInvoices from './components/GenerateInvoices';
import ReceiptDetail from './components/ReceiptDetail';
import MemberReport from './components/MemberReport';
import ManualBilling from './components/ManualBilling';
import Settings from './components/Settings';
import Support from './components/Support';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState([]);

  const appScreens = [
    { view: 'dashboard', name: 'Panel de Control', icon: 'dashboard', keywords: ['inicio', 'home', 'kpi', 'resumen'] },
    { view: 'tenants', name: 'Inquilinos y Sectores', icon: 'factory', keywords: ['empresas', 'fabricas', 'miembros', 'sectores', 'manzanas'] },
    { view: 'billing', name: 'Facturación', icon: 'receipt_long', keywords: ['facturas', 'cobros', 'recibos', 'generar', 'boletas'] },
    { view: 'payments', name: 'Pagos Recibidos', icon: 'payments', keywords: ['pagos', 'ingresos', 'dinero', 'historial'] },
    { view: 'reports', name: 'Reportes', icon: 'bar_chart', keywords: ['estadisticas', 'graficos', 'analisis'] },
    { view: 'users', name: 'Gestión de Usuarios', icon: 'manage_accounts', keywords: ['administradores', 'moderadores', 'cuentas', 'permisos', 'contraseñas'] },
    { view: 'settings', name: 'Ajustes Generales', icon: 'settings', keywords: ['configuracion', 'parametros', 'sistema'] },
    { view: 'support', name: 'Soporte Técnico', icon: 'support_agent', keywords: ['ayuda', 'contacto', 'problemas', 'ticket'] },
    { view: 'manual_billing', name: 'Registro Manual', icon: 'edit_document', keywords: ['lectura', 'watts', 'medidor', 'consumo'] }
  ];

  const handleGlobalSearch = (e) => {
    const term = e.target.value;
    setGlobalSearchTerm(term);
    
    if (term.trim().length > 1) {
      const results = appScreens.filter(screen => 
        screen.name.toLowerCase().includes(term.toLowerCase()) || 
        screen.keywords.some(k => k.includes(term.toLowerCase()))
      );
      setGlobalSearchResults(results);
    } else {
      setGlobalSearchResults([]);
    }
  };

  const handleNavClick = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false); // Close menu on mobile after selection
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tenants':
        return <TenantsAndSectors />;
      case 'billing':
        return <Billing setCurrentView={setCurrentView} />;
      case 'payments':
        return <Payments />;
      case 'reports':
        return <Reports />;
      case 'member_report':
        return <MemberReport />;
      case 'generate_invoices':
        return <GenerateInvoices />;
      case 'manual_billing':
        return <ManualBilling />;
      case 'receipt_detail':
        return <ReceiptDetail />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <Settings />;
      case 'support':
        return <Support />;
      default:
        return <Dashboard />;
    }
  };

  const handleLogin = (role) => {
    // Logic to handle user role can be added here
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased flex flex-col md:flex-row min-h-screen relative overflow-x-hidden">
      
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between p-4 bg-surface-dim text-white shadow-md z-40 sticky top-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[28px]">menu</span>
          </button>
          <img src="/logo.png" alt="Jicamarca Logo" className="h-8 w-auto object-contain" />
        </div>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-on-primary">
          AD
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
      <aside className={`fixed left-0 top-0 h-full w-[280px] md:w-[240px] border-r border-outline-variant flex flex-col p-md gap-sm z-50 bg-surface-dim text-white shadow-2xl transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="mb-lg px-xs flex justify-between items-start">
          <div>
            <img src="/logo.png" alt="Parque Industrial Jicamarca" className="h-12 w-auto object-contain mb-2 bg-white rounded p-1" />
            <p className="font-body-sm text-body-sm text-white/60">Gestión Industrial</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-white/70 hover:bg-white/10 rounded-lg">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex flex-col gap-xs flex-grow overflow-y-auto pb-20 md:pb-0">
          <button 
            onClick={() => handleNavClick('dashboard')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'dashboard' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-body-md text-body-md">Panel de Control</span>
          </button>
          <button 
            onClick={() => handleNavClick('tenants')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'tenants' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">factory</span>
            <span className="font-body-md text-body-md">Inquilinos y Sectores</span>
          </button>
          <button 
            onClick={() => handleNavClick('billing')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'billing' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-body-md text-body-md">Facturación</span>
          </button>
          <button 
            onClick={() => handleNavClick('payments')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'payments' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">payments</span>
            <span className="font-body-md text-body-md">Pagos Recibidos</span>
          </button>
          <button 
            onClick={() => handleNavClick('reports')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'reports' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-body-md text-body-md">Reporte General</span>
          </button>
          <button 
            onClick={() => handleNavClick('member_report')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'member_report' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">pie_chart</span>
            <span className="font-body-md text-body-md">Reporte por Miembro</span>
          </button>
          <button 
            onClick={() => handleNavClick('manual_billing')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'manual_billing' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">edit_document</span>
            <span className="font-body-md text-body-md">Registro Manual</span>
          </button>
          <button 
            onClick={() => handleNavClick('receipt_detail')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'receipt_detail' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">description</span>
            <span className="font-body-md text-body-md">Ver Recibo</span>
          </button>
          <div className="h-px bg-white/10 my-sm mx-xs"></div>
          <p className="px-md text-[10px] font-bold text-white/40 uppercase tracking-wider mb-xs">Configuración</p>
          <button 
            onClick={() => handleNavClick('users')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'users' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">manage_accounts</span>
            <span className="font-body-md text-body-md">Gestión de Usuarios</span>
          </button>
          <button 
            onClick={() => handleNavClick('settings')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'settings' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-md text-body-md">Ajustes Generales</span>
          </button>
          <button 
            onClick={() => handleNavClick('support')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'support' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">support_agent</span>
            <span className="font-body-md text-body-md">Soporte Técnico</span>
          </button>
        </nav>
        <div className="mt-auto flex items-center gap-sm px-xs pt-md border-t border-white/10">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-on-primary shadow-inner">
            AD
          </div>
          <div>
            <p className="font-body-md text-body-md font-bold text-white">Admin Principal</p>
            <button className="text-[11px] text-error hover:text-error/80 font-bold transition-colors">Cerrar Sesión</button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[240px] flex flex-col h-[calc(100vh-64px)] md:h-screen w-full relative">
        {/* TopAppBar */}
        <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md hidden md:flex justify-between items-center w-full px-lg h-16 border-b border-outline-variant">
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
            <div className="flex items-center gap-md relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-surface-container rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">account_circle</span>
              
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
          </div>
          <div className="flex items-center gap-md">
            <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-low transition-colors rounded-full text-on-surface-variant">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        {/* Content */}
        {renderContent()}

        {/* Footer */}
        <footer className="mt-auto bg-surface-container-highest flex justify-between items-center px-lg py-xs w-full border-t border-outline-variant">
          <div className="flex gap-lg items-center">
            <span className="font-label-caps text-label-caps text-on-surface-variant font-bold">© 2024 Parque Industrial Jicamarca</span>
            <div className="flex gap-md">
              <div className="flex items-center gap-xs">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ opacity: 1 }}></span>
                <span className="font-data-mono text-on-surface-variant text-[10px]">Estado: Activo | Latencia: 24ms</span>
              </div>
            </div>
          </div>
          <div className="flex gap-lg text-[10px] font-data-mono text-on-surface-variant uppercase tracking-wider">
            <a className="hover:text-primary transition-colors" href="#">Soporte Técnico</a>
            <a className="hover:text-primary transition-colors" href="#">Documentación API</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
