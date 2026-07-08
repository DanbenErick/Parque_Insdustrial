import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

/**
 * Envoltorio para proteger rutas basándose en los permisos del usuario.
 * @param {Object} props
 * @param {string} props.requiredRoute - Nombre de la ruta (ej. 'tenants', 'billing') requerida para acceder. Si no se pasa, solo verifica autenticación.
 * @param {React.ReactNode} props.children - Componente a renderizar si tiene acceso.
 */
const ProtectedRoute = ({ requiredRoute, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[50vh] bg-surface gap-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-2 text-sm font-medium text-on-surface-variant animate-pulse">Verificando accesos...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoute) {
    const userRutas = user.rutas || [];
    
    // Si la validación falla para un administrador o socio que intenta forzar la URL
    if (!userRutas.includes(requiredRoute)) {
      // Mostrar un toast amigable si intentan acceder forzosamente
      setTimeout(() => {
        toast.error('No tienes permisos para acceder a esta sección.');
      }, 0);
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
