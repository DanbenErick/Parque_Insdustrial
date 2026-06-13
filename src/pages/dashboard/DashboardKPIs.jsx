import React from 'react';

const KPI_ITEMS = [
  {
    key: 'total',
    title: 'Consumo Total Parque',
    icon: 'electric_bolt',
    colorClass: 'primary',
    borderHover: 'hover:border-primary/30',
    bgIcon: 'bg-primary/5 border-primary/10',
    textColor: 'text-primary',
    getBadge: () => (
      <span className="text-[10px] text-primary flex items-center gap-0.5 font-bold mb-px bg-primary/10 px-1 rounded-sm">
        <span className="material-symbols-outlined text-[12px]">trending_up</span> 2.4%
      </span>
    ),
    getValue: (kpis) => typeof kpis.totalConsumo === 'number'
      ? kpis.totalConsumo.toLocaleString('es-PE', { maximumFractionDigits: 1 })
      : kpis.totalConsumo,
    getSubLabel: () => 'kWh consumidos',
  },
  {
    key: 'max',
    title: 'Mayor Consumo Mensual',
    icon: 'arrow_upward',
    colorClass: 'error',
    borderHover: 'hover:border-error/30',
    bgIcon: 'bg-error/5 border-error/10',
    textColor: 'text-error',
    getBadge: (kpis) => (
      <span className="text-[10px] text-error font-bold mb-px bg-error/10 px-1 rounded-sm border border-error/20">
        {kpis.maxPeriodo}
      </span>
    ),
    getValue: (kpis) => kpis.maxConsumo.toLocaleString('es-PE', { maximumFractionDigits: 1 }),
    getSubLabel: () => 'kWh consumidos',
  },
  {
    key: 'min',
    title: 'Menor Consumo Mensual',
    icon: 'arrow_downward',
    colorClass: 'green',
    borderHover: 'hover:border-[#4caf50]/30',
    bgIcon: 'bg-[#4caf50]/5 border-[#4caf50]/10',
    textColor: 'text-[#4caf50]',
    getBadge: (kpis) => (
      <span className="text-[10px] text-[#4caf50] font-bold mb-px bg-[#4caf50]/10 px-1 rounded-sm border border-[#4caf50]/20">
        {kpis.minPeriodo}
      </span>
    ),
    getValue: (kpis) => kpis.minConsumo.toLocaleString('es-PE', { maximumFractionDigits: 1 }),
    getSubLabel: () => 'kWh consumidos',
  },
];

const DashboardKPIs = React.memo(({ kpis }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    {KPI_ITEMS.map(item => (
      <div
        key={item.key}
        className={`bg-surface border border-outline-variant ${item.borderHover} rounded-xl p-3 flex items-center gap-3 transition-colors shadow-sm`}
      >
        <div className={`w-10 h-10 rounded-full ${item.bgIcon} flex items-center justify-center ${item.textColor} shrink-0 border`}>
          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
        </div>
        <div className="flex flex-col justify-center overflow-hidden flex-1">
          <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider leading-tight truncate">
            {item.title}
          </span>
          <div className="flex items-end justify-between mt-0.5">
            <span className={`font-data-mono text-lg ${item.textColor} font-bold leading-none truncate`}>
              {item.getValue(kpis)}
            </span>
            {item.getBadge(kpis)}
          </div>
          <span className="text-[9px] text-on-surface-variant/70 mt-1 truncate">
            {item.getSubLabel()}
          </span>
        </div>
      </div>
    ))}
  </div>
));

DashboardKPIs.displayName = 'DashboardKPIs';

export default DashboardKPIs;
