import React from 'react';

const FullScreenLoader = ({
  title = 'Cargando pantalla...',
  subtitle = 'Preparando la vista del sistema...',
  badgeText = 'Parque Industrial Jicamarca',
  logoSrc = '/logo.png',
}) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-surface text-on-surface select-none p-4 animate-in fade-in duration-150">
      <div className="flex flex-col items-center max-w-sm w-full text-center">
        {/* Logo con anillo animado */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Resplandor sutil */}
          <div className="absolute w-24 h-24 rounded-full bg-primary/15 blur-xl animate-pulse pointer-events-none" />

          {/* Anillo giratorio */}
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />

          {/* Contenedor del logo institucional */}
          <div className="absolute w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center p-2 overflow-hidden border border-slate-100 dark:border-slate-800">
            <img
              src={logoSrc}
              alt="Logo Parque Industrial Jicamarca"
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>
        </div>

        {/* Insignia corporativa */}
        {badgeText && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider mb-2.5 border border-primary/20 shadow-sm">
            <span className="material-symbols-outlined text-[14px]" translate="no">bolt</span>
            <span>{badgeText}</span>
          </div>
        )}

        {/* Título de estado */}
        <h3 className="text-lg md:text-xl font-bold text-on-surface tracking-tight">
          {title}
        </h3>

        {/* Subtítulo descriptivo */}
        {subtitle && (
          <p className="text-xs md:text-sm text-on-surface-variant mt-1.5 font-medium max-w-[280px] leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Indicador de progreso con puntos animados */}
        <div className="flex items-center gap-1.5 mt-5">
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default React.memo(FullScreenLoader);
