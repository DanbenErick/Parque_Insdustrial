import { useState, useMemo, useCallback } from 'react';
import api from '../../../api/axiosConfig';
import { toast } from 'sonner';
import { parseSafe } from '../utils';

export const useBillingForms = (dataHook) => {
  const { 
    medidores, setMedidores,
    activePeriodo, 
    lecturasPeriodoActivoMap,
    setLecturas 
  } = dataHook;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Forms state
  const [currentReading, setCurrentReading] = useState('');
  const [currentReadingPunta, setCurrentReadingPunta] = useState('');
  const [factorPotencia, setFactorPotencia] = useState('');
  const [precioFactorPotencia, setPrecioFactorPotencia] = useState('');
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
  const [editPrecioFactorPotencia, setEditPrecioFactorPotencia] = useState('');
  const [editJustificacion, setEditJustificacion] = useState('');

  // Edit Cambio de Medidor
  const [editLecturaFinalAntiguo, setEditLecturaFinalAntiguo] = useState('');
  const [editLecturaInicialNuevo, setEditLecturaInicialNuevo] = useState('');
  const [editLecturaFinalAntiguoPunta, setEditLecturaFinalAntiguoPunta] = useState('');
  const [editLecturaInicialNuevoPunta, setEditLecturaInicialNuevoPunta] = useState('');

  const medidoresBuscables = useMemo(() => {
    return medidores.map(m => ({
      member: m,
      searchIndex: `${m.propietario || ''} ${m.documento_identidad || ''} ${m.num_serie || ''}`.toLowerCase()
    }));
  }, [medidores]);

  const currentSearchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return medidores;
    return medidoresBuscables.filter(m => m.searchIndex.includes(term)).map(m => m.member);
  }, [searchTerm, medidores, medidoresBuscables]);

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
    setPrecioFactorPotencia('');
    setIsCambioMedidor(false);
    setLecturaFinalAntiguo('');
    setLecturaInicialNuevo('0');
    setLecturaFinalAntiguoPunta('');
    setLecturaInicialNuevoPunta('0');
  }, []);

  const handleEditFromTable = useCallback((record) => {
    setEditModalData(record);
    setEditReadingVal(record.lectura_actual);
    setEditReadingValPunta(record.lectura_actual_punta || '');
    setEditFactorPotencia(record.factor_potencia || '');
    setEditPrecioFactorPotencia(record.precio_factor_potencia || '');
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
    setPrecioFactorPotencia('');
    setIsCambioMedidor(false);
    setLecturaFinalAntiguo('');
    setLecturaInicialNuevo('0');
    setLecturaFinalAntiguoPunta('');
    setLecturaInicialNuevoPunta('0');
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentReading || !selectedMember || !activePeriodo) return;
    
    const isTR = selectedMember.tipo === 'Tiempo Real';

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
        lectura_anterior_punta: parseSafe(selectedMember.ultima_lectura_punta),
        lectura_actual_punta: currentReadingPunta ? parseSafe(currentReadingPunta) : 0,
        factor_potencia: factorPotencia ? parseSafe(factorPotencia) : 0,
        precio_factor_potencia: precioFactorPotencia ? parseSafe(precioFactorPotencia) : 0,
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

      const newLectura = {
        id: Date.now(), 
        propietario: selectedMember.propietario,
        num_serie: selectedMember.num_serie,
        lectura_anterior: parseSafe(selectedMember.ultima_lectura),
        lectura_actual: parseSafe(currentReading),
        periodo: activePeriodo.mes_anio,
        fecha_registro: new Date().toISOString(),
        es_cambio_medidor: isCambioMedidor
      };

      setLecturas(prev => [newLectura, ...prev]);
      toast.success('Lectura guardada con éxito');

      setMedidores(prev => prev.map(m => m.id === selectedMember.id ? { 
        ...m, 
        ultima_lectura: currentReading,
        ...(currentReadingPunta ? { ultima_lectura_punta: currentReadingPunta } : {})
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
      const isTR = parseSafe(editModalData.lectura_anterior_punta) > 0 || parseSafe(editReadingValPunta) > 0;

      const payload = {
        lectura_anterior: parseSafe(editModalData.lectura_anterior),
        lectura_actual: parseSafe(editReadingVal),
        lectura_anterior_punta: parseSafe(editModalData.lectura_anterior_punta),
        lectura_actual_punta: editReadingValPunta ? parseSafe(editReadingValPunta) : 0,
        factor_potencia: editFactorPotencia ? parseSafe(editFactorPotencia) : 0,
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

      setLecturas(prev => prev.map(l => l.id === editModalData.id ? {
        ...l,
        lectura_actual: parseSafe(editReadingVal),
        lectura_actual_punta: editReadingValPunta ? parseSafe(editReadingValPunta) : 0,
        factor_potencia: editFactorPotencia ? parseSafe(editFactorPotencia) : 0,
        fecha_registro: new Date().toISOString()
      } : l));

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
    precioFactorPotencia, setPrecioFactorPotencia,
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
    editPrecioFactorPotencia, setEditPrecioFactorPotencia,
    editJustificacion, setEditJustificacion,
    editLecturaFinalAntiguo, setEditLecturaFinalAntiguo,
    editLecturaInicialNuevo, setEditLecturaInicialNuevo,
    editLecturaFinalAntiguoPunta, setEditLecturaFinalAntiguoPunta,
    editLecturaInicialNuevoPunta, setEditLecturaInicialNuevoPunta
  };
};
