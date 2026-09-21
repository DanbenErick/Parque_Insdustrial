import  { useState } from 'react';
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

import { AllReadingsModal } from './components/AllReadingsModal';
import { EditReadingModal } from './components/EditReadingModal';
import { ReadingDetailDrawer } from './components/ReadingDetailDrawer';
import { exportLecturasToExcel } from './utils/exportLecturasService';

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
    omisionesMap,
    medidores,
    medidorMap,
    totalRegistrados,
    totalMedidores,
    porcentajeAvance,
    dashOffset,
    fetchPeriodos
  } = billingData;

  // Forms Hook
  const billingForms = useBillingForms(billingData, user);
  const {
    searchTerm, handleSearchChange,
    selectedMember, handleSelectMember, resetForm, closeForm,
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
    isSkipping, handleSkip, handleResumeOmission,
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
      <div className="space-y-4 w-full">
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
          onExportExcel={() => exportLecturasToExcel(medidores, lecturasPeriodoActivoMap, activePeriodo)}
        />

        <div className={`w-full animate-in fade-in duration-200 ${selectedMember ? 'grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(420px,480px)] gap-4 items-start' : ''}`}>
            <div className={selectedMember ? 'order-2 xl:order-1 min-w-0' : ''}>
              <MedidoresTable
                medidores={medidores}
                searchTerm={searchTerm}
                handleSearchChange={handleSearchChange}
                handleSelectMember={handleSelectMember}
                lecturasPeriodoActivoMap={lecturasPeriodoActivoMap}
                omisionesMap={omisionesMap}
                handleResumeOmission={handleResumeOmission}
                activePeriodo={activePeriodo}
                selectedMeterId={selectedMember?.id}
                onViewReading={(record) => setSelectedDetailRecord(record)}
                onEditReading={handleEditFromTable}
              />
            </div>
            {selectedMember && (
              <div className="order-1 xl:order-2 xl:sticky xl:top-4 min-w-0">
                <RegistrationForm
                  selectedMember={selectedMember}
                  onClose={closeForm}
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
                  isSkipping={isSkipping} handleSkip={handleSkip}
                />
              </div>
            )}
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
