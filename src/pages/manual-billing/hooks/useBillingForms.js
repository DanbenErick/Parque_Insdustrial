import { useState, useMemo, useCallback, useEffect } from 'react';
import api from '../../../api/axiosConfig';
import { toast } from 'sonner';
import { parseSafe } from '../utils';

export const useBillingForms = (dataHook, user) => {
  const { 
    medidores, setMedidores,
    activePeriodo, 
    lecturasPeriodoActivoMap,
    setLecturas 
  } = dataHook;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [currentSearchResults, setCurrentSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Forms state
  const [currentReading, setCurrentReading] = useState('');
  const [currentReadingPunta, setCurrentReadingPunta] = useState('');
  const [factorPotencia, setFactorPotencia] = useState('');
  const [maxDemandaFueraPunta, setMaxDemandaFueraPunta] = useState('');
  const [maxDemandaPunta, setMaxDemandaPunta] = useState('');
  const [precioReactiva, setPrecioReactiva] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Cambio de Medidor State
  const [isCambioMedidor, setIsCambioMedidor] = useState(false);
  const [lecturaFinalAntiguo, setLecturaFinalAntiguo] = useState('');
  const [lecturaInicialNuevo, setLecturaInicialNuevo] = useState('0');
  
  // Cambio de Medidor (Punta) State
  const [lecturaFinalAntiguoPunta, setLecturaFinalAntiguoPunta] = useState('');
  const [lecturaInicialNuevoPunta, setLecturaInicialNuevoPunta] = useState('0');
  
  // UI state
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  
  // Edit Modal State
  const [editModalData, setEditModalData] = useState(null);
  const [editReadingVal, setEditReadingVal] = useState('');
  const [editReadingValPunta, setEditReadingValPunta] = useState('');
  const [editFactorPotencia, setEditFactorPotencia] = useState('');
  const [editMaxDemandaFueraPunta, setEditMaxDemandaFueraPunta] = useState('');
  const [editMaxDemandaPunta, setEditMaxDemandaPunta] = useState('');
  const [editPrecioReactiva, setEditPrecioReactiva] = useState('');
  const [editJustificacion, setEditJustificacion] = useState('');

  // Edit Cambio de Medidor
  const [editLecturaFinalAntiguo, setEditLecturaFinalAntiguo] = useState('');
  const [editLecturaInicialNuevo, setEditLecturaInicialNuevo] = useState('');
  const [editLecturaFinalAntiguoPunta, setEditLecturaFinalAntiguoPunta] = useState('');
  const [editLecturaInicialNuevoPunta, setEditLecturaInicialNuevoPunta] = useState('');

  useEffect(() => {
    const term = searchTerm.trim();
    if (!term) {
      setCurrentSearchResults([]);
      return;
    }
    
    // Skip if search term was auto-filled by selecting a member
    if (selectedMember && (searchTerm === selectedMember.propietario || searchTerm === selectedMember.num_serie)) {
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/medidores?search=${encodeURIComponent(term)}`);
        setCurrentSearchResults(res.data);
      } catch (err) {
        console.error('Error en búsqueda de medidores', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedMember]);

  const lecturaExistente = selectedMember ? lecturasPeriodoActivoMap.get(selectedMember.num_serie) || null : null;

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setSelectedMember(null);
  }, []);

  const handleSelectMember = useCallback((member) => {
    setSelectedMember(member);
    setSearchTerm(member.propietario || member.num_serie);
    setCurrentReading('');
    setCurrentReadingPunta('');
    setFactorPotencia('');
    setPrecioReactiva(activePeriodo?.precio_energia_reactiva || '');
    setMaxDemandaFueraPunta('');
    setMaxDemandaPunta('');
    setIsCambioMedidor(false);
    setLecturaFinalAntiguo('');
    setLecturaInicialNuevo('0');
    setLecturaFinalAntiguoPunta('');
    setLecturaInicialNuevoPunta('0');
  }, [activePeriodo]);

  const handleEditFromTable = useCallback((record) => {
    setEditModalData(record);
    setEditReadingVal(record.lectura_actual);
    setEditReadingValPunta(record.lectura_actual_punta || '');
    setEditFactorPotencia(record.factor_potencia || '');
    setEditMaxDemandaFueraPunta(record.max_demanda_fuera_punta || '');
    setEditMaxDemandaPunta(record.max_demanda_punta || '');
    setEditPrecioReactiva(record.precio_factor_potencia || '');
    setEditJustificacion('');
    
    // Set meter change values if they exist
    setEditLecturaFinalAntiguo(record.lectura_final_viejo !== null ? record.lectura_final_viejo : '');
    setEditLecturaInicialNuevo(record.lectura_inicial_nuevo !== null ? record.lectura_inicial_nuevo : '');
    setEditLecturaFinalAntiguoPunta(record.lectura_final_viejo_punta !== null ? record.lectura_final_viejo_punta : '');
    setEditLecturaInicialNuevoPunta(record.lectura_inicial_nuevo_punta !== null ? record.lectura_inicial_nuevo_punta : '');
    
    setIsModalOpen(false); 
  }, []);

  const resetForm = useCallback(() => {
    setSelectedMember(null);
    setSearchTerm('');
    setCurrentReading('');
    setCurrentReadingPunta('');
    setFactorPotencia('');
    setPrecioReactiva('');
    setMaxDemandaFueraPunta('');
    setMaxDemandaPunta('');
    setIsCambioMedidor(false);
    setLecturaFinalAntiguo('');
    setLecturaInicialNuevo('0');
    setLecturaFinalAntiguoPunta('');
    setLecturaInicialNuevoPunta('0');
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentReading || !selectedMember || !activePeriodo) return;
    
    const isTR = selectedMember.tipo === 'Hora Punta' || selectedMember.tipo === 'Tiempo Real';

    const calcConsumoNormal = isCambioMedidor 
      ? Math.max(0, parseSafe(lecturaFinalAntiguo) - parseSafe(selectedMember.ultima_lectura)) + Math.max(0, parseSafe(currentReading) - parseSafe(lecturaInicialNuevo))
      : Math.max(0, parseSafe(currentReading) - parseSafe(selectedMember.ultima_lectura));

    const calcConsumoPunta = isTR 
      ? (isCambioMedidor 
          ? Math.max(0, parseSafe(lecturaFinalAntiguoPunta) - parseSafe(selectedMember.ultima_lectura_punta)) + Math.max(0, parseSafe(currentReadingPunta) - parseSafe(lecturaInicialNuevoPunta))
          : Math.max(0, parseSafe(currentReadingPunta) - parseSafe(selectedMember.ultima_lectura_punta)))
      : 0;

    if (isCambioMedidor) {
      if (!lecturaFinalAntiguo || !lecturaInicialNuevo) {
        toast.error('Complete los datos del medidor antiguo y nuevo (Normal)');
        return;
      }
      if (isTR && (!lecturaFinalAntiguoPunta || !lecturaInicialNuevoPunta)) {
        toast.error('Complete los datos del medidor antiguo y nuevo (Punta)');
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        medidor_id: selectedMember.id,
        periodo_id: activePeriodo.id,
        lectura_anterior: parseSafe(selectedMember.ultima_lectura),
        lectura_actual: parseSafe(currentReading),
        consumo_calculado: calcConsumoNormal,
        lectura_anterior_punta: parseSafe(selectedMember.ultima_lectura_punta),
        lectura_actual_punta: currentReadingPunta ? parseSafe(currentReadingPunta) : 0,
        consumo_calculado_punta: calcConsumoPunta,
        factor_potencia: factorPotencia ? parseSafe(factorPotencia) : 0,
        max_demanda_fuera_punta: maxDemandaFueraPunta ? parseSafe(maxDemandaFueraPunta) : 0,
        max_demanda_punta: maxDemandaPunta ? parseSafe(maxDemandaPunta) : 0,
        precio_factor_potencia: precioReactiva ? parseSafe(precioReactiva) : 0,
        estado: 'Validado',
        // Campos de cambio de medidor
        es_cambio_medidor: isCambioMedidor,
        ...(isCambioMedidor && {
          lectura_final_viejo: parseSafe(lecturaFinalAntiguo),
          lectura_inicial_nuevo: parseSafe(lecturaInicialNuevo),
          ...(isTR && {
            lectura_final_viejo_punta: parseSafe(lecturaFinalAntiguoPunta),
            lectura_inicial_nuevo_punta: parseSafe(lecturaInicialNuevoPunta)
          })
        })
      };

      await api.post('/lecturas', payload);

      const consumo_calculado = parseSafe(currentReading) - parseSafe(selectedMember.ultima_lectura);
      const consumo_calculado_punta = currentReadingPunta ? parseSafe(currentReadingPunta) - parseSafe(selectedMember.ultima_lectura_punta || 0) : 0;

      const newLectura = {
        id: Date.now(), 
        propietario: selectedMember.propietario,
        num_serie: selectedMember.num_serie,
        tipo: selectedMember.tipo,
        lectura_anterior: parseSafe(selectedMember.ultima_lectura),
        lectura_actual: parseSafe(currentReading),
        consumo_calculado,
        lectura_anterior_punta: parseSafe(selectedMember.ultima_lectura_punta || 0),
        lectura_actual_punta: currentReadingPunta ? parseSafe(currentReadingPunta) : 0,
        consumo_calculado_punta,
        factor_potencia: factorPotencia ? parseSafe(factorPotencia) : 0,
        max_demanda_fuera_punta: maxDemandaFueraPunta ? parseSafe(maxDemandaFueraPunta) : 0,
        max_demanda_punta: maxDemandaPunta ? parseSafe(maxDemandaPunta) : 0,
        periodo: activePeriodo.mes_anio,
        tarifa_kwh: activePeriodo.tarifa_kwh,
        tarifa_kwh_punta: activePeriodo.tarifa_kwh_punta,
        factor_multiplicador: activePeriodo.factor_multiplicador,
        precio_factor_potencia: precioReactiva ? parseSafe(precioReactiva) : 0,
        fecha_registro: new Date().toISOString(),
        operario: user?.nombre_razonsocial || 'Tú',
        es_cambio_medidor: isCambioMedidor
      };

      setLecturas(prev => [newLectura, ...prev]);
      toast.success('Lectura guardada con éxito');

      setMedidores(prev => prev.map(m => m.id === selectedMember.id ? { 
        ...m, 
        ultima_lectura: currentReading,
        ...(currentReadingPunta ? { ultima_lectura_punta: currentReadingPunta } : {}),
        ...(maxDemandaFueraPunta ? { ultima_demanda_maxima_fuera_punta: maxDemandaFueraPunta } : {}),
        ...(maxDemandaPunta ? { ultima_demanda_maxima_punta: maxDemandaPunta } : {})
      } : m));
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar la lectura');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateLectura = async (e) => {
    e.preventDefault();
    if (!editReadingVal || !editModalData || !editJustificacion) return;

    setIsSaving(true);
    try {
      const isCambio = editModalData.es_cambio_medidor === 1 || editModalData.es_cambio_medidor === true;
      const isTR = editModalData.medidor_tipo === 'Hora Punta' || editModalData.medidor_tipo === 'Tiempo Real';

      const calcConsumoNormal = isCambio 
        ? Math.max(0, parseSafe(editLecturaFinalAntiguo) - parseSafe(editModalData.lectura_anterior)) + Math.max(0, parseSafe(editReadingVal) - parseSafe(editLecturaInicialNuevo))
        : Math.max(0, parseSafe(editReadingVal) - parseSafe(editModalData.lectura_anterior));

      const calcConsumoPunta = isTR 
        ? (isCambio 
            ? Math.max(0, parseSafe(editLecturaFinalAntiguoPunta) - parseSafe(editModalData.lectura_anterior_punta)) + Math.max(0, parseSafe(editReadingValPunta) - parseSafe(editLecturaInicialNuevoPunta))
            : Math.max(0, parseSafe(editReadingValPunta) - parseSafe(editModalData.lectura_anterior_punta)))
        : 0;

      const payload = {
        lectura_anterior: parseSafe(editModalData.lectura_anterior),
        lectura_actual: parseSafe(editReadingVal),
        consumo_calculado: calcConsumoNormal,
        lectura_anterior_punta: parseSafe(editModalData.lectura_anterior_punta),
        lectura_actual_punta: editReadingValPunta ? parseSafe(editReadingValPunta) : 0,
        consumo_calculado_punta: calcConsumoPunta,
        factor_potencia: editFactorPotencia ? parseSafe(editFactorPotencia) : 0,
        max_demanda_fuera_punta: editMaxDemandaFueraPunta ? parseSafe(editMaxDemandaFueraPunta) : 0,
        max_demanda_punta: editMaxDemandaPunta ? parseSafe(editMaxDemandaPunta) : 0,
        precio_factor_potencia: editPrecioReactiva ? parseSafe(editPrecioReactiva) : 0,
        justificacion: editJustificacion,
        estado: 'Validado',
        // Preserve meter change
        es_cambio_medidor: isCambio ? 1 : 0,
        ...(isCambio && {
          lectura_final_viejo: parseSafe(editLecturaFinalAntiguo),
          lectura_inicial_nuevo: parseSafe(editLecturaInicialNuevo),
          ...(isTR && {
            lectura_final_viejo_punta: parseSafe(editLecturaFinalAntiguoPunta),
            lectura_inicial_nuevo_punta: parseSafe(editLecturaInicialNuevoPunta)
          })
        })
      };

      await api.put(`/lecturas/${editModalData.id}`, payload);

      let consumo_calculado = 0;
      if (isCambio) {
        let cv = parseSafe(editLecturaFinalAntiguo) - parseSafe(editModalData.lectura_anterior);
        if (cv < 0) cv = 0;
        let cn = parseSafe(editReadingVal) - parseSafe(editLecturaInicialNuevo);
        if (cn < 0) cn = 0;
        consumo_calculado = cv + cn;
      } else {
        consumo_calculado = parseSafe(editReadingVal) - parseSafe(editModalData.lectura_anterior);
        if (consumo_calculado < 0) consumo_calculado = 0;
      }

      let consumo_calculado_punta = 0;
      if (isTR) {
        if (isCambio) {
          let cvp = parseSafe(editLecturaFinalAntiguoPunta) - parseSafe(editModalData.lectura_anterior_punta);
          if (cvp < 0) cvp = 0;
          let cnp = parseSafe(editReadingValPunta) - parseSafe(editLecturaInicialNuevoPunta);
          if (cnp < 0) cnp = 0;
          consumo_calculado_punta = cvp + cnp;
        } else {
          consumo_calculado_punta = parseSafe(editReadingValPunta) - parseSafe(editModalData.lectura_anterior_punta);
          if (consumo_calculado_punta < 0) consumo_calculado_punta = 0;
        }
      }

      setLecturas(prev => prev.map(l => {
        if (l.id === editModalData.id) {
          return {
            ...l,
            ...payload, // Spreads all updated values including justificacion and lectura_actual
            consumo_calculado,
            consumo_calculado_punta,
            fecha_registro: new Date().toISOString(),
            // Optimistically set the original values if they weren't set already
            lectura_actual_original: l.lectura_actual_original !== undefined && l.lectura_actual_original !== null ? l.lectura_actual_original : l.lectura_actual,
            lectura_actual_punta_original: l.lectura_actual_punta_original !== undefined && l.lectura_actual_punta_original !== null ? l.lectura_actual_punta_original : l.lectura_actual_punta,
            factor_potencia_original: l.factor_potencia_original !== undefined && l.factor_potencia_original !== null ? l.factor_potencia_original : l.factor_potencia,
          };
        }
        return l;
      }));

      setMedidores(prev => prev.map(m => m.num_serie === editModalData.num_serie ? { 
        ...m, 
        ultima_lectura: editReadingVal,
        ...(editReadingValPunta ? { ultima_lectura_punta: editReadingValPunta } : {})
      } : m));

      setEditModalData(null);
      toast.success('Lectura modificada y justificada con éxito');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al actualizar la lectura');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    searchTerm, setSearchTerm, handleSearchChange,
    selectedMember, handleSelectMember, setSelectedMember, resetForm,
    currentSearchResults, isSearchFocused, setIsSearchFocused,
    currentReading, setCurrentReading,
    currentReadingPunta, setCurrentReadingPunta,
    factorPotencia, setFactorPotencia,
    maxDemandaFueraPunta, setMaxDemandaFueraPunta,
    maxDemandaPunta, setMaxDemandaPunta,
    precioReactiva, setPrecioReactiva,
    isCambioMedidor, setIsCambioMedidor,
    lecturaFinalAntiguo, setLecturaFinalAntiguo,
    lecturaInicialNuevo, setLecturaInicialNuevo,
    lecturaFinalAntiguoPunta, setLecturaFinalAntiguoPunta,
    lecturaInicialNuevoPunta, setLecturaInicialNuevoPunta,
    isSaving, handleSave, lecturaExistente,
    isModalOpen, setIsModalOpen,
    modalSearchTerm, setModalSearchTerm,
    isPeriodModalOpen, setIsPeriodModalOpen,
    editModalData, setEditModalData, handleEditFromTable, handleUpdateLectura,
    editReadingVal, setEditReadingVal,
    editReadingValPunta, setEditReadingValPunta,
    editFactorPotencia, setEditFactorPotencia,
    editMaxDemandaFueraPunta, setEditMaxDemandaFueraPunta,
    editMaxDemandaPunta, setEditMaxDemandaPunta,
    editPrecioReactiva, setEditPrecioReactiva,
    editJustificacion, setEditJustificacion,
    editLecturaFinalAntiguo, setEditLecturaFinalAntiguo,
    editLecturaInicialNuevo, setEditLecturaInicialNuevo,
    editLecturaFinalAntiguoPunta, setEditLecturaFinalAntiguoPunta,
    editLecturaInicialNuevoPunta, setEditLecturaInicialNuevoPunta,
    isSearching
  };
};
