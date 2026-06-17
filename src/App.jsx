import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

// Layouts
import Sidebar from './layouts/Sidebar';
import TopBar from './layouts/TopBar';

// Shared components
import PageTransition from './components/ui/PageTransition';
import ReloadPrompt from './components/ui/ReloadPrompt';

// Componente de carga para Lazy Pages
const PageLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[50vh] bg-surface gap-4">
    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
    <p className="mt-2 text-sm font-medium text-on-surface-variant animate-pulse">Cargando pantalla...</p>
  </div>
);

// Pages (Lazy Loaded)
const LoginPage = lazy(() => import('./pages/login/LoginPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const TenantsPage = lazy(() => import('./pages/tenants/TenantsPage'));
const BillingPage = lazy(() => import('./pages/billing/BillingPage'));
const PaymentsPage = lazy(() => import('./pages/payments/PaymentsPage'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
const GenerateInvoicesPage = lazy(() => import('./pages/invoices/GenerateInvoicesPage'));
const ReceiptDetailPage = lazy(() => import('./pages/receipt-detail/ReceiptDetailPage'));
const ManualBillingPage = lazy(() => import('./pages/manual-billing/ManualBillingPage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const SupportPage = lazy(() => import('./pages/support/SupportPage'));
const UserManagementPage = lazy(() => import('./pages/users/UserManagementPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isDarkMode } = useTheme();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userRutas = user?.rutas || [];

  const appScreens = useMemo(() => [
    { view: 'dashboard', name: 'Panel de Control', icon: 'dashboard', keywords: ['inicio', 'home', 'kpi', 'resumen'], hasAccess: userRutas.includes('dashboard') },
    { view: 'tenants', name: 'Socios', icon: 'factory', keywords: ['empresas', 'fabricas', 'socios', 'sectores', 'manzanas', 'propietarios'], hasAccess: userRutas.includes('tenants') },
    { view: 'billing', name: 'Facturación', icon: 'receipt_long', keywords: ['facturas', 'cobros', 'recibos', 'generar', 'boletas'], hasAccess: userRutas.includes('billing') },
    { view: 'payments', name: 'Pagos', icon: 'payments', keywords: ['pagos', 'ingresos', 'dinero', 'historial'], hasAccess: userRutas.includes('payments') },
    { view: 'reports', name: 'Reportes', icon: 'bar_chart', keywords: ['estadisticas', 'graficos', 'analisis'], hasAccess: userRutas.includes('reports') },
    { view: 'manual_billing', name: 'Lecturas', icon: 'edit_document', keywords: ['lectura', 'kwh', 'medidor', 'consumo'], hasAccess: userRutas.includes('manual_billing') },
    { view: 'users', name: 'Gestión de Usuarios', icon: 'manage_accounts', keywords: ['administradores', 'moderadores', 'cuentas', 'permisos', 'contraseñas'], isConfig: true, hasAccess: userRutas.includes('users') },
    { view: 'settings', name: 'Ajustes Generales', icon: 'settings', keywords: ['configuracion', 'parametros', 'sistema'], isConfig: true, hasAccess: userRutas.includes('settings') },
    { view: 'support', name: 'Soporte Técnico', icon: 'support_agent', keywords: ['ayuda', 'contacto', 'problemas', 'ticket'], hasAccess: userRutas.includes('support') },
  ], [userRutas]);

  const visibleScreens = useMemo(() => appScreens.filter(s => s.hasAccess), [appScreens]);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" theme={isDarkMode ? 'dark' : 'light'} richColors />
      <ReloadPrompt />
      <div className="bg-surface font-body-md text-on-surface antialiased flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden relative">

        {/* Mobile Top Bar */}
        <header className="md:hidden shrink-0 flex items-center justify-between p-4 bg-surface-dim text-white shadow-md z-40 print:hidden">
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
            onClick={closeMobileMenu}
          ></div>
        )}

        {/* Sidebar */}
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={closeMobileMenu}
          screens={visibleScreens}
        />

        {/* Main Content Area */}
        <div className="flex-1 ml-0 md:ml-[260px] flex flex-col min-h-0 bg-background dark:bg-[#1a1c1e]">
          <TopBar screens={visibleScreens} />

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
            <AnimatePresence mode="wait">
              <Suspense fallback={<PageLoader />}>
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
                  <Route path="/tenants" element={<PageTransition><TenantsPage /></PageTransition>} />
                  <Route path="/billing" element={<PageTransition><BillingPage /></PageTransition>} />
                  <Route path="/payments" element={<PageTransition><PaymentsPage /></PageTransition>} />
                  <Route path="/reports" element={<PageTransition><ReportsPage /></PageTransition>} />
                  <Route path="/generate_invoices" element={<PageTransition><GenerateInvoicesPage /></PageTransition>} />
                  <Route path="/manual_billing" element={<PageTransition><ManualBillingPage /></PageTransition>} />
                  <Route path="/receipt_detail" element={<PageTransition><ReceiptDetailPage /></PageTransition>} />
                  <Route path="/users" element={<PageTransition><UserManagementPage /></PageTransition>} />
                  <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
                  <Route path="/support" element={<PageTransition><SupportPage /></PageTransition>} />
                  <Route path="/login" element={<Navigate to="/dashboard" />} />
                  <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
                </Routes>
              </Suspense>
            </AnimatePresence>
          </div>

          {/* Footer removed per user request */}
        </div>
      </div>
    </>
  );
}

export default App;
