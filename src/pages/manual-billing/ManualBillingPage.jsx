import React, { useState } from 'react';
import { useYear } from '../../context/YearContext';
import { useAuth } from '../../context/AuthContext';
import PeriodFormModal from '../settings/PeriodFormModal';

// Hooks
import { useBillingData } from './hooks/useBillingData';
import { useBillingForms } from './hooks/useBillingForms';

// Components
import { BillingHeader } from './components/BillingHeader';
import { MedidoresTable } from './components/MedidoresTable';
import { RegistrationForm } from './components/RegistrationForm';
import { HistoryPanel } from './components/HistoryPanel';
import { AllReadingsModal } from './components/AllReadingsModal';
import { EditReadingModal } from './components/EditReadingModal';
import { ReadingDetailDrawer } from './components/ReadingDetailDrawer';

const ManualBilling = () => {
  const { activeYear } = useYear();
  const { user } = useAuth();
  
  // Data Hook
  const billingData = useBillingData(activeYear);
  const {
    activePeriodo, setActivePeriodo,
    periodosFiltrados,
    lecturasPeriodoActivo,
    lecturasPeriodoActivoMap,
    medidores,
    medidorMap,
    totalRegistrados,
    totalMedidores,
    porcentajeAvance,
    dashOffset,
    fetchPeriodos,
    fetchData,
    isLoading
  } = billingData;

  // Forms Hook
  const billingForms = useBillingForms(billingData, user);
  const {
    searchTerm, handleSearchChange,
    selectedMember, handleSelectMember, resetForm,
    currentReading, setCurrentReading,
    currentReadingPunta, setCurrentReadingPunta,
    factorPotencia, setFactorPotencia,
    precioReactiva, setPrecioReactiva,
    maxDemandaFueraPunta, setMaxDemandaFueraPunta,
    maxDemandaPunta, setMaxDemandaPunta,
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

        <div className="flex flex-col gap-lg">
          {/* Top Section: Search & Form / Table */}
          <div className="w-full">
            {selectedMember && (
                <RegistrationForm 
                selectedMember={selectedMember}
                onClose={resetForm}
                lecturaExistente={lecturaExistente}
                activePeriodo={activePeriodo}
                currentReading={currentReading} setCurrentReading={setCurrentReading}
                currentReadingPunta={currentReadingPunta} setCurrentReadingPunta={setCurrentReadingPunta}
                factorPotencia={factorPotencia} setFactorPotencia={setFactorPotencia}
                precioReactiva={precioReactiva} setPrecioReactiva={setPrecioReactiva}
                maxDemandaFueraPunta={maxDemandaFueraPunta} setMaxDemandaFueraPunta={setMaxDemandaFueraPunta}
                maxDemandaPunta={maxDemandaPunta} setMaxDemandaPunta={setMaxDemandaPunta}
                isCambioMedidor={isCambioMedidor} setIsCambioMedidor={setIsCambioMedidor}
                lecturaFinalAntiguo={lecturaFinalAntiguo} setLecturaFinalAntiguo={setLecturaFinalAntiguo}
                lecturaInicialNuevo={lecturaInicialNuevo} setLecturaInicialNuevo={setLecturaInicialNuevo}
                lecturaFinalAntiguoPunta={lecturaFinalAntiguoPunta} setLecturaFinalAntiguoPunta={setLecturaFinalAntiguoPunta}
                lecturaInicialNuevoPunta={lecturaInicialNuevoPunta} setLecturaInicialNuevoPunta={setLecturaInicialNuevoPunta}
                isSaving={isSaving} handleSave={handleSave}
              />
            )}
            <div className={selectedMember ? 'hidden' : 'block'}>
              <MedidoresTable 
                medidores={medidores}
                searchTerm={searchTerm}
                handleSearchChange={handleSearchChange}
                handleSelectMember={handleSelectMember}
                lecturasPeriodoActivoMap={lecturasPeriodoActivoMap}
                activePeriodo={activePeriodo}
                isVisible={!selectedMember}
              />
            </div>
          </div>

          {/* Bottom Section: History */}
          <div className="w-full">
            <HistoryPanel 
              activePeriodo={activePeriodo}
              lecturasPeriodoActivo={lecturasPeriodoActivo}
              medidorMap={medidorMap}
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
            medidorMap={medidorMap}
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
            medidorMap={medidorMap}
            setEditModalData={setEditModalData}
            handleUpdateLectura={handleUpdateLectura}
            editReadingVal={editReadingVal} setEditReadingVal={setEditReadingVal}
            editReadingValPunta={editReadingValPunta} setEditReadingValPunta={setEditReadingValPunta}
            editFactorPotencia={editFactorPotencia} setEditFactorPotencia={setEditFactorPotencia}
            editMaxDemandaFueraPunta={editMaxDemandaFueraPunta} setEditMaxDemandaFueraPunta={setEditMaxDemandaFueraPunta}
            editMaxDemandaPunta={editMaxDemandaPunta} setEditMaxDemandaPunta={setEditMaxDemandaPunta}
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
        medidorInfo={selectedDetailRecord ? medidorMap.get(selectedDetailRecord.num_serie) : null}
        activePeriodo={activePeriodo}
        onClose={() => setSelectedDetailRecord(null)} 
        onEdit={(record) => {
          setSelectedDetailRecord(null); // Close the drawer first
          handleEditFromTable(record);
        }}
      />

      <PeriodFormModal isOpen={isPeriodModalOpen} onClose={() => setIsPeriodModalOpen(false)} onSuccess={fetchPeriodos} existentes={periodosFiltrados} />
    </main>
  );
};

export default ManualBilling;
