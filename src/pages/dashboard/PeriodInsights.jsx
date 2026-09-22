const consumption = (value) => Number(value || 0).toLocaleString('es-PE', { maximumFractionDigits: 1 });
const formatTariff = (value, unit, digits = 4) => value == null
  ? 'Por definir'
  : `S/ ${Number(value).toLocaleString('es-PE', { minimumFractionDigits: digits, maximumFractionDigits: digits })}${unit ? ` / ${unit}` : ''}`;

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`))
  : 'Por definir';

const Card = ({ icon, title, children }) => (
  <section className="bg-white border border-outline-variant rounded-xl p-md shadow-sm min-w-0">
    <h3 className="font-bold text-on-surface flex items-center gap-2 mb-3">
      <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">{icon}</span>
      {title}
    </h3>
    {children}
  </section>
);

const DateItem = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 py-2 border-b border-outline-variant last:border-0">
    <span className="text-sm text-on-surface-variant">{label}</span>
    <span className="text-sm font-semibold text-on-surface text-right">{formatDate(value)}</span>
  </div>
);

const TariffItem = ({ label, value, unit, digits }) => (
  <div className="flex items-center justify-between gap-3 py-2 border-b border-outline-variant last:border-0">
    <span className="text-sm text-on-surface-variant">{label}</span>
    <span className="text-sm font-data-mono font-semibold text-on-surface text-right whitespace-nowrap">
      {formatTariff(value, unit, digits)}
    </span>
  </div>
);

const PeriodInsights = ({ data }) => {
  if (!data) return null;
  const { periodo, ranking } = data;

  return (
    <section className="space-y-3" aria-label={`Indicadores del período ${periodo.mes_anio}`}>
      <div>
        <h2 className="font-headline-sm text-on-surface font-bold">Indicadores del período · {periodo.mes_anio}</h2>
        <p className="text-body-sm text-on-surface-variant">Último período registrado en la vista seleccionada</p>
      </div>
      <div className="columns-1 lg:columns-2 gap-3">
        <div className="mb-3 break-inside-avoid">
        <Card icon="leaderboard" title="Top socios por consumo">
          {ranking.length ? (
            <ol className="space-y-2">
              {ranking.map((socio, index) => (
                <li key={socio.id} className="flex items-center gap-3 text-sm">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-on-surface" title={socio.nombre}>{socio.nombre}</span>
                  <span className="font-data-mono font-semibold text-on-surface whitespace-nowrap">{consumption(socio.consumo)} kWh</span>
                </li>
              ))}
            </ol>
          ) : <p className="text-sm text-on-surface-variant">Aún no hay consumos registrados en este período.</p>}
        </Card>
        </div>

        <div className="mb-3 break-inside-avoid space-y-3">
          <Card icon="calendar_month" title="Calendario del período">
            <DateItem label="Inicio" value={periodo.fecha_inicio} />
            <DateItem label="Fin del período" value={periodo.fecha_fin} />
            <DateItem label="Vencimiento de recibos" value={periodo.fecha_vencimiento} />
            <h4 className="text-sm font-bold text-on-surface mt-4 mb-1">Tarifario del período</h4>
            <TariffItem label="Energía normal" value={periodo.tarifa_kwh} unit="kWh" />
            <TariffItem label="Energía tiempo real (fuera de punta)" value={periodo.tarifa_kwh_tr} unit="kWh" />
            <TariffItem label="Energía en hora punta" value={periodo.tarifa_kwh_punta} unit="kWh" />
            <TariffItem label="Potencia en hora punta" value={periodo.costo_potencia} unit="kW" />
            <TariffItem label="Potencia fuera de punta" value={periodo.costo_potencia_fuera_punta} unit="kW" />
            <TariffItem label="Energía reactiva" value={periodo.precio_energia_reactiva} unit="kVARh" />
            <TariffItem label="Mantenimiento normal" value={periodo.tarifa_mantenimiento_normal} digits={2} />
            <TariffItem label="Mantenimiento tiempo real" value={periodo.tarifa_mantenimiento_tiempo_real} digits={2} />
            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-sm text-on-surface-variant">Factor multiplicador</span>
              <span className="text-sm font-data-mono font-semibold text-on-surface">
                {periodo.factor_multiplicador == null ? 'Por definir' : `${Number(periodo.factor_multiplicador).toFixed(4)}×`}
              </span>
            </div>
          </Card>

        </div>

      </div>
    </section>
  );
};

export default PeriodInsights;
