import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import PwaInstallPrompt from './components/ui/PwaInstallPrompt';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layouts
import Sidebar from './layouts/Sidebar';
import TopBar from './layouts/TopBar';
import SocioSidebar from './layouts/SocioSidebar';
import SocioTopBar from './layouts/SocioTopBar';
import MobileBottomNav from './components/layout/MobileBottomNav';

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

// Socio Pages
const SocioDashboardPage = lazy(() => import('./pages/socio/SocioDashboardPage'));
const SocioBillingPage = lazy(() => import('./pages/socio/SocioBillingPage'));
const SocioPaymentsPage = lazy(() => import('./pages/socio/SocioPaymentsPage'));
const SocioProfilePage = lazy(() => import('./pages/socio/SocioProfilePage'));

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
      <Toaster 
        position="top-center" 
        expand={true}
        duration={4000}
        toastOptions={{
          classNames: {
            toast: 'w-full flex items-center gap-3 !rounded-xl !border-0 !shadow-2xl',
            title: 'text-[16px] font-bold tracking-wide',
            success: '!bg-green-600 !text-white',
            error: '!bg-red-600 !text-white',
            warning: '!bg-orange-600 !text-white',
            info: '!bg-blue-600 !text-white',
          },
          style: { padding: '18px 24px' }
        }}
      />
      <ReloadPrompt />
      <div className="bg-surface font-body-md text-on-surface antialiased flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden relative">

        {/* Mobile Top Bar */}
        {Number(user?.rol_id) === 3 ? (
          <header className="md:hidden shrink-0 flex items-center justify-between p-4 bg-white border-b border-outline-variant/30 text-emerald-900 shadow-sm z-40 print:hidden">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600">
                <span className="material-symbols-outlined text-[28px]">menu</span>
              </button>
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center overflow-hidden border border-emerald-100">
                <img src="/logo.png" alt="Logo" className="w-[85%] h-[85%] object-contain drop-shadow-sm" />
              </div>
              <span className="font-bold text-[14px]">Portal Cliente</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-xs uppercase shadow-inner">
              {user?.nombre_razonsocial ? user.nombre_razonsocial.substring(0, 1) : 'S'}
            </div>
          </header>
        ) : (
          <header className="md:hidden shrink-0 flex items-center justify-between p-4 bg-surface text-on-surface shadow-sm border-b border-outline-variant/50 z-40 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="Logo" className="w-[85%] h-[85%] object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-on-surface text-[14px] leading-tight tracking-tight">Parque Industrial</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-on-primary text-xs uppercase shadow-inner shadow-primary/20">
              {user?.nombre_razonsocial ? user.nombre_razonsocial.substring(0, 2) : 'AD'}
            </div>
          </header>
        )}

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
            onClick={closeMobileMenu}
          ></div>
        )}

        {/* Sidebar */}
        {Number(user?.rol_id) === 3 ? (
          <SocioSidebar
            isMobileMenuOpen={isMobileMenuOpen}
            onCloseMobileMenu={closeMobileMenu}
          />
        ) : (
          <Sidebar
            isMobileMenuOpen={isMobileMenuOpen}
            onCloseMobileMenu={closeMobileMenu}
            screens={visibleScreens}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 ml-0 md:ml-[260px] flex flex-col min-h-0 bg-background dark:bg-[#1a1c1e]">
          {Number(user?.rol_id) === 3 ? (
            <SocioTopBar />
          ) : (
            <>
              <TopBar screens={visibleScreens} />
              <MobileBottomNav screens={visibleScreens} />
            </>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col pb-[70px] md:pb-0">
            
              <Suspense fallback={<PageLoader />}>
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<ProtectedRoute requiredRoute="dashboard"><PageTransition>{Number(user?.rol_id) === 3 ? <SocioDashboardPage /> : <DashboardPage />}</PageTransition></ProtectedRoute>} />
                  <Route path="/tenants" element={<ProtectedRoute requiredRoute="tenants"><PageTransition><TenantsPage /></PageTransition></ProtectedRoute>} />
                  <Route path="/billing" element={<ProtectedRoute requiredRoute="billing"><PageTransition>{Number(user?.rol_id) === 3 ? <SocioBillingPage /> : <BillingPage />}</PageTransition></ProtectedRoute>} />
                  <Route path="/payments" element={<ProtectedRoute requiredRoute="payments"><PageTransition>{Number(user?.rol_id) === 3 ? <SocioPaymentsPage /> : <PaymentsPage />}</PageTransition></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute requiredRoute="profile"><PageTransition>{Number(user?.rol_id) === 3 ? <SocioProfilePage /> : <Navigate to="/dashboard" />}</PageTransition></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute requiredRoute="reports"><PageTransition><ReportsPage /></PageTransition></ProtectedRoute>} />
                  <Route path="/generate_invoices" element={<ProtectedRoute requiredRoute="billing"><PageTransition><GenerateInvoicesPage /></PageTransition></ProtectedRoute>} />
                  <Route path="/manual_billing" element={<ProtectedRoute requiredRoute="manual_billing"><PageTransition><ManualBillingPage /></PageTransition></ProtectedRoute>} />
                  <Route path="/receipt_detail" element={<ProtectedRoute requiredRoute="billing"><PageTransition><ReceiptDetailPage /></PageTransition></ProtectedRoute>} />
                  <Route path="/users" element={<ProtectedRoute requiredRoute="users"><PageTransition><UserManagementPage /></PageTransition></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute requiredRoute="settings"><PageTransition><SettingsPage /></PageTransition></ProtectedRoute>} />
                  <Route path="/support" element={<ProtectedRoute requiredRoute="support"><PageTransition><SupportPage /></PageTransition></ProtectedRoute>} />
                  <Route path="/login" element={<Navigate to="/dashboard" />} />
                  <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
                </Routes>
              </Suspense>
            
          </div>

          {/* Footer removed per user request */}
        </div>
      </div>
      <PwaInstallPrompt />
    </>
  );
}

export default App;
