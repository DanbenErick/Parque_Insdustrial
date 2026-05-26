import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TenantsAndSectors from './components/TenantsAndSectors';
import Billing from './components/Billing';
import Payments from './components/Payments';
import Reports from './components/Reports';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

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
            <span className="material-symbols-outlined">monitoring</span>
            <span className="font-body-md text-body-md">Reportes</span>
          </button>
        </nav>
        <div className="mt-auto pt-md border-t border-white/10 flex items-center gap-sm">
          <div className="w-8 h-8 rounded-full bg-primary-fixed-dim flex items-center justify-center text-on-primary-fixed font-bold text-xs">RA</div>
          <div className="flex flex-col overflow-hidden text-left">
            <span className="font-body-sm text-body-sm font-semibold truncate">Ing. Ricardo Alva</span>
            <span className="text-[10px] text-white/50">Adm. de Parque</span>
          </div>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="ml-[240px] flex flex-col flex-grow">
        {/* TopAppBar */}
        <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center w-full px-lg h-16 border-b border-outline-variant">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input className="w-full bg-surface-container-low border-none rounded-lg pl-xl pr-md py-sm font-body-sm focus:ring-1 focus:ring-primary outline-none" placeholder="Buscar inquilino, sector o medidor..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-low transition-colors rounded-full text-on-surface-variant">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-low transition-colors rounded-full text-on-surface-variant relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
            </button>
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
