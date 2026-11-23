import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const POLL_INTERVAL_MS = 10 * 1000;

const formatLoginTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Ahora';
  return date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminLoginNotifications() {
  const { user, isAuthenticated } = useAuth();
  const lastSessionIdRef = useRef(0);
  const initializedRef = useRef(false);
  const requestInFlightRef = useRef(false);
  const isAdmin = Number(user?.rol_id) === 1 || user?.nombre_rol === 'Admin';

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return undefined;

    let isActive = true;
    let intervalId;

    const checkRecentLogins = async () => {
      if (!isActive || requestInFlightRef.current) return;
      requestInFlightRef.current = true;

      try {
        const response = await api.get('/auth/sesiones/recientes', {
          params: { after: lastSessionIdRef.current, limit: 50 },
        });
        if (!isActive) return;

        const sessions = Array.isArray(response.data?.data) ? response.data.data : [];
        const latestId = Number(response.data?.latestId) || lastSessionIdRef.current;

        if (initializedRef.current) {
          sessions
            .forEach((session) => {
              const isSameAccount = Number(session.usuario_id) === Number(user?.id);
              const title = isSameAccount
                ? `Se ha iniciado una nueva sesión con tu cuenta`
                : `${session.nombre_razonsocial || 'Un usuario'} se ha conectado al sistema`;
              toast.info(title, {
                description: `${session.nombre_rol || 'Usuario'} · ${formatLoginTime(session.fecha_ingreso)}`,
                duration: 7000,
                icon: '👤',
              });
            });
        }

        lastSessionIdRef.current = Math.max(lastSessionIdRef.current, latestId);
        initializedRef.current = true;
      } catch (error) {
        // La sesión global ya maneja 401/403. Los fallos temporales de red se
        // recuperan en el siguiente ciclo sin interrumpir al administrador.
        if (import.meta.env.DEV && error?.response?.status !== 401 && error?.response?.status !== 403) {
          console.warn('No se pudieron consultar los inicios de sesión recientes', error);
        }
      } finally {
        requestInFlightRef.current = false;
      }
    };

    checkRecentLogins();
    intervalId = window.setInterval(checkRecentLogins, POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkRecentLogins();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      lastSessionIdRef.current = 0;
      initializedRef.current = false;
      requestInFlightRef.current = false;
    };
  }, [isAdmin, isAuthenticated, user?.id]);

  return null;
}
