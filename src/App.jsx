import { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './context/AuthContext';

import PwaInstallPrompt from './components/ui/PwaInstallPrompt';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layouts
import Sidebar from './layouts/Sidebar';
import SocioSidebar from './layouts/SocioSidebar';
import SocioTopBar from './layouts/SocioTopBar';
import MobileBottomNav from './components/layout/MobileBottomNav';

// Shared components
import PageTransition from './components/ui/PageTransition';
import ReloadPrompt from './components/ui/ReloadPrompt';
import FullScreenLoader from './components/ui/FullScreenLoader';
import { useNavigationFeedback } from './context/NavigationFeedbackContext';

// Componente de carga para Lazy Pages
const PageLoader = () => (
  <FullScreenLoader title="Abriendo la sección" subtitle="Preparando el contenido que necesitas." />
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
const UserManagementPage = lazy(() => import('./pages/users/UserManagementPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Socio Pages
const SocioDashboardPage = lazy(() => import('./pages/socio/SocioDashboardPage'));
const SocioBillingPage = lazy(() => import('./pages/socio/SocioBillingPage'));
const SocioPaymentsPage = lazy(() => import('./pages/socio/SocioPaymentsPage'));
const SocioProfilePage = lazy(() => import('./pages/socio/SocioProfilePage'));

function App() {

  const { user, isAuthenticated, isLoading } = useAuth();
  const { navigationTarget } = useNavigationFeedback();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userRutas = useMemo(() => user?.rutas || [], [user?.rutas]);

  const appScreens = useMemo(() => [
    { view: 'dashboard', name: 'Panel de Control', icon: 'dashboard', keywords: ['inicio', 'home', 'kpi', 'resumen'], hasAccess: userRutas.includes('dashboard') },
    { view: 'tenants', name: 'Socios', icon: 'factory', keywords: ['empresas', 'fabricas', 'socios', 'sectores', 'manzanas', 'propietarios'], hasAccess: userRutas.includes('tenants') },
    { view: 'billing', name: 'Facturación', icon: 'receipt_long', keywords: ['facturas', 'cobros', 'recibos', 'generar', 'boletas'], hasAccess: userRutas.includes('billing') },
    { view: 'payments', name: 'Pagos', icon: 'payments', keywords: ['pagos', 'ingresos', 'dinero', 'historial'], hasAccess: userRutas.includes('payments') },
    { view: 'reports', name: 'Reportes', icon: 'bar_chart', keywords: ['estadisticas', 'graficos', 'analisis'], hasAccess: userRutas.includes('reports') },
    { view: 'manual_billing', name: 'Lecturas', icon: 'edit_document', keywords: ['lectura', 'kwh', 'medidor', 'consumo'], hasAccess: userRutas.includes('manual_billing') },
    { view: 'users', name: 'Gestión de Usuarios', icon: 'manage_accounts', keywords: ['administradores', 'moderadores', 'cuentas', 'permisos', 'contraseñas'], isConfig: true, hasAccess: userRutas.includes('users') },
    { view: 'settings', name: 'Ajustes Generales', icon: 'settings', keywords: ['configuracion', 'parametros', 'sistema'], isConfig: true, hasAccess: userRutas.includes('settings') },
  ], [userRutas]);

  const visibleScreens = useMemo(() => appScreens.filter(s => s.hasAccess), [appScreens]);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  if (isLoading) {
    return <FullScreenLoader title="Recuperando tu sesión" subtitle="Validando tus credenciales y preferencias de acceso." />;
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

        {/* Mobile Top Bar (Compacto y único) */}
        {Number(user?.rol_id) === 3 ? (
          <header className="md:hidden shrink-0 flex items-center justify-between px-3.5 py-1.5 h-12 bg-white border-b border-outline-variant/30 text-emerald-900 shadow-xs z-40 print:hidden">
            <div className="flex items-center gap-2.5">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600">
                <span className="material-symbols-outlined text-[24px]" translate="no">menu</span>
              </button>
              <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center overflow-hidden border border-emerald-100 shrink-0">
                <img src="/logo-192.png" alt="Logo" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <span className="font-bold text-[13px]">Portal Cliente</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-[11px] uppercase shadow-inner">
              {user?.nombre_razonsocial ? user.nombre_razonsocial.substring(0, 1) : 'S'}
            </div>
          </header>
        ) : (
          <header className="md:hidden shrink-0 flex items-center justify-between px-3.5 py-1.5 h-12 bg-surface text-on-surface shadow-xs border-b border-outline-variant/40 z-40 print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-outline-variant/30 bg-white">
                <img src="/logo-192.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-on-surface text-[13px] leading-tight tracking-tight">Parque Industrial</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center font-bold text-on-primary text-[11px] uppercase shadow-inner shadow-primary/20">
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
            <MobileBottomNav screens={visibleScreens} />
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col pb-[70px] md:pb-0">

            {navigationTarget && (
              <div className={`fixed left-0 right-0 top-12 z-[70] md:left-[260px] md:top-0 md:bottom-0 ${Number(user?.rol_id) === 3 ? 'bottom-0' : 'bottom-16'}`}>
                <FullScreenLoader
                  title={`Redirigiendo a ${navigationTarget.label}`}
                  subtitle="Preparando la siguiente pantalla. Esto puede tomar unos segundos según tu conexión."
                />
              </div>
            )}

            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<ProtectedRoute requiredRoute={Number(user?.rol_id) === 3 ? null : "dashboard"}><PageTransition>{Number(user?.rol_id) === 3 ? <SocioDashboardPage /> : <DashboardPage />}</PageTransition></ProtectedRoute>} />
                <Route path="/tenants" element={<ProtectedRoute requiredRoute="tenants"><PageTransition><TenantsPage /></PageTransition></ProtectedRoute>} />
                <Route path="/billing" element={<ProtectedRoute requiredRoute={Number(user?.rol_id) === 3 ? null : "billing"}><PageTransition>{Number(user?.rol_id) === 3 ? <SocioBillingPage /> : <BillingPage />}</PageTransition></ProtectedRoute>} />
                <Route path="/payments" element={<ProtectedRoute requiredRoute={Number(user?.rol_id) === 3 ? null : "payments"}><PageTransition>{Number(user?.rol_id) === 3 ? <SocioPaymentsPage /> : <PaymentsPage />}</PageTransition></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute requiredRoute={Number(user?.rol_id) === 3 ? null : "profile"}><PageTransition>{Number(user?.rol_id) === 3 ? <SocioProfilePage /> : <Navigate to="/dashboard" />}</PageTransition></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute requiredRoute="reports"><PageTransition><ReportsPage /></PageTransition></ProtectedRoute>} />
                <Route path="/generate_invoices" element={<ProtectedRoute requiredRoute="billing"><PageTransition><GenerateInvoicesPage /></PageTransition></ProtectedRoute>} />
                <Route path="/manual_billing" element={<ProtectedRoute requiredRoute="manual_billing"><PageTransition><ManualBillingPage /></PageTransition></ProtectedRoute>} />
                <Route path="/receipt_detail" element={<ProtectedRoute requiredRoute="billing"><PageTransition><ReceiptDetailPage /></PageTransition></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute requiredRoute="users"><PageTransition><UserManagementPage /></PageTransition></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute requiredRoute="settings"><PageTransition><SettingsPage /></PageTransition></ProtectedRoute>} />
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
