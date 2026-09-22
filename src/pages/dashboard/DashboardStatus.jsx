import { useEffect, useState } from 'react';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const daysUntil = (date, now) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return null;
  const [year, month, day] = date.split('-').map(Number);
  const due = Date.UTC(year, month - 1, day);
  if (new Date(due).toISOString().slice(0, 10) !== date) return null;
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due - today) / MS_PER_DAY);
};

const urgency = (days) => {
  if (days === null) return { color: 'text-on-surface-variant', background: 'bg-surface-container', label: 'Sin fecha' };
  if (days <= 3) return { color: 'text-error', background: 'bg-error/10', label: days < 0 ? 'Vencido' : 'Urgente' };
  if (days <= 7) return { color: 'text-amber-700', background: 'bg-amber-50', label: 'Próximo' };
  return { color: 'text-green-700', background: 'bg-green-50', label: 'En plazo' };
};

const formatDueDate = (value) => {
  if (!value) return 'Sin fecha definida';
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(year, month - 1, day));
};

const DashboardStatus = ({ detail, detailError, queries }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const dueDate = detail?.periodo?.fecha_vencimiento;
  const days = daysUntil(dueDate, now);
  const status = urgency(days);
  const syncedAt = queries.every((query) => query.dataUpdatedAt > 0)
    ? Math.min(...queries.map((query) => query.dataUpdatedAt)) : null;
  const syncDate = syncedAt ? new Date(syncedAt) : null;
  const syncAge = syncedAt ? Math.max(0, Math.floor((now.getTime() - syncedAt) / 60000)) : null;

  const countdown = days === null ? '—'
    : days < 0 ? `${Math.abs(days)} día${days === -1 ? '' : 's'} de atraso`
      : days === 0 ? 'Vence hoy'
        : `${days} día${days === 1 ? '' : 's'}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-label="Estado del dashboard">
      <section className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-on-surface">Días hasta el vencimiento</h3>
          <span className="material-symbols-outlined text-primary" aria-hidden="true">event</span>
        </div>
        <p className={`mt-2 inline-flex rounded-lg px-3 py-1 text-xl font-data-mono font-bold ${status.color} ${status.background}`}>
          {countdown}
        </p>
        <p className="mt-2 text-xs text-on-surface-variant">
          {detailError ? 'No se pudo consultar el período seleccionado.' : detail?.periodo
            ? `${status.label} · ${detail.periodo.mes_anio} · Vencimiento: ${formatDueDate(dueDate)}`
            : 'No hay un período registrado en la vista seleccionada.'}
        </p>
      </section>

      <section className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-on-surface">Última sincronización</h3>
          <span className="material-symbols-outlined text-primary" aria-hidden="true">sync</span>
        </div>
        <p className="mt-2 text-xl font-data-mono font-bold text-on-surface">
          {syncDate ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(syncDate) : 'Sin sincronizar'}
        </p>
        <p className="mt-2 text-xs text-on-surface-variant">
          {syncAge === null
            ? queries.some((query) => query.isError) ? 'No se pudieron consultar todos los datos.' : 'Consultando datos del dashboard…'
            : queries.some((query) => query.isError) ? 'La última consulta falló; se muestran datos anteriores.'
            : syncAge === 0 ? 'Datos actualizados hace menos de un minuto.'
              : `Datos actualizados hace ${syncAge} minuto${syncAge === 1 ? '' : 's'}.`}
        </p>
      </section>
    </div>
  );
};

export default DashboardStatus;
