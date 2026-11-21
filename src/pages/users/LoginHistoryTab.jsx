import { Fragment, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';

const CATEGORY_META = {
  sesion: { label: 'Inicio de sesión', icon: 'login', color: 'text-blue-700 bg-blue-50' },
  ticket: { label: 'Ticket', icon: 'confirmation_number', color: 'text-emerald-700 bg-emerald-50' },
  recibo: { label: 'Recibo', icon: 'receipt_long', color: 'text-amber-700 bg-amber-50' },
  reporte: { label: 'Reporte', icon: 'assessment', color: 'text-violet-700 bg-violet-50' },
  operacion: { label: 'Operación', icon: 'manage_history', color: 'text-red-700 bg-red-50' }
};

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
  const browser = ua.includes('edg/') ? 'Edge' : ua.includes('firefox/') ? 'Firefox' : ua.includes('chrome/') ? 'Chrome' : ua.includes('safari/') ? 'Safari' : 'Navegador';
  return `${device} · ${browser}`;
};

const parseAuditValues = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return {}; }
};

const getOperationChanges = (details) => {
  const before = parseAuditValues(details?.valores_anteriores);
  const after = parseAuditValues(details?.valores_nuevos);
  const ignored = new Set(['id', 'usuario_id', 'recibo_id', 'medidor_id', 'periodo_id', 'operario_id', 'num_serie', 'periodo', 'numero_comprobante']);
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((key) => !ignored.has(key) && JSON.stringify(before[key] ?? null) !== JSON.stringify(after[key] ?? null))
    .slice(0, 6)
    .map((key) => ({ key, before: before[key], after: after[key] }));
};

const auditValue = (value) => {
  if (value === null || value === undefined || value === '') return 'Sin valor';
  if (typeof value === 'object') return Array.isArray(value) ? `${value.length} elemento(s)` : 'Datos actualizados';
  return String(value);
};

