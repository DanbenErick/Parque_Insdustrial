import React from 'react';
import { createPortal } from 'react-dom';

/**
 * LoadingCurtain - Cortina de carga de pantalla completa con el logo institucional
 * del Parque Industrial Jicamarca y diseño glassmorphism prémium.
 *
 * @param {boolean} isOpen - Estado de visibilidad de la cortina
 * @param {string} title - Título principal (ej. "Cargando datos...")
 * @param {string} subtitle - Mensaje secundario (ej. "Obteniendo información del periodo seleccionado")
 * @param {string} badgeText - Texto de insignia institucional
 * @param {string} logoSrc - Ruta al logotipo institucional
 */
const LoadingCurtain = ({
  isOpen = false,
  title = 'Cargando datos...',
  subtitle = 'Obteniendo información del periodo seleccionado',
  badgeText = 'Parque Industrial Jicamarca',
  logoSrc = '/logo.png',
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200 select-none !m-0"
      style={{ margin: 0 }}
      role="status"
      aria-live="polite"
    >
      <div className="bg-surface/95 border border-outline-variant/80 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center max-w-sm w-full mx-4 backdrop-blur-xl animate-in zoom-in-95 duration-200 text-center">
        {/* Logo con anillo giratorio institucional */}
        <div className="relative flex items-center justify-center mb-5">
          {/* Resplandor sutil de fondo */}
          <div className="absolute w-24 h-24 rounded-full bg-primary/10 blur-xl animate-pulse pointer-events-none" />

          {/* Anillo exterior animado */}
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />

          {/* Contenedor central del logo institucional */}
          <div className="absolute w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center p-2.5 overflow-hidden border border-slate-100">
            <img
              src={logoSrc}
              alt="Logo Parque Industrial Jicamarca"
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>
        </div>

        {/* Insignia corporativa */}
        {badgeText && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-2 border border-primary/20">
            <span className="material-symbols-outlined text-[13px]" translate="no">bolt</span>
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

        {/* Indicador de progreso con puntos interactivos */}
        <div className="flex items-center gap-1.5 mt-5">
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default React.memo(LoadingCurtain);
