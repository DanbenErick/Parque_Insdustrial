import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';

const formatDate = (value) => value
  ? new Date(value).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '-';

const getDeviceIcon = (userAgent) => {
  const ua = String(userAgent || '').toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'smartphone';
  if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet_mac';
  return 'desktop_windows';
};

const getDeviceLabel = (userAgent) => {
  if (!userAgent) return 'Dispositivo desconocido';
  const ua = userAgent.toLowerCase();
  const device = ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') ? 'Móvil' : ua.includes('tablet') || ua.includes('ipad') ? 'Tablet' : 'Computadora';
  const browser = ua.includes('edg/') ? 'Edge' : ua.includes('firefox/') ? 'Firefox' : ua.includes('chrome/') ? 'Chrome' : ua.includes('safari/') ? 'Safari' : 'Navegador desconocido';
  return `${device} · ${browser}`;
};

const SessionHistoryTab = () => {
  const [sessions, setSessions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const limit = 50;

  const fetchSessions = useCallback(async (pageNum = 1, append = false) => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/auth/sesiones', { params: { page: pageNum, limit } });
      const rows = data || [];
      setSessions((current) => append ? [...current, ...rows] : rows);
      setHasMore(rows.length === limit);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al cargar los inicios de sesión.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSessions(1); }, [fetchSessions]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSessions(nextPage, true);
  };

  return (
    <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm animate-in fade-in">
      <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
        <div><h2 className="text-base text-on-surface font-bold tracking-tight">Historial de Inicios de Sesión</h2><span className="text-[11px] text-on-surface-variant font-medium">Cada ingreso registrado, del más reciente al más antiguo</span></div>
        <button type="button" onClick={() => { setPage(1); fetchSessions(1); }} className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors" title="Actualizar"><span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`} translate="no">refresh</span></button>
      </div>

      <div className="md:hidden divide-y divide-outline-variant/60">
        {sessions.map((session) => (
          <article key={session.id} className="px-4 py-3 bg-surface">
            <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/10 text-primary"><span className="material-symbols-outlined text-[18px]" translate="no">person</span></span><div className="min-w-0 flex-1"><h3 className="text-sm font-bold text-on-surface break-words">{session.nombre_razonsocial || 'Desconocido'}</h3><div className="mt-0.5 flex flex-wrap items-center gap-2"><span className="text-[10px] font-bold uppercase text-on-surface-variant">{session.nombre_rol || 'Sin rol'}</span><span className="text-[10px] text-on-surface-variant">{formatDate(session.fecha_ingreso)}</span></div></div></div>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-outline-variant/70 bg-surface-container-lowest p-2.5"><div><span className="block text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Dirección IP</span><span className="mt-1 block truncate font-data-mono text-[11px] font-semibold text-on-surface">{session.ip_address || 'Desconocida'}</span></div><div><span className="block text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Dispositivo</span><span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-on-surface"><span className="material-symbols-outlined text-[14px] text-primary" translate="no">{getDeviceIcon(session.user_agent)}</span><span className="truncate">{getDeviceLabel(session.user_agent)}</span></span></div></div>
          </article>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto whitespace-nowrap">
          <thead><tr className="bg-surface-container-lowest border-b border-outline-variant text-on-surface-variant text-[11px] uppercase tracking-wider"><th className="px-4 py-2 font-semibold">Usuario</th><th className="px-4 py-2 font-semibold">Fecha y Hora</th><th className="px-4 py-2 font-semibold">Dirección IP</th><th className="px-4 py-2 font-semibold">Dispositivo / Navegador</th></tr></thead>
          <tbody className="divide-y divide-outline-variant/50 bg-surface">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-surface-container-lowest transition-colors">
                <td className="px-4 py-2"><div className="flex flex-col"><span className="text-[11px] font-bold text-on-surface">{session.nombre_razonsocial || 'Desconocido'}</span><span className="text-[10px] text-on-surface-variant">{session.nombre_rol || 'Sin rol'}</span></div></td>
                <td className="px-4 py-2"><span className="text-[11px] font-medium text-on-surface">{formatDate(session.fecha_ingreso)}</span></td>
                <td className="px-4 py-2 font-data-mono text-[11px] text-on-surface-variant">{session.ip_address || 'Desconocida'}</td>
                <td className="px-4 py-2"><div className="flex items-center gap-2 text-on-surface-variant" title={session.user_agent}><span className="material-symbols-outlined text-[14px]" translate="no">{getDeviceIcon(session.user_agent)}</span><span className="text-[10px] max-w-[260px] truncate">{getDeviceLabel(session.user_agent)}</span></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isLoading && sessions.length === 0 && <div className="flex flex-col items-center justify-center px-5 py-12 text-center text-on-surface-variant"><span className="material-symbols-outlined text-4xl mb-2 opacity-50" translate="no">history_off</span><p>No hay inicios de sesión registrados.</p></div>}
      {isLoading && sessions.length === 0 && <div className="p-10 text-center text-on-surface-variant text-sm">Cargando registros...</div>}
      {hasMore && sessions.length > 0 && <div className="p-4 flex justify-center border-t border-outline-variant"><button type="button" onClick={loadMore} disabled={isLoading} className="text-xs font-bold text-primary hover:text-primary-fixed-variant disabled:opacity-50 flex items-center gap-1">{isLoading ? 'Cargando...' : 'Cargar más registros'}{!isLoading && <span className="material-symbols-outlined text-[16px]" translate="no">expand_more</span>}</button></div>}
    </div>
  );
};

export default SessionHistoryTab;
