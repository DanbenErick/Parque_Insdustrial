import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'sonner';

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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getDeviceIcon = (userAgent) => {
    if (!userAgent) return 'desktop_windows';
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'smartphone';
    if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet_mac';
    return 'desktop_windows';
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
          <span className="material-symbols-outlined text-[18px]">refresh</span>
        </button>
      </div>

      <div className="overflow-x-auto">
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
                    <span className="material-symbols-outlined text-[14px]">
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
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">history_off</span>
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
            {!isLoading && <span className="material-symbols-outlined text-[16px]">expand_more</span>}
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
