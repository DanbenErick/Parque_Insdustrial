import React from 'react';
import { SearchResultRow } from './shared/SearchResultRow';

export const SearchPanel = ({
  searchTerm,
  handleSearchChange,
  isSearchFocused,
  setIsSearchFocused,
  currentSearchResults,
  selectedMember,
  handleSelectMember
}) => {
  return (
    <div className="relative z-30">
      <div className="relative flex items-center bg-surface border border-outline-variant hover:border-primary/40 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 rounded-xl shadow-sm transition-all h-[52px]">
        <div className="pl-4 pr-3 text-primary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          placeholder="Busca por Nombre, RUC, o Serie de medidor..."
          className="w-full bg-transparent border-none text-sm font-bold text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-0 h-full"
        />
        <div className="pr-4 hidden md:flex items-center shrink-0">
          <span className="text-[10px] font-bold text-primary/60 bg-primary/5 px-2 py-1 rounded-md border border-primary/10 uppercase tracking-wider">Búsqueda</span>
        </div>
      </div>

      {/* Resultados */}
      {isSearchFocused && currentSearchResults.length > 0 && !selectedMember && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-primary/20 rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto animate-in slide-in-from-top-2 fade-in z-50">
          <ul className="p-1.5 space-y-1">
            {currentSearchResults.map(m => <SearchResultRow key={m.id} member={m} onSelect={handleSelectMember} />)}
          </ul>
        </div>
      )}

      {/* Empty State */}
      {searchTerm.length > 0 && currentSearchResults.length === 0 && !selectedMember && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-outline-variant/50 rounded-xl shadow-lg p-4 text-center animate-in fade-in z-50 flex flex-col items-center">
          <span className="material-symbols-outlined text-[24px] text-on-surface-variant/30 mb-1">search_off</span>
          <p className="text-sm text-on-surface-variant">No se encontraron medidores o socios que coincidan.</p>
        </div>
      )}
    </div>
  );
};
