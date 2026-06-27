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
    lecturasPeriodoActivoMap,
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
    editJustificacion, setEditJustificacion,
    editLecturaFinalAntiguo, setEditLecturaFinalAntiguo,
    editLecturaInicialNuevo, setEditLecturaInicialNuevo,
    editLecturaFinalAntiguoPunta, setEditLecturaFinalAntiguoPunta,
    editLecturaInicialNuevoPunta, setEditLecturaInicialNuevoPunta,
    isSearching
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
              isSearching={isSearching}
              lecturasPeriodoActivoMap={lecturasPeriodoActivoMap}
            />

            {selectedMember ? (
                <RegistrationForm 
                selectedMember={selectedMember}
                lecturaExistente={lecturaExistente}
                activePeriodo={activePeriodo}
                currentReading={currentReading} setCurrentReading={setCurrentReading}
                currentReadingPunta={currentReadingPunta} setCurrentReadingPunta={setCurrentReadingPunta}
                factorPotencia={factorPotencia} setFactorPotencia={setFactorPotencia}
                isCambioMedidor={isCambioMedidor} setIsCambioMedidor={setIsCambioMedidor}
                lecturaFinalAntiguo={lecturaFinalAntiguo} setLecturaFinalAntiguo={setLecturaFinalAntiguo}
                lecturaInicialNuevo={lecturaInicialNuevo} setLecturaInicialNuevo={setLecturaInicialNuevo}
                lecturaFinalAntiguoPunta={lecturaFinalAntiguoPunta} setLecturaFinalAntiguoPunta={setLecturaFinalAntiguoPunta}
                lecturaInicialNuevoPunta={lecturaInicialNuevoPunta} setLecturaInicialNuevoPunta={setLecturaInicialNuevoPunta}
                isSaving={isSaving} handleSave={handleSave}
              />
            ) : (
              <div className="bg-white/60 backdrop-blur-2xl border-2 border-dashed border-outline-variant/60 rounded-3xl p-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 min-h-[350px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] group transition-all duration-500 hover:border-primary/40 hover:bg-white/80">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <span className="material-symbols-outlined text-[40px] text-primary drop-shadow-sm">barcode_scanner</span>
                </div>
                <h3 className="text-xl text-on-surface font-extrabold tracking-tight mb-2 group-hover:text-primary transition-colors">Listo para Registrar</h3>
                <p className="text-sm text-on-surface-variant/80 max-w-md font-medium leading-relaxed">
                  Utiliza la barra de búsqueda rápida superior para encontrar un medidor por nombre, documento o número de serie.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: History */}
          <div className="lg:col-span-5 h-full">
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
