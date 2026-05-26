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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tenants':
        return <TenantsAndSectors />;
      case 'billing':
        return <Billing />;
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
    <div className="bg-surface font-body-md text-on-surface antialiased flex min-h-screen">
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full w-[240px] border-r border-outline-variant flex flex-col p-md gap-sm z-50 bg-surface-dim text-white shadow-2xl">
        <div className="mb-lg px-xs">
          <h1 className="font-headline-sm text-headline-sm font-bold text-primary-fixed">Parque Industrial Jicamarca</h1>
          <p className="font-body-sm text-body-sm text-white/60">Gestión Industrial</p>
        </div>
        <nav className="flex flex-col gap-xs flex-grow">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'dashboard' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-body-md text-body-md">Panel de Control</span>
          </button>
          <button 
            onClick={() => setCurrentView('tenants')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'tenants' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">factory</span>
            <span className="font-body-md text-body-md">Inquilinos y Sectores</span>
          </button>
          <button 
            onClick={() => setCurrentView('billing')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'billing' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-body-md text-body-md">Facturación</span>
          </button>
          <button 
            onClick={() => setCurrentView('payments')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'payments' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">payments</span>
            <span className="font-body-md text-body-md">Pagos Recibidos</span>
          </button>
          <button 
            onClick={() => setCurrentView('reports')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'reports' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-body-md text-body-md">Reporte General</span>
          </button>
          <button 
            onClick={() => setCurrentView('member_report')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'member_report' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">pie_chart</span>
            <span className="font-body-md text-body-md">Reporte por Miembro</span>
          </button>
          <button 
            onClick={() => setCurrentView('generate_invoices')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'generate_invoices' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">receipt</span>
            <span className="font-body-md text-body-md">Generar Facturas</span>
          </button>
          <button 
            onClick={() => setCurrentView('manual_billing')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'manual_billing' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">edit_document</span>
            <span className="font-body-md text-body-md">Registro Manual</span>
          </button>
          <button 
            onClick={() => setCurrentView('receipt_detail')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'receipt_detail' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">description</span>
            <span className="font-body-md text-body-md">Ver Recibo</span>
          </button>
        </nav>
        <div className="mt-auto pt-md border-t border-white/10 flex flex-col gap-xs">
          <button 
            onClick={() => setCurrentView('users')}
            className={`flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left ${currentView === 'users' ? 'bg-primary text-on-primary font-semibold shadow-lg' : 'text-white/70 hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined">manage_accounts</span>
            <span className="font-body-md text-body-md">Gestión de Usuarios</span>
          </button>
          <button className="flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left text-white/70 hover:bg-white/10">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-md text-body-md">Configuración</span>
          </button>
          <button className="flex items-center gap-md px-md py-sm rounded-lg transition-all w-full text-left text-white/70 hover:bg-white/10">
            <span className="material-symbols-outlined">contact_support</span>
            <span className="font-body-md text-body-md">Soporte</span>
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="ml-[240px] flex flex-col flex-grow">
        {/* TopAppBar */}
        <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center w-full px-lg h-16 border-b border-outline-variant">
          <div className="flex items-center gap-lg">
            <div className="relative hidden lg:block">
              <input 
                type="text" 
                placeholder="Buscar inquilino, sector, recibo..." 
                className="pl-xl pr-md py-xs bg-surface-container border border-outline rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
              />
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant scale-75">search</span>
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
