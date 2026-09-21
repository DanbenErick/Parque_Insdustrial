import  { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'sonner';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const getDeviceIcon = (userAgent) => {
  if (!userAgent) return 'devices';
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'smartphone';
  if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet_mac';
  return 'desktop_windows';
};

const getDeviceLabel = (userAgent) => {
  if (!userAgent) return 'Dispositivo desconocido';
  const ua = userAgent.toLowerCase();
  const device = ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')
    ? 'Móvil'
    : ua.includes('tablet') || ua.includes('ipad') ? 'Tablet' : 'Computadora';
  const browser = ua.includes('edg/') ? 'Edge'
    : ua.includes('firefox/') ? 'Firefox'
      : ua.includes('chrome/') ? 'Chrome'
        : ua.includes('safari/') ? 'Safari' : 'Navegador desconocido';
  return `${device} · ${browser}`;
};

const SessionMobileCard = ({ log }) => (
  <article className="bg-white px-4 py-3">
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/10 text-primary">
        <span className="material-symbols-outlined text-[18px]" translate="no">person</span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold leading-5 text-on-surface break-words">{log.nombre_razonsocial || 'Desconocido'}</h3>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="rounded bg-surface-container-high px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-on-surface-variant">{log.nombre_rol || 'Sin rol'}</span>
          <span className="text-[10px] font-medium text-on-surface-variant">{formatDate(log.fecha_ingreso)}</span>
        </div>
      </div>
    </div>

    <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-outline-variant/70 bg-surface-container-lowest p-2.5">
      <div className="min-w-0">
        <span className="block text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Dirección IP</span>
        <span className="mt-1 block truncate font-data-mono text-[11px] font-semibold text-on-surface">{log.ip_address || 'Desconocida'}</span>
      </div>
      <div className="min-w-0">
        <span className="block text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Dispositivo</span>
        <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-on-surface">
          <span className="material-symbols-outlined text-[14px] text-primary" translate="no">{getDeviceIcon(log.user_agent)}</span>
          <span className="truncate">{getDeviceLabel(log.user_agent)}</span>
        </span>
      </div>
    </div>
  </article>
);

const LoginHistoryTab = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 50;

  const fetchLogs = useCallback(async (pageNum = 1) => {
    try {
      setIsLoading(true);
      const response = await api.get('/auth/sesiones', {
        params: { page: pageNum, limit }
      });

      const newLogs = response.data || [];
      if (pageNum === 1) {
        setLogs(newLogs);
      } else {
        setLogs(prev => [...prev, ...newLogs]);
      }

      setHasMore(newLogs.length === limit);
    } catch (error) {
      toast.error('Error al cargar historial de sesiones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLogs(nextPage);
  };

  return (
    <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm animate-in fade-in">
      <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h2 className="text-base text-on-surface font-bold tracking-tight">Historial de Ingresos</h2>
            <span className="text-[11px] text-on-surface-variant font-medium">Registro de auditoría de todas las sesiones iniciadas</span>
          </div>
        </div>
        <button
          onClick={() => { setPage(1); fetchLogs(1); }}
          className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
          title="Actualizar"
        >
          <span className="material-symbols-outlined text-[18px]" translate="no">refresh</span>
        </button>
      </div>

      <div className="md:hidden divide-y divide-outline-variant/60 bg-surface">
        {logs.map((log) => <SessionMobileCard key={log.id} log={log} />)}
        {logs.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50" translate="no">history_off</span>
            <p>No hay registros de sesiones disponibles.</p>
          </div>
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto whitespace-nowrap">
          <thead>
            <tr className="bg-surface-container-lowest border-b border-outline-variant text-on-surface-variant text-[11px] uppercase tracking-wider">
              <th className="px-4 py-2 font-semibold">Usuario</th>
              <th className="px-4 py-2 font-semibold">Fecha y Hora</th>
              <th className="px-4 py-2 font-semibold">Dirección IP</th>
              <th className="px-4 py-2 font-semibold">Dispositivo / Navegador</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50 bg-surface">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-surface-container-lowest transition-colors">
                <td className="px-4 py-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-on-surface">{log.nombre_razonsocial || 'Desconocido'}</span>
                    <span className="text-[10px] text-on-surface-variant">{log.nombre_rol}</span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <span className="text-[11px] text-on-surface font-medium">
                    {formatDate(log.fecha_ingreso)}
                  </span>
                </td>
                <td className="px-4 py-2 font-data-mono text-[11px] text-on-surface-variant">
                  {log.ip_address || 'Desconocida'}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2 text-on-surface-variant" title={log.user_agent}>
                    <span className="material-symbols-outlined text-[14px]" translate="no">
                      {getDeviceIcon(log.user_agent)}
                    </span>
                    <span className="text-[10px] max-w-[200px] truncate">
                      {log.user_agent || 'Desconocido'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {logs.length === 0 && !isLoading && (
              <tr>
                <td colSpan="4" className="text-center py-12 text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50" translate="no">history_off</span>
                    <p>No hay registros de sesiones disponibles.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasMore && logs.length > 0 && (
        <div className="p-4 flex justify-center border-t border-outline-variant">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="text-xs font-bold text-primary hover:text-primary-fixed-variant transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {isLoading ? 'Cargando...' : 'Cargar más registros'}
            {!isLoading && <span className="material-symbols-outlined text-[16px]" translate="no">expand_more</span>}
          </button>
        </div>
      )}

      {isLoading && logs.length === 0 && (
        <div className="p-10 text-center text-on-surface-variant text-sm">Cargando registros...</div>
      )}
    </div>
  );
};

export default LoginHistoryTab;
