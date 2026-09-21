import React from 'react';

const FullScreenLoader = ({
  title = 'Estamos preparando todo',
  subtitle = 'Esto tomará solo un momento.',
  badgeText = 'Parque Industrial Jicamarca',
  logoSrc = '/logo-192.png',
}) => {
  return (
    <div
      className="absolute inset-0 z-[60] flex min-h-full items-center justify-center overflow-hidden bg-[#252838] p-4 text-white select-none animate-in fade-in duration-200"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative flex w-full max-w-[380px] flex-col items-center px-5 py-8 text-center">
        <div className="relative mb-5 flex items-center justify-center">
          <div aria-hidden="true" className="absolute h-24 w-24 rounded-full bg-black/20 blur-xl" />
          <div aria-hidden="true" className="h-24 w-24 rounded-[30px] border border-white/15 bg-black/10 shadow-inner" />
          <div aria-hidden="true" className="absolute h-24 w-24 rounded-[30px] border-2 border-white/15 border-r-emerald-300 border-t-emerald-300 motion-safe:animate-spin motion-reduce:border-emerald-300/60" />

          <div className="absolute flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white p-2 shadow-xl shadow-black/30">
            <img
              src={logoSrc}
              alt="Logo Parque Industrial Jicamarca"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {badgeText && (
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-emerald-200">
            <span className="material-symbols-outlined text-[13px]" translate="no" aria-hidden="true">bolt</span>
            <span>{badgeText}</span>
          </div>
        )}

        <h2 className="text-xl font-bold tracking-tight text-white sm:text-[22px]">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-2 max-w-[290px] text-xs font-medium leading-relaxed text-slate-300 sm:text-sm">
            {subtitle}
          </p>
        )}

        <div className="mt-6 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <div className="h-full w-1/2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.45)] motion-safe:animate-[loader-slide_1.35s_ease-in-out_infinite] motion-reduce:w-full" />
        </div>

        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Procesando información
        </p>
      </div>
    </div>
  );
};

export default React.memo(FullScreenLoader);
