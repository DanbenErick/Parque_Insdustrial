import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';
import ConfirmActionModal from '../ui/ConfirmActionModal';

const identifyDevice = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  const isTablet = /ipad|tablet/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua));
  const isMobile = /iphone|ipod|android.*mobile|windows phone/.test(ua);

  let browser = 'Navegador desconocido';
  if (/edg\//.test(ua)) browser = 'Microsoft Edge';
  else if (/opr\//.test(ua)) browser = 'Opera';
  else if (/crios\//.test(ua)) browser = 'Google Chrome';
  else if (/chrome\//.test(ua)) browser = 'Google Chrome';
  else if (/fxios\/|firefox\//.test(ua)) browser = 'Mozilla Firefox';
  else if (/safari\//.test(ua)) browser = 'Safari';

  let system = 'Sistema desconocido';
  if (/iphone|ipad|ipod/.test(ua)) system = 'iOS';
  else if (/android/.test(ua)) system = 'Android';
  else if (/windows/.test(ua)) system = 'Windows';
  else if (/mac os|macintosh/.test(ua)) system = 'macOS';
  else if (/linux/.test(ua)) system = 'Linux';

  return {
    browser,
    system,
    icon: isTablet ? 'tablet_mac' : isMobile ? 'smartphone' : 'computer',
    type: isTablet ? 'Tablet' : isMobile ? 'Teléfono' : 'Computadora'
  };
};

const formatDate = (value) => {
  if (!value) return 'Sin registro';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin registro';
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

const ActiveSessionsCard = ({ embedded = false }) => {
  const [sessions, setSessions] = useState([]);
  const [requiresRelogin, setRequiresRelogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(null);
  const [closing, setClosing] = useState(false);

  const loadSessions = useCallback(async (showError = true) => {
    try {
      const { data } = await api.get('/auth/mis-sesiones');
      setSessions(Array.isArray(data?.data) ? data.data : []);
      setRequiresRelogin(Boolean(data?.requiresRelogin));
    } catch (error) {
      if (showError) toast.error(error.response?.data?.error || 'No se pudieron cargar tus sesiones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    api.get('/auth/mis-sesiones')
      .then(({ data }) => {
        if (!active) return;
        setSessions(Array.isArray(data?.data) ? data.data : []);
        setRequiresRelogin(Boolean(data?.requiresRelogin));
      })
      .catch((error) => {
        if (active) toast.error(error.response?.data?.error || 'No se pudieron cargar tus sesiones.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const confirmClose = async () => {
    if (!action) return;
    setClosing(true);
    try {
      const endpoint = action.type === 'all'
        ? '/auth/mis-sesiones/cerrar-otras'
        : `/auth/mis-sesiones/${action.session.id}`;
      const request = action.type === 'all' ? api.post(endpoint) : api.delete(endpoint);
      const { data } = await request;
      toast.success(data?.message || 'Sesión cerrada correctamente.');
      setAction(null);
      await loadSessions(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo cerrar la sesión.');
    } finally {
      setClosing(false);
    }
  };

  const otherSessions = sessions.filter((session) => !session.is_current);
  const shellClass = embedded
    ? 'pt-4 border-t border-outline-variant/30 mt-6'
    : 'rounded-xl border border-emerald-200 bg-white p-4 sm:p-5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-1000';

  return (
    <section className={shellClass}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary" translate="no">devices</span>
            <h3 className={`${embedded ? 'text-sm' : 'text-lg'} font-bold text-on-surface`}>Dispositivos con sesión iniciada</h3>
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">Revisa dónde está abierta tu cuenta y cierra cualquier acceso que no reconozcas.</p>
        </div>
        <button
          type="button"
          onClick={() => setAction({ type: 'all' })}
          disabled={loading || requiresRelogin || otherSessions.length === 0}
          className="shrink-0 rounded-lg border border-error/40 px-3 py-2 text-xs font-bold text-error transition-colors hover:bg-error/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Cerrar las demás sesiones
        </button>
      </div>

      {requiresRelogin && (
        <div className="mt-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <span className="material-symbols-outlined text-[18px]" translate="no">info</span>
          <p>Esta sesión fue iniciada antes de activar el control de dispositivos. Vuelve a iniciar sesión para identificar este equipo y habilitar el cierre conjunto.</p>
        </div>
      )}

      {loading ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-outline-variant/50 p-4 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-[18px]" translate="no">progress_activity</span>
          Cargando dispositivos…
        </div>
      ) : sessions.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-outline-variant p-4 text-center text-xs text-on-surface-variant">
          No hay sesiones administrables. Vuelve a iniciar sesión para registrar este dispositivo.
        </div>
      ) : (
        <div className="mt-4 divide-y divide-outline-variant/40 overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-lowest">
          {sessions.map((session) => {
            const device = identifyDevice(session.user_agent);
            return (
              <article key={session.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${session.is_current ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-[22px]" translate="no">{device.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-on-surface">{device.browser} en {device.system}</p>
                      {session.is_current && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Este dispositivo</span>}
                    </div>
                    <p className="mt-0.5 text-xs text-on-surface-variant">{device.type} · IP {session.ip_address || 'no disponible'}</p>
                    <p className="mt-1 text-[11px] text-on-surface-variant">Última actividad: {formatDate(session.fecha_ultima_actividad)} · Inicio: {formatDate(session.fecha_ingreso)}</p>
                  </div>
                </div>
                {!session.is_current && (
                  <button
                    type="button"
                    onClick={() => setAction({ type: 'one', session, device })}
                    className="self-end rounded-lg px-3 py-2 text-xs font-bold text-error transition-colors hover:bg-error/5 sm:self-center"
                  >
                    Cerrar sesión
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      {action && (
        <ConfirmActionModal
          title={action.type === 'all' ? 'Cerrar otras sesiones' : 'Cerrar sesión remota'}
          message={action.type === 'all'
            ? `Se cerrará tu cuenta en ${otherSessions.length} ${otherSessions.length === 1 ? 'dispositivo' : 'dispositivos'}. Este dispositivo seguirá conectado.`
            : `Se cerrará la sesión de ${action.device.browser} en ${action.device.system}.`}
          warningText="La próxima acción en esos dispositivos pedirá iniciar sesión nuevamente."
          confirmText={action.type === 'all' ? 'Cerrar las demás' : 'Cerrar sesión'}
          isDestructive
          isLoading={closing}
          icon="logout"
          onConfirm={confirmClose}
          onClose={() => { if (!closing) setAction(null); }}
        />
      )}
    </section>
  );
};

export default ActiveSessionsCard;
