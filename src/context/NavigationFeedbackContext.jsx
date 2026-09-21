import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ROUTE_LABELS = {
  '/dashboard': 'Panel de Control',
  '/tenants': 'Socios',
  '/billing': 'Facturación',
  '/payments': 'Pagos',
  '/reports': 'Reportes',
  '/manual_billing': 'Lecturas',
  '/generate_invoices': 'Generación de Recibos',
  '/receipt_detail': 'Detalle del Recibo',
  '/users': 'Gestión de Usuarios',
  '/settings': 'Ajustes Generales',
  '/profile': 'Perfil',
  '/login': 'Inicio de Sesión',
};

const NavigationFeedbackContext = createContext(null);
const MINIMUM_VISIBLE_MS = 180;

const normalizePath = (destination) => typeof destination === 'string' ? destination.split('?')[0].split('#')[0] : null;

export const getNavigationLabel = (destination) => {
  const path = normalizePath(destination);
  return ROUTE_LABELS[path] || 'la siguiente sección';
};

export const NavigationFeedbackProvider = ({ children }) => {
  const [navigationTarget, setNavigationTarget] = useState(null);
  const targetRef = useRef(null);
  const sequenceRef = useRef(0);
  const closeTimerRef = useRef(null);

  const beginNavigation = useCallback((destination, label) => {
    window.clearTimeout(closeTimerRef.current);
    const id = ++sequenceRef.current;
    const target = {
      id,
      path: normalizePath(destination),
      label: label || getNavigationLabel(destination),
      startedAt: performance.now(),
    };
    targetRef.current = target;
    setNavigationTarget(target);
  }, []);

  const completeNavigation = useCallback((currentPath) => {
    const target = targetRef.current;
    if (!target || (target.path && target.path !== currentPath)) return;
    const remaining = Math.max(0, MINIMUM_VISIBLE_MS - (performance.now() - target.startedAt));
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      if (targetRef.current?.id !== target.id) return;
      targetRef.current = null;
      setNavigationTarget(null);
    }, remaining);
  }, []);

  const value = useMemo(() => ({ navigationTarget, beginNavigation, completeNavigation }), [navigationTarget, beginNavigation, completeNavigation]);
  return <NavigationFeedbackContext.Provider value={value}>{children}</NavigationFeedbackContext.Provider>;
};

export const useNavigationFeedback = () => {
  const context = useContext(NavigationFeedbackContext);
  if (!context) throw new Error('useNavigationFeedback debe usarse dentro de NavigationFeedbackProvider');
  return context;
};

export const useAppNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { beginNavigation } = useNavigationFeedback();

  return useCallback((destination, options, label) => {
    const nextPath = normalizePath(destination);
    if (nextPath && nextPath === location.pathname && !String(destination).includes('?')) return;
    beginNavigation(destination, label);
    window.requestAnimationFrame(() => navigate(destination, options));
  }, [beginNavigation, location.pathname, navigate]);
};
