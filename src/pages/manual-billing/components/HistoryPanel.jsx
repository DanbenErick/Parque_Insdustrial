import React from 'react';
import { formatPeriodo } from '../utils';
import { ReadingRow } from './shared/ReadingRow';
import { EmptyStateIcon } from './shared/EmptyStateIcon';

export const HistoryPanel = ({
  activePeriodo,
  lecturasPeriodoActivo,
  medidorMap,
  setIsModalOpen,
  onRowClick
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-outline-variant/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden h-full flex flex-col transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="px-5 py-4 border-b border-outline-variant/50 flex items-center gap-3 bg-gradient-to-r from-surface to-surface-container-lowest relative">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
          <span className="material-symbols-outlined text-[20px]">history</span>
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-on-surface tracking-tight">Lecturas Registradas</h4>
          <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">{formatPeriodo(activePeriodo?.mes_anio)}</p>
        </div>
      </div>
      <div className="overflow-y-auto flex-grow p-2">
        {lecturasPeriodoActivo.length === 0 ? (
          <EmptyStateIcon icon="history_toggle_off" title="No hay lecturas registradas en este periodo." />
        ) : (
          <ul className="space-y-1">
            {lecturasPeriodoActivo.slice(0, 5).map(record => (
              <ReadingRow key={record.id} record={record} medidorInfo={medidorMap?.get(record.num_serie)} onClick={() => onRowClick?.(record)} />
            ))}
          </ul>
        )}
      </div>
      {lecturasPeriodoActivo.length > 0 && (
        <div className="p-4 border-t border-outline-variant/50 bg-white/50 backdrop-blur-sm">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2.5 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">list_alt</span>
            Ver todas las lecturas ({lecturasPeriodoActivo.length})
          </button>
        </div>
      )}
    </div>
  );
};
