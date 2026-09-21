import  { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { periodosQueryOptions } from '../api/queryOptions';
import { useAuth } from './AuthContext';

const YearContext = createContext();

export const YearProvider = ({ children }) => {
  const currentYear = new Date().getFullYear();
  const [activeYear, setActiveYear] = useState(currentYear);
  const [manualYears, setManualYears] = useState([]);
  const { user, isAuthenticated } = useAuth();

  const isSocio = Number(user?.rol_id) === 3;
  const { data: periodos = [] } = useQuery({
    ...periodosQueryOptions,
    enabled: isAuthenticated && !isSocio,
  });

  const availableYears = useMemo(() => {
    const periodYears = periodos.map((periodo) => {
      const parts = periodo.mes_anio?.split('-') || [];
      return parseInt(parts[0]?.length === 4 ? parts[0] : parts[1], 10);
    }).filter((year) => !Number.isNaN(year));

    return [...new Set([currentYear, ...manualYears, ...periodYears])].sort((a, b) => a - b);
  }, [currentYear, manualYears, periodos]);

  // Function to manually add a year to the list (so it can be selected and populated)
  const addYear = useCallback((year) => {
    const parsedYear = parseInt(year, 10);
    if (!Number.isNaN(parsedYear)) {
      setManualYears((current) => current.includes(parsedYear) ? current : [...current, parsedYear]);
      setActiveYear(parsedYear);
    }
  }, []);

  return (
    <YearContext.Provider value={{ activeYear, setActiveYear, availableYears, addYear }}>
      {children}
    </YearContext.Provider>
  );
};

export const useYear = () => {
  const context = useContext(YearContext);
  if (!context) {
    throw new Error('useYear must be used within a YearProvider');
  }
  return context;
};
