import React, { useState } from 'react';
import { useYear } from '../../context/YearContext';
import PeriodFormModal from '../settings/PeriodFormModal';

// Hooks
import { useBillingData } from './hooks/useBillingData';
import { useBillingForms } from './hooks/useBillingForms';

// Components
import { BillingHeader } from './components/BillingHeader';
import { SearchPanel } from './components/SearchPanel';
import { RegistrationForm } from './components/RegistrationForm';
import { HistoryPanel } from './components/HistoryPanel';
import { AllReadingsModal } from './components/AllReadingsModal';
import { EditReadingModal } from './components/EditReadingModal';
import { ReadingDetailDrawer } from './components/ReadingDetailDrawer';

const ManualBilling = () => {
  const { activeYear } = useYear();
  
  // Data Hook
  const billingData = useBillingData(activeYear);
  const {
    activePeriodo, setActivePeriodo,
    periodosFiltrados,
    lecturasPeriodoActivo,
    medidorDocMap,
    totalRegistrados,
    totalMedidores,
    porcentajeAvance,
    dashOffset,
    fetchPeriodos
  } = billingData;

  // Forms Hook
  const billingForms = useBillingForms(billingData);
  const {
    searchTerm, handleSearchChange,
    selectedMember, handleSelectMember, resetForm,
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
  } = billingForms;

  const [selectedDetailRecord, setSelectedDetailRecord] = useState(null);

  return (
    <main className="p-4 md:p-xl space-y-4 md:space-y-lg max-w-[1600px] mx-auto w-full flex-grow relative flex flex-col h-full">
      <div className="space-y-lg w-full">
        <BillingHeader 
          activePeriodo={activePeriodo}
          setActivePeriodo={setActivePeriodo}
          periodosFiltrados={periodosFiltrados}
          activeYear={activeYear}
          setIsPeriodModalOpen={setIsPeriodModalOpen}
          resetForm={resetForm}
          totalRegistrados={totalRegistrados}
          totalMedidores={totalMedidores}
          porcentajeAvance={porcentajeAvance}
          dashOffset={dashOffset}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          {/* Left Column: Search & Form */}
          <div className="lg:col-span-7 space-y-lg">
            <SearchPanel 
              searchTerm={searchTerm}
              handleSearchChange={handleSearchChange}
              isSearchFocused={isSearchFocused}
              setIsSearchFocused={setIsSearchFocused}
              currentSearchResults={currentSearchResults}
              selectedMember={selectedMember}
              handleSelectMember={handleSelectMember}
            />

            {selectedMember ? (
                <RegistrationForm 
                selectedMember={selectedMember}
                lecturaExistente={lecturaExistente}
                activePeriodo={activePeriodo}
                currentReading={currentReading} setCurrentReading={setCurrentReading}
                currentReadingPunta={currentReadingPunta} setCurrentReadingPunta={setCurrentReadingPunta}
                factorPotencia={factorPotencia} setFactorPotencia={setFactorPotencia}
                precioFactorPotencia={precioFactorPotencia} setPrecioFactorPotencia={setPrecioFactorPotencia}
                isCambioMedidor={isCambioMedidor} setIsCambioMedidor={setIsCambioMedidor}
                lecturaFinalAntiguo={lecturaFinalAntiguo} setLecturaFinalAntiguo={setLecturaFinalAntiguo}
                lecturaInicialNuevo={lecturaInicialNuevo} setLecturaInicialNuevo={setLecturaInicialNuevo}
                lecturaFinalAntiguoPunta={lecturaFinalAntiguoPunta} setLecturaFinalAntiguoPunta={setLecturaFinalAntiguoPunta}
                lecturaInicialNuevoPunta={lecturaInicialNuevoPunta} setLecturaInicialNuevoPunta={setLecturaInicialNuevoPunta}
                isSaving={isSaving} handleSave={handleSave}
              />
            ) : (
              <div className="bg-surface border border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center text-center animate-in fade-in min-h-[250px] shadow-sm">
                <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4 shadow-inner ring-4 ring-primary/5">
                  <span className="material-symbols-outlined text-[32px] text-primary/80">barcode_scanner</span>
                </div>
                <h3 className="text-base text-on-surface font-bold tracking-tight">Listo para Registrar</h3>
                <p className="text-xs text-on-surface-variant mt-1.5 max-w-sm">
                  Utiliza la barra de búsqueda rápida superior para encontrar un medidor por nombre, documento o serie.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: History */}
          <div className="lg:col-span-5 h-full">
            <HistoryPanel 
              activePeriodo={activePeriodo}
              lecturasPeriodoActivo={lecturasPeriodoActivo}
              setIsModalOpen={setIsModalOpen}
              onRowClick={(record) => setSelectedDetailRecord(record)}
            />
          </div>
        </div>
      </div>

      
        {isModalOpen && (
          <AllReadingsModal 
            activePeriodo={activePeriodo}
            lecturasPeriodoActivo={lecturasPeriodoActivo}
            medidorDocMap={medidorDocMap}
            modalSearchTerm={modalSearchTerm}
            setModalSearchTerm={setModalSearchTerm}
            setIsModalOpen={setIsModalOpen}
            handleEditFromTable={handleEditFromTable}
            onRowClick={(record) => setSelectedDetailRecord(record)}
          />
        )}
      

      
        {editModalData && (
          <EditReadingModal 
            editModalData={editModalData}
            setEditModalData={setEditModalData}
            handleUpdateLectura={handleUpdateLectura}
            editReadingVal={editReadingVal} setEditReadingVal={setEditReadingVal}
            editReadingValPunta={editReadingValPunta} setEditReadingValPunta={setEditReadingValPunta}
            editFactorPotencia={editFactorPotencia} setEditFactorPotencia={setEditFactorPotencia}
            editPrecioFactorPotencia={editPrecioFactorPotencia} setEditPrecioFactorPotencia={setEditPrecioFactorPotencia}
            editJustificacion={editJustificacion} setEditJustificacion={setEditJustificacion}
            editLecturaFinalAntiguo={editLecturaFinalAntiguo} setEditLecturaFinalAntiguo={setEditLecturaFinalAntiguo}
            editLecturaInicialNuevo={editLecturaInicialNuevo} setEditLecturaInicialNuevo={setEditLecturaInicialNuevo}
            editLecturaFinalAntiguoPunta={editLecturaFinalAntiguoPunta} setEditLecturaFinalAntiguoPunta={setEditLecturaFinalAntiguoPunta}
            editLecturaInicialNuevoPunta={editLecturaInicialNuevoPunta} setEditLecturaInicialNuevoPunta={setEditLecturaInicialNuevoPunta}
            isSaving={isSaving}
          />
        )}
      
      
      <ReadingDetailDrawer 
        record={selectedDetailRecord} 
        onClose={() => setSelectedDetailRecord(null)} 
      />

      <PeriodFormModal isOpen={isPeriodModalOpen} onClose={() => setIsPeriodModalOpen(false)} onSuccess={fetchPeriodos} existentes={periodosFiltrados} />
    </main>
  );
};

export default ManualBilling;
