const number = (value, digits = 0) => Number(value || 0).toLocaleString('es-PE', {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits,
});

const Change = ({ value, unit }) => (
  <span className={`text-xs font-bold ${value == null ? 'text-on-surface-variant' : value >= 0 ? 'text-emerald-700' : 'text-error'}`}>
    {value == null ? 'Sin base comparable' : `${value > 0 ? '+' : ''}${number(value, 1)} % vs. mes anterior`}
    {unit && value != null ? ` (${unit})` : ''}
  </span>
);

const Metric = ({ label, value, note }) => (
  <div className="rounded-lg bg-surface-container-low p-3 min-w-0">
    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
    <p className="font-data-mono text-xl font-bold text-on-surface mt-1">{value}</p>
    {note && <p className="text-xs text-on-surface-variant mt-1">{note}</p>}
  </div>
);

const MonthlySummary = ({ summary, year }) => {
  if (!summary) return (
    <section className="bg-white border border-outline-variant rounded-xl p-md shadow-sm text-on-surface-variant">
      No hay un período de facturación registrado para {year === 'all' ? 'el histórico' : year}.
    </section>
  );

  return (
    <section className="bg-white border border-outline-variant rounded-xl p-md shadow-sm space-y-4" aria-label="Estado de facturación mensual">
      <div>
        <h2 className="font-headline-sm text-on-surface font-bold">Estado de facturación · {summary.periodo}</h2>
        <p className="text-body-sm text-on-surface-variant">Último período registrado en la vista seleccionada</p>
      </div>
      <div className="grid grid-cols-2 2xl:grid-cols-4 gap-3">
        <Metric label="Socios con lectura" value={number(summary.sociosConLectura)} />
        <Metric label="Recibos emitidos" value={number(summary.recibosEmitidos)} />
        <Metric label="Recibos pagados" value={number(summary.recibosPagados)} />
        <Metric label="Recibos pendientes" value={number(summary.recibosPendientes)} note="Incluye pagos parciales y vencidos" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3">
        <div className="rounded-lg border border-outline-variant p-3 space-y-2">
          <p className="text-xs font-bold text-on-surface">Recaudación del período</p>
          <p className="font-data-mono text-xl font-bold text-primary">{number(summary.porcentajeCobrado, 1)} % cobrado</p>
          <div className="h-2 rounded-full bg-surface-container overflow-hidden" role="progressbar" aria-valuenow={Math.round(summary.porcentajeCobrado)} aria-valuemin="0" aria-valuemax="100" aria-label="Porcentaje cobrado">
            <div className="h-full bg-primary rounded-full" style={{ width: `${summary.porcentajeCobrado}%` }} />
          </div>
          <p className="text-xs text-on-surface-variant">S/ {number(summary.cobrado, 2)} de S/ {number(summary.facturado, 2)} facturados</p>
          <p className="text-xs text-on-surface-variant">Pendiente: S/ {number(summary.pendiente, 2)} · Vencido: S/ {number(summary.vencido, 2)}</p>
        </div>
        <Metric label="Consumo del mes" value={`${number(summary.consumoActual, 1)} kWh`} note={<Change value={summary.variacionConsumo} />} />
        <Metric label="Recaudación vs. mes anterior" value={`S/ ${number(summary.cobrado, 2)}`} note={<Change value={summary.variacionRecaudacion} />} />
      </div>
    </section>
  );
};

export default MonthlySummary;
