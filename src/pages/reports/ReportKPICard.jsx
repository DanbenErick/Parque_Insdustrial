import React from 'react';

const KPI_STYLES = {
  primary: {
    border: 'hover:border-primary/30',
    iconBg: 'bg-primary/5 border-primary/10',
    iconColor: 'text-primary',
    labelColor: 'text-on-surface-variant',
    valueColor: 'text-primary',
    subtitleColor: 'text-on-surface-variant/70',
  },
  neutral: {
    border: 'hover:border-primary/30',
    iconBg: 'bg-primary/5 border-primary/10',
    iconColor: 'text-primary',
    labelColor: 'text-on-surface-variant',
    valueColor: 'text-on-surface',
    subtitleColor: 'text-on-surface-variant/70',
  },
  success: {
    border: 'hover:border-green-600/30',
    iconBg: 'bg-green-600/5 border-green-600/10',
    iconColor: 'text-green-600',
    labelColor: 'text-green-600',
    valueColor: 'text-green-600',
    subtitleColor: 'text-green-600/70',
  },
  error: {
    border: 'hover:border-error/30',
    iconBg: 'bg-error/5 border-error/10',
    iconColor: 'text-error',
    labelColor: 'text-error',
    valueColor: 'text-error',
    subtitleColor: 'text-error/70',
  },
};

const ReportKPICard = React.memo(({ icon, label, value, badge, subtitle, variant = 'primary' }) => {
  const s = KPI_STYLES[variant];

  return (
    <div className={`bg-surface border border-outline-variant ${s.border} rounded-xl p-3 flex items-center gap-3 transition-colors shadow-sm`}>
      <div className={`w-10 h-10 rounded-full ${s.iconBg} flex items-center justify-center ${s.iconColor} shrink-0 border`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div className="flex flex-col justify-center overflow-hidden flex-1">
        <span className={`text-[9px] font-bold ${s.labelColor} uppercase tracking-wider leading-tight truncate`}>{label}</span>
        <div className="flex items-end justify-between mt-0.5">
          <span className={`font-data-mono text-lg ${s.valueColor} font-bold leading-none truncate`}>{value}</span>
          {badge && (
            <span className={`text-[10px] ${s.iconColor} font-bold mb-px ml-1 ${s.iconColor.replace('text-', 'bg-')}/10 px-1 rounded-sm border ${s.iconColor.replace('text-', 'border-')}/20`}>
              {badge}
            </span>
          )}
        </div>
        <span className={`text-[9px] ${s.subtitleColor} mt-1 truncate`}>{subtitle}</span>
      </div>
    </div>
  );
});

ReportKPICard.displayName = 'ReportKPICard';

export default ReportKPICard;
