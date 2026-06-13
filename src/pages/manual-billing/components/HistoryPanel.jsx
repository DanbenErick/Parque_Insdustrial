import React from 'react';
import { formatPeriodo } from '../utils';
import { ReadingRow } from './shared/ReadingRow';
import { EmptyStateIcon } from './shared/EmptyStateIcon';

export const HistoryPanel = ({
  activePeriodo,
  lecturasPeriodoActivo,
  setIsModalOpen
}) => {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-outline-variant flex items-center gap-3 bg-surface relative">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner">
          <span className="material-symbols-outlined text-[18px]">history</span>
        </div>
        <h4 className="font-bold text-sm text-on-surface tracking-tight">Lecturas Registradas ({formatPeriodo(activePeriodo?.mes_anio)})</h4>
      </div>
      <div className="overflow-y-auto flex-grow p-2">
        {lecturasPeriodoActivo.length === 0 ? (
          <EmptyStateIcon icon="history_toggle_off" title="No hay lecturas registradas en este periodo." />
        ) : (
          <ul className="space-y-1">
            {lecturasPeriodoActivo.slice(0, 5).map(record => (
              <ReadingRow key={record.id} record={record} />
            ))}
          </ul>
        )}
      </div>
      {lecturasPeriodoActivo.length > 0 && (
        <div className="p-md border-t border-outline-variant bg-surface-container-lowest">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">list_alt</span>
            Ver todas las lecturas ({lecturasPeriodoActivo.length})
          </button>
        </div>
      )}
    </div>
  );
};
