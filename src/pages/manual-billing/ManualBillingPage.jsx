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

import { RegisteredReadingsTab } from './components/RegisteredReadingsTab';
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
  const [activeTab, setActiveTab] = useState('registro'); // 'registro' | 'registradas'

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

        {/* Barra de Pestañas / Tabs */}
        <div className="border-b border-outline-variant/60 flex items-center justify-between overflow-x-auto custom-scrollbar">
          <nav className="flex items-center gap-1.5 sm:gap-2 -mb-px min-w-max" aria-label="Pestañas de lecturas">
            {/* Tab 1: Registro de Lecturas */}
            <button
              type="button"
              onClick={() => setActiveTab('registro')}
              className={`group relative flex items-center gap-2.5 px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer select-none rounded-t-xl border-t-2 border-x ${
                activeTab === 'registro'
                  ? 'bg-surface text-primary border-t-primary border-x-outline-variant/60 shadow-[0_-2px_6px_rgba(0,0,0,0.03)] z-10'
                  : 'bg-surface-container-low/70 text-on-surface-variant hover:text-on-surface hover:bg-surface-container border-transparent'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] transition-colors ${
                activeTab === 'registro' ? 'text-primary' : 'text-on-surface-variant/70 group-hover:text-on-surface'
              }`} translate="no">
                electric_meter
              </span>
              <span>Registro de Lecturas</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold font-data-mono transition-colors ${
                activeTab === 'registro'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container-high text-on-surface-variant group-hover:bg-surface-container-highest'
              }`}>
                {totalMedidores}
              </span>
              {/* Oculta la línea inferior para fusionar con el fondo */}
              {activeTab === 'registro' && (
                <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-surface" />
              )}
            </button>

            {/* Tab 2: Lecturas Registradas */}
            <button
              type="button"
              onClick={() => setActiveTab('registradas')}
              className={`group relative flex items-center gap-2.5 px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer select-none rounded-t-xl border-t-2 border-x ${
                activeTab === 'registradas'
                  ? 'bg-surface text-primary border-t-primary border-x-outline-variant/60 shadow-[0_-2px_6px_rgba(0,0,0,0.03)] z-10'
                  : 'bg-surface-container-low/70 text-on-surface-variant hover:text-on-surface hover:bg-surface-container border-transparent'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] transition-colors ${
                activeTab === 'registradas' ? 'text-primary' : 'text-on-surface-variant/70 group-hover:text-on-surface'
              }`} translate="no">
                fact_check
              </span>
              <span>Lecturas Registradas</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold font-data-mono transition-colors ${
                activeTab === 'registradas'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'bg-surface-container-high text-on-surface-variant group-hover:bg-surface-container-highest'
              }`}>
                {totalRegistrados}
              </span>
              {/* Oculta la línea inferior para fusionar con el fondo */}
              {activeTab === 'registradas' && (
                <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-surface" />
              )}
            </button>
          </nav>
        </div>

        {/* Tab 1: Padrón y Registro de Lecturas */}
        {activeTab === 'registro' && (
          <div className="w-full animate-in fade-in duration-200">
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
        )}

        {/* Tab 2: Lecturas Registradas del Periodo */}
        {activeTab === 'registradas' && (
          <div className="w-full animate-in fade-in duration-200">
            <RegisteredReadingsTab
              activePeriodo={activePeriodo}
              lecturasPeriodoActivo={lecturasPeriodoActivo}
              medidorMap={medidorMap}
              onRowClick={(record) => setSelectedDetailRecord(record)}
              onEdit={handleEditFromTable}
            />
          </div>
        )}
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