const ActivityDetail = ({ user, result, isLoading }) => {
  if (isLoading) return <div className="py-8 text-center text-xs text-on-surface-variant">Cargando detalles...</div>;
  const events = result?.data || [];
  return (
    <div className="bg-surface-container-lowest border-t border-outline-variant px-4 md:px-6 py-4 whitespace-normal">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
        {[
          ['login', 'Ingresos', user.sesiones],
          ['confirmation_number', 'Tickets', user.tickets],
          ['receipt_long', 'Recibos', user.recibos],
          ['assessment', 'Reportes', user.reportes],
          ['manage_history', 'Operaciones', user.operaciones]
        ].map(([icon, label, value]) => (
          <div key={label} className="rounded-lg border border-outline-variant bg-surface px-3 py-2">
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-on-surface-variant"><span className="material-symbols-outlined text-[14px]" translate="no">{icon}</span>{label}</span>
            <span className="block mt-1 text-sm font-bold text-on-surface">{value}</span>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-outline-variant bg-surface overflow-hidden">
        <div className="px-3 py-2 border-b border-outline-variant bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Historial detallado</div>
        <div className="max-h-[420px] overflow-y-auto custom-scrollbar divide-y divide-outline-variant/60">
          {events.map((event) => {
            const meta = CATEGORY_META[event.categoria] || CATEGORY_META.reporte;
            const details = event.detalles || {};
            const operationChanges = event.categoria === 'operacion' ? getOperationChanges(details) : [];
            return (
              <div key={event.id} className="px-3 py-2.5 grid grid-cols-[28px_minmax(0,1fr)] sm:grid-cols-[28px_minmax(0,1fr)_150px] gap-2 items-start">
                <span className={`w-7 h-7 rounded-md flex items-center justify-center ${meta.color}`}><span className="material-symbols-outlined text-[15px]" translate="no">{meta.icon}</span></span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5"><span className="text-[11px] font-bold text-on-surface">{event.accion}</span><span className="text-[10px] text-on-surface-variant">{event.tipo_documento || meta.label}</span><span className="rounded bg-surface-container-high px-1.5 py-0.5 text-[9px] font-bold text-on-surface">{event.cantidad}</span></div>
                  {details.descripcion && <p className="text-[10px] text-on-surface-variant mt-1">{details.descripcion}</p>}
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[9px] text-on-surface-variant">
                    {details.periodo && <span>Periodo: {details.periodo}</span>}
                    {details.formato && <span>Formato: {details.formato}</span>}
                    {details.socio && <span>Socio: {details.socio}</span>}
                    {details.numero_comprobante && <span>Comprobante: {details.numero_comprobante}</span>}
                    {details.entidad && <span>Entidad: {details.entidad}</span>}
                    {details.registro_id && <span>Registro: #{details.registro_id}</span>}
                    {details.motivo && <span>Motivo: {details.motivo}</span>}
                    {details.ip_address && <span>IP: {details.ip_address}</span>}
                    {details.user_agent && <span className="break-all">Dispositivo: {details.user_agent}</span>}
                  </div>
                  {operationChanges.length > 0 && (
                    <div className="mt-2 grid gap-1 sm:grid-cols-2">
                      {operationChanges.map((change) => (
                        <div key={change.key} className="rounded border border-outline-variant/60 bg-surface-container-lowest px-2 py-1 text-[9px] min-w-0">
                          <span className="font-bold capitalize text-on-surface-variant">{change.key.replaceAll('_', ' ')}: </span>
                          <span className="font-data-mono text-red-700 break-all">{auditValue(change.before)}</span>
                          <span className="mx-1 text-on-surface-variant">→</span>
                          <span className="font-data-mono font-bold text-emerald-700 break-all">{auditValue(change.after)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="col-start-2 sm:col-start-auto text-[10px] text-on-surface-variant sm:text-right">{formatDate(event.fecha)}</span>
              </div>
            );
          })}
          {events.length === 0 && <div className="py-8 text-center text-xs text-on-surface-variant">No hay actividades registradas.</div>}
        </div>
        {result?.total > events.length && <div className="px-3 py-2 border-t border-outline-variant text-center text-[9px] text-on-surface-variant">Mostrando las {events.length} actividades más recientes de {result.total}.</div>}
      </div>
    </div>
  );
};

const MobileUserCard = ({ user, expanded, onToggle, details, isLoading }) => (
  <article className="bg-surface border-b border-outline-variant/60 last:border-b-0">
    <div className="px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/10 text-primary"><span className="material-symbols-outlined text-[18px]" translate="no">person</span></span>
        <div className="min-w-0 flex-1"><h3 className="text-sm font-bold text-on-surface break-words">{user.nombre_razonsocial}</h3><div className="mt-0.5 flex flex-wrap items-center gap-2"><span className="text-[10px] font-bold uppercase text-on-surface-variant">{user.nombre_rol}</span><span className="text-[10px] text-on-surface-variant">{user.eventos} actividad(es)</span></div></div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-outline-variant/70 bg-surface-container-lowest p-2.5"><div><span className="block text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Dirección IP</span><span className="mt-1 block truncate font-data-mono text-[11px] font-semibold text-on-surface">{user.ultima_ip || 'Desconocida'}</span></div><div><span className="block text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Dispositivo</span><span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-on-surface"><span className="material-symbols-outlined text-[14px] text-primary" translate="no">{getDeviceIcon(user.ultimo_user_agent)}</span><span className="truncate">{getDeviceLabel(user.ultimo_user_agent)}</span></span></div></div>
      <div className="mt-2 flex items-center justify-between"><span className="text-[10px] text-on-surface-variant">Último ingreso: {formatDate(user.ultimo_ingreso)}</span><button type="button" onClick={onToggle} className="h-8 px-3 rounded-md text-[11px] font-bold text-primary hover:bg-primary/10 transition-colors flex items-center gap-1">Detalles<span className="material-symbols-outlined text-[15px]" translate="no">{expanded ? 'expand_less' : 'expand_more'}</span></button></div>
    </div>
    {expanded && <ActivityDetail user={user} result={details} isLoading={isLoading} />}
  </article>
);

const LoginHistoryTab = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [detailsByUser, setDetailsByUser] = useState({});
  const [loadingUserId, setLoadingUserId] = useState(null);
  const limit = 50;

  const fetchUsers = useCallback(async (pageNum = 1, append = false) => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/auth/actividad/usuarios', { params: { page: pageNum, limit } });
      setUsers((current) => append ? [...current, ...(data.data || [])] : (data.data || []));
      setTotal(Number(data.total) || 0);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al cargar el historial de actividad.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const toggleDetails = async (userId) => {
    if (expandedId === userId) { setExpandedId(null); return; }
    setExpandedId(userId);
    if (detailsByUser[userId]) return;
    setLoadingUserId(userId);
    try {
      const { data } = await api.get(`/auth/actividad/usuario/${userId}`, { params: { limit: 100 } });
      setDetailsByUser((current) => ({ ...current, [userId]: data }));
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo cargar el detalle del usuario.');
    } finally {
      setLoadingUserId(null);
    }
  };

  const loadMore = () => { const nextPage = page + 1; setPage(nextPage); fetchUsers(nextPage, true); };

  return (
    <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm animate-in fade-in">
      <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
        <div><h2 className="text-base text-on-surface font-bold tracking-tight">Historial de Actividad</h2><span className="text-[11px] text-on-surface-variant font-medium">Ingresos, descargas, reportes, modificaciones y anulaciones por usuario</span></div>
        <button type="button" onClick={() => { setPage(1); setExpandedId(null); setDetailsByUser({}); fetchUsers(1); }} className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors" title="Actualizar"><span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`} translate="no">refresh</span></button>
      </div>

      <div className="md:hidden">{users.map((user) => <MobileUserCard key={user.usuario_id} user={user} expanded={expandedId === user.usuario_id} onToggle={() => toggleDetails(user.usuario_id)} details={detailsByUser[user.usuario_id]} isLoading={loadingUserId === user.usuario_id} />)}</div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto whitespace-nowrap">
          <thead><tr className="bg-surface-container-lowest border-b border-outline-variant text-on-surface-variant text-[11px] uppercase tracking-wider"><th className="px-4 py-2 font-semibold">Usuario</th><th className="px-4 py-2 font-semibold">Fecha y Hora</th><th className="px-4 py-2 font-semibold">Dirección IP</th><th className="px-4 py-2 font-semibold">Dispositivo / Navegador</th><th className="px-4 py-2 font-semibold text-right">Acciones</th></tr></thead>
          <tbody className="divide-y divide-outline-variant/50 bg-surface">
            {users.map((user) => (
              <Fragment key={user.usuario_id}>
                <tr className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-4 py-2"><div className="flex flex-col"><span className="text-[11px] font-bold text-on-surface">{user.nombre_razonsocial}</span><span className="text-[10px] text-on-surface-variant">{user.nombre_rol}</span></div></td>
                  <td className="px-4 py-2"><span className="text-[11px] font-medium text-on-surface">{formatDate(user.ultimo_ingreso)}</span></td>
                  <td className="px-4 py-2 font-data-mono text-[11px] text-on-surface-variant">{user.ultima_ip || 'Desconocida'}</td>
                  <td className="px-4 py-2"><div className="flex items-center gap-2 text-on-surface-variant" title={user.ultimo_user_agent}><span className="material-symbols-outlined text-[14px]" translate="no">{getDeviceIcon(user.ultimo_user_agent)}</span><span className="text-[10px] max-w-[200px] truncate">{getDeviceLabel(user.ultimo_user_agent)}</span></div></td>
                  <td className="px-4 py-2 text-right"><button type="button" onClick={() => toggleDetails(user.usuario_id)} className="h-7 px-2 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-md transition-colors inline-flex items-center gap-1">Detalles<span className="material-symbols-outlined text-[14px]" translate="no">{expandedId === user.usuario_id ? 'expand_less' : 'expand_more'}</span></button></td>
                </tr>
                {expandedId === user.usuario_id && <tr><td colSpan="5" className="p-0"><ActivityDetail user={user} result={detailsByUser[user.usuario_id]} isLoading={loadingUserId === user.usuario_id} /></td></tr>}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {!isLoading && users.length === 0 && <div className="flex flex-col items-center justify-center px-5 py-12 text-center text-on-surface-variant"><span className="material-symbols-outlined text-4xl mb-2 opacity-50" translate="no">history_off</span><p>No hay registros de actividad disponibles.</p></div>}
      {isLoading && users.length === 0 && <div className="p-10 text-center text-on-surface-variant text-sm">Cargando registros...</div>}
      {users.length > 0 && <div className="p-3 flex items-center justify-between border-t border-outline-variant"><span className="text-[10px] text-on-surface-variant">Mostrando {users.length} de {total} usuario(s)</span>{users.length < total && <button type="button" onClick={loadMore} disabled={isLoading} className="text-xs font-bold text-primary hover:text-primary-fixed-variant disabled:opacity-50">{isLoading ? 'Cargando...' : 'Cargar más'}</button>}</div>}
    </div>
  );
};

export default LoginHistoryTab;
