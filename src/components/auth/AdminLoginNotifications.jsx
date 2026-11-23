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

const showLoginNotification = (session, currentUserId) => {
  const isSameAccount = Number(session.usuario_id) === Number(currentUserId);
  const accountName = session.nombre_razonsocial || 'Usuario del sistema';
  const roleAndTime = `${session.nombre_rol || 'Usuario'} · ${formatLoginTime(session.fecha_ingreso)}`;

  toast.custom((toastId) => (
    <div
      role="status"
      aria-live="polite"
      className="w-[min(92vw,400px)] overflow-hidden rounded-lg border border-outline-variant bg-surface text-on-surface shadow-2xl"
    >
      <div className="flex items-start gap-3 border-l-4 border-l-primary px-4 py-3.5">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-[20px]" translate="no">login</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
            Nuevo inicio de sesión
          </p>
          <p className="mt-1 truncate text-sm font-bold text-on-surface" title={accountName}>
            {isSameAccount ? 'Tu cuenta' : accountName}
          </p>
          <p className="mt-0.5 text-xs text-on-surface-variant">
            {isSameAccount ? 'Se inició una sesión adicional.' : 'Se conectó al sistema.'}
          </p>
          <p className="mt-2 font-data-mono text-[10px] font-semibold text-primary">
            {roleAndTime}
          </p>
        </div>

        <button
          type="button"
          onClick={() => toast.dismiss(toastId)}
          aria-label="Cerrar notificación"
          className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[18px]" translate="no">close</span>
        </button>
      </div>
    </div>
  ), {
    duration: 7000,
    position: 'top-right',
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
              showLoginNotification(session, user?.id);
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
