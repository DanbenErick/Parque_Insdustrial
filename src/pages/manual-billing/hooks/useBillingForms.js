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
  }, []);

  const handleEditFromTable = useCallback((record) => {
    setEditModalData(record);
    setEditReadingVal(record.lectura_actual);
    setEditReadingValPunta(record.lectura_actual_punta || '');
    setEditFactorPotencia(record.factor_potencia || '');
    setEditPrecioFactorPotencia(record.precio_factor_potencia || '');
    setEditJustificacion('');
    setIsModalOpen(false); 
  }, []);

  const resetForm = useCallback(() => {
    setSelectedMember(null);
    setSearchTerm('');
    setCurrentReading('');
    setCurrentReadingPunta('');
    setFactorPotencia('');
    setPrecioFactorPotencia('');
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentReading || !selectedMember || !activePeriodo) return;

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
        estado: 'Validado'
      };

      await api.post('/lecturas', payload);

      const newLectura = {
        id: Date.now(), 
        propietario: selectedMember.propietario,
        num_serie: selectedMember.num_serie,
        lectura_anterior: parseSafe(selectedMember.ultima_lectura),
        lectura_actual: parseSafe(currentReading),
        periodo: activePeriodo.mes_anio,
        fecha_registro: new Date().toISOString()
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
      const payload = {
        lectura_anterior: parseSafe(editModalData.lectura_anterior),
        lectura_actual: parseSafe(editReadingVal),
        lectura_anterior_punta: parseSafe(editModalData.lectura_anterior_punta),
        lectura_actual_punta: editReadingValPunta ? parseSafe(editReadingValPunta) : 0,
        factor_potencia: editFactorPotencia ? parseSafe(editFactorPotencia) : 0,
        justificacion: editJustificacion,
        estado: 'Validado'
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
    isSaving, handleSave, lecturaExistente,
    isModalOpen, setIsModalOpen,
    modalSearchTerm, setModalSearchTerm,
    isPeriodModalOpen, setIsPeriodModalOpen,
    editModalData, setEditModalData, handleEditFromTable, handleUpdateLectura,
    editReadingVal, setEditReadingVal,
    editReadingValPunta, setEditReadingValPunta,
    editFactorPotencia, setEditFactorPotencia,
    editPrecioFactorPotencia, setEditPrecioFactorPotencia,
    editJustificacion, setEditJustificacion
  };
};
