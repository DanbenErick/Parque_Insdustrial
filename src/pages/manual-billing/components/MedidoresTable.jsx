import React, { useState, useMemo } from 'react';
import { BadgeType } from './shared/BadgeType';
import { fmtVal, parseSafe } from '../utils';
import { useFloatingActionMenu } from '../../../hooks/useFloatingActionMenu';
import ReadingActionMenu from './ReadingActionMenu';

export const MedidoresTable = ({
  medidores,
  searchTerm,
  handleSearchChange,
  handleSelectMember,
  lecturasPeriodoActivoMap,
  omisionesMap,
  handleResumeOmission,
  activePeriodo,
  selectedMeterId,
  onViewReading,
  onEditReading,
  isVisible = true
}) => {
  const scrollRef = React.useRef(null);
  const [savedScroll, setSavedScroll] = useState(0);
  const [statusFilter, setStatusFilter] = useState('pending');
  const { actionMenu, setActionMenu, openActionMenu } = useFloatingActionMenu({ menuHeight: 126 });

  React.useEffect(() => {
    if (isVisible && scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = savedScroll;
        }
      }, 10);
    }
  }, [isVisible, savedScroll]);

  React.useEffect(() => {
    if (!selectedMeterId || !scrollRef.current) return;
    const selectedRow = scrollRef.current.querySelector(`[data-meter-id="${selectedMeterId}"]`);
    selectedRow?.scrollIntoView({ block: 'nearest' });
  }, [selectedMeterId]);

  const onSelectClick = (medidor) => {
    if (scrollRef.current) {
      setSavedScroll(scrollRef.current.scrollTop);
    }
    handleSelectMember(medidor);
  };

  const handleOpenActionMenu = (reading, medidor, event) => {
    openActionMenu(event, { reading, medidor }, reading.id);
  };

  const operationalMeters = useMemo(
    () => (medidores || []).filter(m => m.operativo !== false && m.operativo !== 0 && m.operativo !== '0'),
    [medidores]
  );

  const statusCounts = useMemo(() => {
    const registered = operationalMeters.reduce(
      (total, meter) => total + (lecturasPeriodoActivoMap?.has(meter.num_serie) ? 1 : 0),
      0
    );
    const skipped = operationalMeters.reduce(
      (total, meter) => total + (!lecturasPeriodoActivoMap?.has(meter.num_serie) && omisionesMap?.has(Number(meter.id)) ? 1 : 0),
      0
    );
    return {
      all: operationalMeters.length,
      done: registered,
      skipped,
      pending: Math.max(0, operationalMeters.length - registered - skipped)
    };
  }, [operationalMeters, lecturasPeriodoActivoMap, omisionesMap]);

  const periodKey = activePeriodo?.id || activePeriodo?.mes_anio || null;
  const autoSelectedPeriodRef = React.useRef(null);

  React.useEffect(() => {
    setStatusFilter('pending');
    autoSelectedPeriodRef.current = null;
  }, [periodKey]);

  React.useEffect(() => {
    if (!periodKey || statusCounts.pending > 0 || autoSelectedPeriodRef.current === periodKey) return;
    autoSelectedPeriodRef.current = periodKey;
    setStatusFilter(statusCounts.done > 0 ? 'done' : statusCounts.skipped > 0 ? 'skipped' : 'all');
  }, [periodKey, statusCounts.pending, statusCounts.done, statusCounts.skipped]);

  // Búsqueda local por todos los datos visibles y filtro por estado de trabajo.
  const filteredMedidores = useMemo(() => {
    const lowerTerm = searchTerm.trim().toLowerCase();
    return operationalMeters
      .filter(meter => {
        const isRegistered = lecturasPeriodoActivoMap?.has(meter.num_serie);
        const isSkipped = !isRegistered && omisionesMap?.has(Number(meter.id));
        if (statusFilter === 'pending' && (isRegistered || isSkipped)) return false;
        if (statusFilter === 'done' && !isRegistered) return false;
        if (statusFilter === 'skipped' && !isSkipped) return false;
        if (!lowerTerm) return true;

        return [
          meter.num_serie,
          meter.propietario,
          meter.documento_identidad,
          meter.socio_direccion,
          meter.direccion,
          meter.tipo
        ].some(value => String(value || '').toLowerCase().includes(lowerTerm));
      })
      .sort((a, b) => {
        if (statusFilter === 'all') {
          const statusRank = (meter) => {
            if (lecturasPeriodoActivoMap?.has(meter.num_serie)) return 2;
            if (omisionesMap?.has(Number(meter.id))) return 1;
            return 0;
          };
          const rankDifference = statusRank(a) - statusRank(b);
          if (rankDifference !== 0) return rankDifference;
        }
        return (a.propietario || '').localeCompare(b.propietario || '', 'es');
      });
  }, [operationalMeters, searchTerm, statusFilter, lecturasPeriodoActivoMap, omisionesMap]);

  const filterCopy = {
    pending: ['Medidores pendientes', 'Registre primero los medidores que aún faltan en este periodo.'],
    all: ['Todos los medidores', 'Los pendientes aparecen primero para facilitar el trabajo.'],
    done: ['Lecturas registradas', 'Medidores que ya cuentan con lectura en este periodo.'],
    skipped: ['Medidores omitidos', 'Revise los motivos y devuelva a pendientes cuando sea posible leerlos.']
  };

  // Remove local reset page logic


  return (
    <div className="bg-white rounded-3xl border border-outline-variant shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-4 sm:px-5 py-3 border-b border-outline-variant bg-surface-container-lowest flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-on-surface text-base flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary" translate="no">view_list</span>
            {filterCopy[statusFilter][0]}
          </h3>
          <p className="text-[11px] text-on-surface-variant mt-0.5">{filterCopy[statusFilter][1]}</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full lg:w-auto">
          <div className="grid grid-cols-2 sm:flex items-center gap-0.5 bg-surface-container rounded-lg p-0.5 w-full sm:w-auto" role="group" aria-label="Filtrar medidores por estado">
            {[
              ['pending', 'Pendientes'],
              ['done', 'Registrados'],
              ['skipped', 'Omitidos'],
              ['all', 'Todos']
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                aria-pressed={statusFilter === value}
                className={`min-w-0 px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-colors ${
                  statusFilter === value
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {label} <span className="font-data-mono opacity-70">{statusCounts[value]}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]" translate="no">search</span>
            </div>
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Socio, dirección, DNI o medidor..."
              className="w-full pl-8 pr-8 py-1.5 border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs outline-none transition-all bg-white"
            />
            {searchTerm && (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={() => handleSearchChange({ target: { value: '' } })}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-on-surface-variant hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]" translate="no">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="overflow-x-auto custom-scrollbar flex-1">
        <div className="md:hidden divide-y divide-outline-variant/60">
          {filteredMedidores.length > 0 ? filteredMedidores.map((medidor) => {
            const reading = lecturasPeriodoActivoMap?.get(medidor.num_serie);
            const isLecturado = Boolean(reading);
            const omission = !isLecturado ? omisionesMap?.get(Number(medidor.id)) : null;
            const meterAddress = medidor.direccion || medidor.socio_direccion || 'Sin dirección';

            return (
              <article
                key={medidor.id}
                className={`p-4 space-y-3 ${selectedMeterId === medidor.id ? 'bg-primary/5 border-l-[3px] border-l-primary' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-on-surface leading-tight truncate">{medidor.propietario}</h4>
                    <p className="mt-1 text-[10px] text-on-surface-variant truncate" title={meterAddress}>{meterAddress}</p>
                  </div>
                  {isLecturado ? (
                    <span className="shrink-0 inline-flex items-center gap-1 bg-green-100 text-green-800 text-[9px] font-bold px-2 py-1 rounded-full uppercase">
                      <span className="material-symbols-outlined text-[12px]" translate="no">check_circle</span> Registrada
                    </span>
                  ) : omission ? (
                    <span className="shrink-0 inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-1 rounded-full uppercase">
                      <span className="material-symbols-outlined text-[12px]" translate="no">schedule</span> Omitida
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-[9px] font-bold px-2 py-1 rounded-full uppercase">
                      <span className="material-symbols-outlined text-[12px]" translate="no">pending_actions</span> Pendiente
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-data-mono font-bold text-[11px] bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                    {medidor.num_serie}
                  </span>
                  <BadgeType tipo={medidor.tipo} />
                  <span className="font-data-mono text-[9px] text-on-surface-variant border border-outline-variant rounded px-1.5 py-0.5">
                    DNI {medidor.documento_identidad || '—'}
                  </span>
                </div>

                {reading && (
                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface-container-low p-2.5">
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-on-surface-variant">Lectura</span>
                      <span className="font-data-mono text-xs font-bold text-primary">{fmtVal(reading.lectura_actual)} kWh</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-on-surface-variant">Consumo</span>
                      <span className="font-data-mono text-xs font-bold text-emerald-700">+{fmtVal(reading.consumo_calculado)} kWh</span>
                    </div>
                  </div>
                )}

                {omission && (
                  <p className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-2 text-[10px] text-amber-900">
                    <strong>Motivo:</strong> {[omission.motivo, omission.detalle].filter(Boolean).join(' · ')}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  {isLecturado ? (
                    <button
                      type="button"
                      onClick={(event) => handleOpenActionMenu(reading, medidor, event)}
                      className={`h-9 flex-1 border rounded-lg text-[10px] font-bold inline-flex items-center justify-center gap-1 transition-colors ${actionMenu?.reading?.id === reading.id ? 'border-primary/30 bg-primary/10 text-primary' : 'border-outline-variant text-on-surface'}`}
                    >
                      <span className="material-symbols-outlined text-[17px]" translate="no">more_vert</span> Acciones
                    </button>
                  ) : omission ? (
                    <button
                      type="button"
                      onClick={() => handleResumeOmission(omission)}
                      className="h-9 flex-1 border border-amber-300 bg-amber-50 text-amber-800 rounded-lg text-[10px] font-bold inline-flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]" translate="no">replay</span> Reactivar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectClick(medidor)}
                      className="h-9 flex-1 bg-primary text-on-primary rounded-lg text-[10px] font-bold inline-flex items-center justify-center gap-1 shadow-sm"
                    >
                      Registrar <span className="material-symbols-outlined text-[15px]" translate="no">arrow_forward</span>
                    </button>
                  )}
                </div>
              </article>
            );
          }) : (
            <div className="px-5 py-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[40px] opacity-50 mb-2" translate="no">
                {searchTerm ? 'search_off' : statusFilter === 'pending' ? 'task_alt' : 'inbox'}
              </span>
              <p className="font-bold text-sm text-on-surface">
                {searchTerm
                  ? 'No se encontraron medidores con esa búsqueda.'
                  : statusFilter === 'pending'
                    ? 'Todas las lecturas del periodo están registradas.'
                    : 'No hay medidores para mostrar.'}
              </p>
            </div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[780px]">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container/30">
              <th className="px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Socio / Propietario</th>
              <th className="px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Medidor</th>
              <th className="px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Lectura / Consumo</th>
              <th className="px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-center">Estado</th>
              <th className="px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {filteredMedidores.length > 0 ? (
              filteredMedidores.map((medidor) => {
                const reading = lecturasPeriodoActivoMap?.get(medidor.num_serie);
                const isLecturado = Boolean(reading);
                const omission = !isLecturado ? omisionesMap?.get(Number(medidor.id)) : null;
                const meterAddress = medidor.direccion || medidor.socio_direccion || 'Sin dirección';
                return (
                  <tr
                    key={medidor.id}
                    data-meter-id={medidor.id}
                    className={`transition-colors group ${
                      selectedMeterId === medidor.id
                        ? 'bg-primary/5 border-l-[3px] border-l-primary'
                        : 'hover:bg-surface-container-lowest'
                    }`}
                  >
                    <td className="px-4 py-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-[11px] text-on-surface leading-tight mb-0.5">{medidor.propietario}</span>
                        <div className="flex items-center gap-1.5 text-[9px] text-on-surface-variant">
                          <span className="font-data-mono bg-surface-variant/30 px-1 py-0.5 rounded border border-outline-variant">{medidor.documento_identidad}</span>
                          <span className="truncate max-w-[180px]" title={meterAddress}>{meterAddress}</span>
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
                    <td className="px-4 py-2">
                      {reading ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-data-mono text-[11px] font-bold text-primary">
                            {fmtVal(reading.lectura_actual)} kWh
                            {parseSafe(reading.lectura_actual_punta) > 0 && (
                              <span className="ml-1.5 text-[9px] text-orange-700">· P {fmtVal(reading.lectura_actual_punta)}</span>
                            )}
                          </span>
                          <span className="font-data-mono text-[9px] font-bold text-emerald-700">
                            Consumo +{fmtVal(reading.consumo_calculado)} kWh
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-on-surface-variant/60 italic">Sin lectura</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {isLecturado ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[12px]" translate="no">check_circle</span>
                          Lecturado
                        </span>
                      ) : omission ? (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider" title={[omission.motivo, omission.detalle].filter(Boolean).join(': ')}>
                          <span className="material-symbols-outlined text-[12px]" translate="no">schedule</span>
                          Omitido
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[12px]" translate="no">pending_actions</span>
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isLecturado ? (
                          <button
                            type="button"
                            onClick={(event) => handleOpenActionMenu(reading, medidor, event)}
                            className={`w-7 h-7 rounded-md inline-flex items-center justify-center transition-colors ${actionMenu?.reading?.id === reading.id ? 'bg-primary/15 text-primary ring-1 ring-primary/30' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
                            title="Opciones de lectura"
                            aria-label={`Opciones de lectura de ${medidor.propietario}`}
                          >
                            <span className="material-symbols-outlined text-[20px]" translate="no">more_vert</span>
                          </button>
                        ) : omission ? (
                          <button
                            type="button"
                            onClick={() => handleResumeOmission(omission)}
                            className="px-2.5 py-1.5 border border-amber-300 bg-amber-50 text-amber-800 rounded-md text-[10px] font-bold hover:bg-amber-100 transition-colors inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]" translate="no">replay</span>
                            Reactivar
                          </button>
                        ) : !isLecturado && (
                          <button
                            type="button"
                            onClick={() => onSelectClick(medidor)}
                            aria-current={selectedMeterId === medidor.id ? 'true' : undefined}
                            className="px-3 py-1.5 bg-primary text-on-primary rounded-md text-[10px] font-bold hover:opacity-90 transition-opacity inline-flex items-center gap-1 shadow-sm"
                          >
                            Registrar
                            <span className="material-symbols-outlined text-[14px]" translate="no">arrow_forward</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[40px] opacity-50 mb-2" translate="no">
                    {searchTerm ? 'search_off' : statusFilter === 'pending' ? 'task_alt' : 'inbox'}
                  </span>
                  <p className="font-bold text-on-surface">
                    {searchTerm
                      ? 'No se encontraron medidores con esa búsqueda.'
                      : statusFilter === 'pending'
                        ? 'Todas las lecturas del periodo están registradas.'
                        : 'No hay medidores para mostrar.'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      <ReadingActionMenu
        menu={actionMenu}
        onClose={() => setActionMenu(null)}
        onView={onViewReading}
        onEdit={onEditReading}
      />

    </div>
  );
};
