import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import FullScreenLoader from '../ui/FullScreenLoader';

/**
 * Envoltorio para proteger rutas basándose en los permisos del usuario.
 * @param {Object} props
 * @param {string} props.requiredRoute - Nombre de la ruta (ej. 'tenants', 'billing') requerida para acceder. Si no se pasa, solo verifica autenticación.
 * @param {React.ReactNode} props.children - Componente a renderizar si tiene acceso.
 */
const ProtectedRoute = ({ requiredRoute, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenLoader title="Verificando tu acceso" subtitle="Validando los permisos necesarios para abrir esta sección." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoute) {
    const userRutas = user.rutas || [];

    // Si la validación falla para un administrador o socio que intenta forzar la URL
    if (!userRutas.includes(requiredRoute)) {
      return <AccessDeniedRedirect />;
    }
  }

  return children;
};

const AccessDeniedRedirect = () => {
  useEffect(() => {
    toast.error('No tienes permisos para acceder a esta sección.');
  }, []);

  return <Navigate to="/dashboard" replace />;
};

export default ProtectedRoute;
