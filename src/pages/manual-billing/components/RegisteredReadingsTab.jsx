import React, { useState, useMemo } from 'react';
import { formatPeriodo } from '../utils';
import { ReadingRow } from './shared/ReadingRow';
import { EmptyStateIcon } from './shared/EmptyStateIcon';

export const RegisteredReadingsTab = ({
  activePeriodo,
  lecturasPeriodoActivo = [],
  medidorMap,
  onRowClick,
  onEdit
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLecturas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return lecturasPeriodoActivo;

    return lecturasPeriodoActivo.filter(record => {
      const medidor = medidorMap?.get(record.num_serie);
      const docId = medidor?.documento_identidad?.toLowerCase() || '';
      return (
        (record.propietario?.toLowerCase().includes(term)) ||
        (record.num_serie?.toLowerCase().includes(term)) ||
        docId.includes(term)
      );
    });
  }, [searchTerm, lecturasPeriodoActivo, medidorMap]);

  return (
    <div className="bg-white rounded-3xl border border-outline-variant shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in duration-300">
      {/* Barra de cabecera */}
      <div className="px-5 py-3.5 border-b border-outline-variant bg-surface-container-lowest flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#059669]/10 text-[#059669] flex items-center justify-center border border-[#059669]/20 shadow-sm">
            <span className="material-symbols-outlined text-[20px]" translate="no">fact_check</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-on-surface text-base">Lecturas Registradas</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#059669]/10 text-[#059669] border border-[#059669]/20 font-data-mono">
                {lecturasPeriodoActivo.length} registradas
              </span>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-0.5">
              Periodo: <strong className="text-on-surface uppercase">{formatPeriodo(activePeriodo?.mes_anio)}</strong> • Haga clic en cualquier fila para ver el desglose o editar.
            </p>
          </div>
        </div>

        {/* Buscador de lecturas registradas */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]" translate="no">search</span>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por socio, medidor o doc..."
            className="w-full pl-8 pr-8 py-1.5 border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs outline-none transition-all bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-on-surface-variant hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]" translate="no">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Lista de lecturas con scroll */}
      <div className="overflow-y-auto custom-scrollbar p-3 flex-1 max-h-[600px]">
        {filteredLecturas.length === 0 ? (
          <div className="py-12">
            <EmptyStateIcon
              icon="history_toggle_off"
              title={searchTerm ? `No se encontraron lecturas para "${searchTerm}"` : "No hay lecturas registradas en este periodo."}
            />
          </div>
        ) : (
          <ul className="space-y-1.5">
            {filteredLecturas.map(record => (
              <ReadingRow
                key={record.id}
                record={record}
                medidorInfo={medidorMap?.get(record.num_serie)}
                onEdit={onEdit}
                onClick={() => onRowClick?.(record)}
                showDateFull={true}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
