import  { useState, useMemo } from 'react';
import { formatPeriodo } from '../utils';
import { ReadingTableRow } from './shared/ReadingTableRow';
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
      const direccion = (record.medidor_direccion || medidor?.direccion || record.direccion || '').toLowerCase();
      return (
        (record.propietario?.toLowerCase().includes(term)) ||
        (record.num_serie?.toLowerCase().includes(term)) ||
        docId.includes(term) ||
        direccion.includes(term)
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

      {/* Tabla de lecturas registradas */}
      <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 max-h-[600px] relative">
        {filteredLecturas.length === 0 ? (
          <div className="py-12">
            <EmptyStateIcon
              icon="history_toggle_off"
              title={searchTerm ? `No se encontraron lecturas para "${searchTerm}"` : "No hay lecturas registradas en este periodo."}
            />
          </div>
        ) : (
          <table className="w-full min-w-[850px] text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-10 shadow-sm bg-slate-50/90 backdrop-blur-xs text-on-surface-variant text-[11px] uppercase tracking-wider font-bold border-b border-outline-variant">
              <tr>
                <th className="px-4 py-3 bg-slate-50/90 text-on-surface-variant">Socio / Dirección</th>
                <th className="px-4 py-3 bg-slate-50/90 text-on-surface-variant">Medidor / Tipo</th>
                <th className="px-4 py-3 bg-slate-50/90 text-on-surface-variant">Lectura Registrada</th>
                <th className="px-4 py-3 bg-slate-50/90 text-on-surface-variant">Consumo</th>
                <th className="px-4 py-3 text-right bg-slate-50/90 text-on-surface-variant">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 bg-surface text-body-sm">
              {filteredLecturas.map(record => (
                <ReadingTableRow
                  key={record.id}
                  record={record}
                  medidorInfo={medidorMap?.get(record.num_serie)}
                  onEdit={onEdit}
                  onClick={() => onRowClick?.(record)}
                  showDateFull={true}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer de la tabla */}
      <div className="px-5 py-2.5 border-t border-outline-variant bg-surface-container-lowest flex justify-between items-center text-xs text-on-surface-variant">
        <span>Mostrando {filteredLecturas.length} de {lecturasPeriodoActivo.length} lecturas</span>
      </div>
    </div>
  );
};
