import React from 'react';
import { SearchResultRow } from './shared/SearchResultRow';

export const SearchPanel = ({
  searchTerm,
  handleSearchChange,
  isSearchFocused,
  setIsSearchFocused,
  currentSearchResults,
  selectedMember,
  handleSelectMember,
  isSearching,
  lecturasPeriodoActivoMap
}) => {
  return (
    <div className="relative z-30">
      <div className="relative flex items-center bg-white/70 backdrop-blur-xl border-2 border-outline-variant/60 hover:border-primary/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20 rounded-2xl shadow-lg transition-all duration-300 h-[60px] group">
        <div className="pl-5 pr-3 text-primary flex items-center justify-center shrink-0 group-focus-within:scale-110 transition-transform">
          {isSearching ? (
            <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-[24px]">search</span>
          )}
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          placeholder="Busca por Nombre, RUC, o Serie de medidor..."
          className="w-full bg-transparent border-none text-base font-medium text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0 h-full"
        />
        <div className="pr-5 hidden md:flex items-center shrink-0">
          <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 uppercase tracking-widest shadow-sm">Búsqueda rápida</span>
        </div>
      </div>

      {/* Resultados */}
      {isSearchFocused && currentSearchResults.length > 0 && !selectedMember && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white/90 backdrop-blur-2xl border border-primary/20 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden max-h-80 overflow-y-auto animate-in slide-in-from-top-3 fade-in z-50">
          <ul className="p-1.5 space-y-1">
            {currentSearchResults.map(m => (
              <SearchResultRow 
                key={m.id} 
                member={m} 
                onSelect={handleSelectMember} 
                isLecturado={lecturasPeriodoActivoMap?.has(m.num_serie)}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Empty State */}
      {searchTerm.length > 0 && currentSearchResults.length === 0 && !selectedMember && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-outline-variant/50 rounded-xl shadow-lg p-4 text-center animate-in fade-in z-50 flex flex-col items-center">
          <span className="material-symbols-outlined text-[24px] text-on-surface-variant/30 mb-1">search_off</span>
          <p className="text-sm text-on-surface-variant">No se encontraron medidores o socios que coincidan.</p>
        </div>
      )}
    </div>
  );
};
