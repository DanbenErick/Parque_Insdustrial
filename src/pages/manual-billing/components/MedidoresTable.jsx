import React, { useState, useMemo } from 'react';
import { BadgeType } from './shared/BadgeType';
import { DeudaPersonalizadaModal } from './DeudaPersonalizadaModal';

export const MedidoresTable = ({
  medidores,
  searchTerm,
  handleSearchChange,
  handleSelectMember,
  lecturasPeriodoActivoMap,
  activePeriodo
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [modalDeudaOpen, setModalDeudaOpen] = useState(false);
  const [selectedForDeuda, setSelectedForDeuda] = useState(null);

  // Filtrado local por término de búsqueda
  const filteredMedidores = useMemo(() => {
    if (!searchTerm.trim()) return medidores;
    const lowerTerm = searchTerm.toLowerCase();
    return medidores.filter(m => 
      (m.num_serie && m.num_serie.toLowerCase().includes(lowerTerm)) ||
      (m.propietario && m.propietario.toLowerCase().includes(lowerTerm)) ||
      (m.documento_identidad && m.documento_identidad.toLowerCase().includes(lowerTerm))
    );
  }, [medidores, searchTerm]);

  // Reset page when searching
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredMedidores.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMedidores.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-white rounded-3xl border border-outline-variant shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-5 py-3 border-b border-outline-variant bg-surface-container-lowest flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-on-surface text-base flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary">view_list</span>
            Seleccione un Medidor
          </h3>
          <p className="text-[10px] text-on-surface-variant mt-0.5">Haga clic en 'Seleccionar' para iniciar el registro.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">search</span>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar socio o medidor..."
            className="w-full pl-8 pr-3 py-1.5 border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange({ target: { value: '' } })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container/30">
              <th className="px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Socio / Propietario</th>
              <th className="px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Medidor</th>
              <th className="px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-center">Estado</th>
              <th className="px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {currentItems.length > 0 ? (
              currentItems.map((medidor) => {
                const isLecturado = lecturasPeriodoActivoMap?.has(medidor.num_serie);
                return (
                  <tr key={medidor.id} className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="px-4 py-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-[11px] text-on-surface leading-tight mb-0.5">{medidor.propietario}</span>
                        <div className="flex items-center gap-1.5 text-[9px] text-on-surface-variant">
                          <span className="font-data-mono bg-surface-variant/30 px-1 py-0.5 rounded border border-outline-variant">{medidor.documento_identidad}</span>
                          <span className="truncate max-w-[150px]" title={medidor.socio_direccion || 'Sin dirección'}>{medidor.socio_direccion || 'Sin dirección'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-data-mono font-bold text-[11px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                          {medidor.num_serie}
                        </span>
                        <div className="scale-90 origin-left">
                          <BadgeType tipo={medidor.tipo} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {isLecturado ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          Lecturado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[12px]">pending_actions</span>
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedForDeuda(medidor);
                            setModalDeudaOpen(true);
                          }}
                          className="px-2.5 py-1 bg-surface-variant text-on-surface-variant border border-outline-variant rounded-md text-[10px] font-bold hover:bg-error hover:text-white hover:border-error transition-colors inline-flex items-center gap-1 shadow-sm"
                          title="Añadir deuda personalizada"
                        >
                          <span className="material-symbols-outlined text-[14px]">payments</span>
                          Deuda
                        </button>
                        {!isLecturado && (
                          <button
                            onClick={() => handleSelectMember(medidor)}
                            className="px-2.5 py-1 bg-surface text-on-surface border border-outline-variant rounded-md text-[10px] font-bold hover:bg-primary hover:text-white hover:border-primary transition-colors inline-flex items-center gap-1 shadow-sm"
                          >
                            Seleccionar
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[40px] opacity-50 mb-2">search_off</span>
                  <p>No se encontraron medidores con la búsqueda proporcionada.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-5 py-2.5 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between mt-auto">
          <span className="text-[10px] text-on-surface-variant font-medium">
            Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredMedidores.length)} de {filteredMedidores.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <div className="flex items-center gap-1 px-1.5">
              <span className="text-[11px] font-bold">{currentPage}</span>
              <span className="text-[10px] text-on-surface-variant">/ {totalPages}</span>
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, Math.min(totalPages, p + 1)))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      <DeudaPersonalizadaModal 
        isOpen={modalDeudaOpen}
        onClose={() => {
          setModalDeudaOpen(false);
          setSelectedForDeuda(null);
        }}
        selectedMedidor={selectedForDeuda}
        activePeriodo={activePeriodo}
      />
    </div>
  );
};
