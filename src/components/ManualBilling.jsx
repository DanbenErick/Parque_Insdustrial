import React, { useState } from 'react';

const ManualBilling = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [currentReading, setCurrentReading] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Dummy history for the session
  const [history, setHistory] = useState([
    { id: 1, name: 'Logística del Pacífico S.A.', serial: 'ENG-2023-45B2', previous: 45120.50, current: 46365.50, time: '10:45 AM' },
    { id: 2, name: 'Textiles del Sur S.A.C.', serial: 'ENG-2022-99D1', previous: 12050.00, current: 12890.00, time: '10:42 AM' }
  ]);

  // Dummy database
  const database = [
    { id: 'M-001', name: 'Aceros Industriales S.A.C.', ruc: '20123456789', manzana: 'Manzana B-05', serial: 'ENG-2024-88A1', previousReading: 12840.10 },
    { id: 'M-002', name: 'Inversiones Textiles EIRL', ruc: '10456789123', manzana: 'Manzana C-01', serial: 'ENG-2022-11C9', previousReading: 8520.00 },
    { id: 'M-003', name: 'Agroexportaciones Jicamarca', ruc: '20999888777', manzana: 'Manzana A-02', serial: 'ENG-2021-33X4', previousReading: 5400.50 },
    { id: 'M-004', name: 'Alimentos Lima SAC', ruc: '20111222333', manzana: 'Manzana A-01', serial: 'ENG-2023-55T2', previousReading: 9100.00 },
    { id: 'M-005', name: 'Metalmecánica Perú', ruc: '20444555666', manzana: 'Manzana B-01', serial: 'ENG-2020-12R9', previousReading: 21400.20 },
  ];

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setSelectedMember(null); // Clear selection if user starts typing again
    
    if (term.trim().length > 0) {
      const results = database.filter(m => 
        m.name.toLowerCase().includes(term.toLowerCase()) || 
        m.ruc.includes(term) || 
        m.serial.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setSearchTerm(member.name); // Set the input to the selected member's name
    setSearchResults([]); // Hide the dropdown list
    setCurrentReading(''); // Reset the input field
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!currentReading) return;

    setIsSaving(true);
    
    // Simulate network delay
    setTimeout(() => {
      setHistory(prev => [{
        id: Date.now(),
        name: selectedMember.name,
        serial: selectedMember.serial,
        previous: selectedMember.previousReading,
        current: parseFloat(currentReading),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }, ...prev]);
      
      setIsSaving(false);
      setSelectedMember(null);
      setSearchTerm('');
      setCurrentReading('');
    }, 800);
  };

  return (
    <main className="p-4 md:p-xl space-y-4 md:space-y-lg max-w-[1600px] mx-auto w-full flex-grow relative flex flex-col h-full">
        <div className="max-w-4xl mx-auto space-y-lg">
          
          <div className="mb-md flex flex-col md:flex-row justify-between md:items-end gap-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold">Registro de Lectura</h2>
              <p className="font-body-md text-on-surface-variant">Busca el medidor e ingresa el consumo actual.</p>
            </div>
            {/* KPI Cards to fill space */}
            <div className="flex gap-md">
              <div className="bg-surface border border-outline-variant rounded-xl p-md flex items-center gap-md shadow-sm min-w-[200px]">
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                        <circle className="text-outline-variant" strokeWidth="4" stroke="currentColor" fill="transparent" r="20" cx="24" cy="24" />
                        <circle className="text-primary" strokeWidth="4" strokeDasharray="125" strokeDashoffset="48" stroke="currentColor" fill="transparent" r="20" cx="24" cy="24" />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-on-surface">61%</span>
                </div>
                <div>
                  <p className="font-label-caps text-[10px] text-secondary uppercase tracking-wider">Avance</p>
                  <p className="font-data-mono text-headline-sm text-on-surface font-bold">214 <span className="text-sm font-normal text-on-surface-variant">/ 350</span></p>
                </div>
              </div>
              <div className="bg-error/5 border border-error/20 rounded-xl p-md flex items-center gap-md shadow-sm min-w-[160px]">
                <span className="material-symbols-outlined text-error text-[32px]">warning</span>
                <div>
                  <p className="font-label-caps text-[10px] text-error uppercase tracking-wider">Pendientes</p>
                  <p className="font-data-mono text-headline-sm text-error font-bold">136</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
            
            {/* Left Column: Search & Form */}
            <div className="lg:col-span-7 space-y-lg">
              {/* 1. Panel de Búsqueda */}
              <div className="bg-surface border border-outline-variant rounded-xl shadow-sm p-md md:p-lg relative z-30">
                <label className="font-label-caps text-[11px] text-secondary uppercase tracking-widest block mb-xs">Búsqueda Rápida</label>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-[28px]">search</span>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Ej. Nombre, RUC, o Serie (ENG-...)" 
                        className="w-full bg-surface-container-lowest border-2 border-primary/20 rounded-xl pl-14 pr-4 py-4 text-lg font-bold text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner"
                    />
                </div>
                
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && !selectedMember && (
                  <div className="absolute left-0 right-0 mt-2 mx-md md:mx-lg bg-surface border-2 border-primary rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto animate-in slide-in-from-top-2 fade-in">
                    <ul className="divide-y divide-outline-variant">
                      {searchResults.map((member) => (
                        <li 
                          key={member.id} 
                          onClick={() => handleSelectMember(member)}
                          className="p-md hover:bg-primary/10 cursor-pointer transition-colors flex justify-between items-center group"
                        >
                          <div>
                            <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{member.name}</p>
                            <p className="text-xs text-on-surface-variant mt-1">
                              RUC: <span className="font-data-mono">{member.ruc}</span> | {member.manzana}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="bg-surface-container-low px-2 py-1 rounded border border-outline-variant text-[11px] font-data-mono text-on-surface-variant">
                              {member.serial}
                            </span>
                            <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-2 align-middle">
                              chevron_right
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {searchTerm.length > 0 && searchResults.length === 0 && !selectedMember && (
                  <div className="absolute left-0 right-0 mt-2 mx-md md:mx-lg bg-surface border border-outline-variant rounded-xl shadow-lg p-md text-center text-on-surface-variant animate-in fade-in">
                    No se encontraron medidores o inquilinos que coincidan.
                  </div>
                )}
              </div>

              {/* 2. Formulario de Ingreso */}
              {selectedMember ? (
                <div className="bg-primary/5 border-2 border-primary rounded-xl shadow-lg p-md md:p-lg animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-primary/20 pb-md mb-md gap-sm">
                    <div>
                      <h3 className="font-headline-sm font-bold text-on-surface">{selectedMember.name}</h3>
                      <p className="text-sm text-on-surface-variant mt-1">RUC: <span className="font-data-mono">{selectedMember.ruc}</span> | Ubicación: <span className="font-bold">{selectedMember.manzana}</span></p>
                    </div>
                    <div className="bg-white px-md py-sm rounded-lg border border-primary/30 flex items-center gap-2 shadow-sm">
                      <span className="material-symbols-outlined text-primary">electric_meter</span>
                      <span className="font-data-mono font-bold text-sm text-primary">{selectedMember.serial}</span>
                    </div>
                  </div>

                  <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-lg items-end">
                    <div className="bg-surface-container-low rounded-xl p-md border border-outline-variant flex flex-col justify-center">
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Lectura Mes Anterior</span>
                      <span className="font-data-mono text-[24px] text-on-surface opacity-70">{selectedMember.previousReading.toLocaleString('en-US', {minimumFractionDigits: 2})} <span className="text-sm">Watts</span></span>
                    </div>

                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Lectura Mes Actual (Ingresar Watts)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.01"
                          required
                          autoFocus
                          value={currentReading}
                          onChange={(e) => setCurrentReading(e.target.value)}
                          placeholder="0.00" 
                          className="w-full bg-white border-2 border-primary rounded-xl pl-4 pr-20 py-4 text-[28px] font-data-mono font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/20 text-right shadow-inner"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">Watts</span>
                      </div>
                    </div>

                    <div className="md:col-span-2 mt-sm">
                      <button 
                        type="submit" 
                        disabled={isSaving || !currentReading}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-sm transition-all shadow-md ${currentReading ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'}`}
                      >
                        {isSaving ? (
                          <>
                            <span className="material-symbols-outlined animate-spin">sync</span>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined">save</span>
                            Guardar Lectura
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center text-center animate-in fade-in h-[320px]">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-md">
                    <span className="material-symbols-outlined text-[48px] text-primary">barcode_scanner</span>
                  </div>
                  <h3 className="font-headline-sm text-on-surface font-bold">Esperando Búsqueda...</h3>
                  <p className="text-sm text-on-surface-variant mt-2 max-w-sm">
                    Utiliza el buscador de arriba para encontrar un inquilino o medidor. El formulario de registro aparecerá aquí.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: History */}
            <div className="lg:col-span-5 h-full">
              <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
                <div className="px-md py-sm bg-surface-container-low border-b border-outline-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">history</span>
                  <h4 className="font-bold text-sm text-on-surface-variant">Últimas lecturas registradas (Esta sesión)</h4>
                </div>
                <div className="overflow-x-auto flex-grow">
                  <table className="w-full text-left table-auto">
                    <thead>
                      <tr className="bg-surface-container-lowest text-on-surface-variant border-b border-outline-variant text-[10px] uppercase tracking-wider">
                        <th className="px-md py-2">Hora</th>
                        <th className="px-md py-2">Medidor</th>
                        <th className="px-md py-2 text-right text-primary font-bold">Registro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant text-sm">
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="px-md py-xl text-center text-on-surface-variant italic">
                            No hay registros guardados en esta sesión.
                          </td>
                        </tr>
                      ) : (
                        history.map((record) => (
                          <tr key={record.id} className="hover:bg-surface-container-lowest transition-colors">
                            <td className="px-md py-3 text-xs text-on-surface-variant whitespace-nowrap">{record.time}</td>
                            <td className="px-md py-3">
                              <p className="font-bold text-on-surface text-xs truncate max-w-[120px]">{record.name}</p>
                              <p className="text-[10px] text-on-surface-variant font-data-mono">{record.serial}</p>
                            </td>
                            <td className="px-md py-3 text-right font-data-mono font-bold text-primary text-sm">
                              {record.current.toLocaleString('en-US')} W
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

        </div>
    </main>
  );
};

export default ManualBilling;
