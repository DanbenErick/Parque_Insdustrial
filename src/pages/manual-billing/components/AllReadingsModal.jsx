import React, { useMemo } from 'react';
import { formatPeriodo, MODAL_BACKDROP, MODAL_CONTENT } from '../utils';
import { ReadingTableRow } from './shared/ReadingTableRow';

export const AllReadingsModal = ({
  activePeriodo,
  lecturasPeriodoActivo,
  medidorMap,
  modalSearchTerm,
  setModalSearchTerm,
  setIsModalOpen,
  handleEditFromTable,
  onRowClick
}) => {
  const filteredModalLecturas = useMemo(() => {
    const term = modalSearchTerm.trim().toLowerCase();
    if (!term) return lecturasPeriodoActivo;
    
    return lecturasPeriodoActivo.filter(record => {
      const medidor = medidorMap.get(record.num_serie);
      const docId = medidor?.documento_identidad?.toLowerCase() || '';
      return (
        (record.propietario?.toLowerCase().includes(term)) ||
        (record.num_serie?.toLowerCase().includes(term)) ||
        docId.includes(term)
      );
    });
  }, [modalSearchTerm, lecturasPeriodoActivo, medidorMap]);

  return (
    <div {...MODAL_BACKDROP} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div {...MODAL_CONTENT} className="bg-surface w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-xl py-md border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-lowest rounded-t-2xl">
          <div>
            <h3 className="font-headline-sm text-primary font-bold flex items-center gap-2">
              <span className="material-symbols-outlined" translate="no">list_alt</span> Todas las Lecturas
            </h3>
            <p className="text-sm text-on-surface-variant mt-1">Periodo: {formatPeriodo(activePeriodo?.mes_anio)} • Mostrando: {filteredModalLecturas.length}</p>
          </div>

          <div className="flex-grow w-full md:max-w-sm md:mx-4 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" translate="no">search</span>
            <input
              type="text" value={modalSearchTerm} onChange={(e) => setModalSearchTerm(e.target.value)}
              placeholder="Buscar nombre, medidor o doc..."
              className="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all shadow-sm"
            />
          </div>

          <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors shrink-0 absolute top-4 right-4 md:static">
            <span className="material-symbols-outlined" translate="no">close</span>
          </button>
        </div>

        <div className="overflow-x-auto overflow-y-auto flex-grow bg-surface-container-lowest/30 max-h-[65vh]">
          {filteredModalLecturas.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] opacity-20 mb-3" translate="no">search_off</span>
              <p>No se encontraron resultados para "{modalSearchTerm}"</p>
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
                {filteredModalLecturas.map(record => (
                  <ReadingTableRow
                    key={record.id}
                    record={record}
                    medidorInfo={medidorMap.get(record.num_serie)}
                    onEdit={handleEditFromTable}
                    onClick={() => onRowClick?.(record)}
                    showDateFull
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
