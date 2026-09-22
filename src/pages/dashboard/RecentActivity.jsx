const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : dateFormatter.format(date);
};

const formatNumber = (value, digits) => Number(value || 0).toLocaleString('es-PE', {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits,
});

const RecentActivity = ({ events, year }) => (
  <section className="bg-white border border-outline-variant rounded-xl p-md shadow-sm" aria-label="Actividad reciente">
    <div className="mb-4">
      <h2 className="font-headline-sm text-on-surface font-bold flex items-center gap-2">
        <span className="material-symbols-outlined text-primary" aria-hidden="true">history</span>
        Actividad reciente
      </h2>
      <p className="text-body-sm text-on-surface-variant">
        Últimos pagos y lecturas registrados {year === 'all' ? 'en el histórico' : `en períodos de ${year}`}.
      </p>
    </div>

    {events.length === 0 ? (
      <p className="text-sm text-on-surface-variant py-4">Aún no hay pagos ni lecturas registrados en esta vista.</p>
    ) : (
      <ol className="divide-y divide-outline-variant">
        {events.map((event) => {
          const isPayment = event.tipo === 'pago';
          return (
            <li key={`${event.tipo}-${event.id}`} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 min-w-0">
              <span className={`material-symbols-outlined shrink-0 rounded-full p-2 text-[20px] ${isPayment ? 'bg-emerald-50 text-emerald-700' : 'bg-primary/10 text-primary'}`} aria-hidden="true">
                {isPayment ? 'payments' : 'speed'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="font-semibold text-sm text-on-surface">
                    {isPayment ? 'Pago registrado' : 'Lectura registrada'}
                    <span className="font-normal text-on-surface-variant"> · {event.socio}</span>
                  </p>
                  <time className="text-xs text-on-surface-variant whitespace-nowrap" dateTime={event.fecha}>
                    {formatDate(event.fecha)}
                  </time>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  <span className="font-data-mono font-semibold text-on-surface">
                    {isPayment ? `S/ ${formatNumber(event.monto, 2)}` : `${formatNumber(event.consumo, 1)} kWh`}
                  </span>
                  {' · '}{event.periodo}
                  {event.referencia ? ` · ${isPayment ? 'Recibo' : 'Medidor'} ${event.referencia}` : ''}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    )}
  </section>
);

export default RecentActivity;
