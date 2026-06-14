import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const YearContext = createContext();

export const YearProvider = ({ children }) => {
  const currentYear = new Date().getFullYear();
  const [activeYear, setActiveYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState([currentYear]);

  // Fetch all periods to extract unique years that have data
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await api.get('/periodos');
        const years = res.data.map(p => {
          const parts = p.mes_anio.split('-');
          return parseInt(parts[0].length === 4 ? parts[0] : parts[1], 10);
        }).filter(y => !isNaN(y));
        
        const uniqueYears = [...new Set([currentYear, ...years])].sort((a, b) => a - b);
        setAvailableYears(uniqueYears);
      } catch (error) {
        console.error("Error al cargar años de los periodos", error);
      }
    };
    fetchYears();
  }, []);

  // Function to manually add a year to the list (so it can be selected and populated)
  const addYear = (year) => {
    const parsedYear = parseInt(year, 10);
    if (!isNaN(parsedYear) && !availableYears.includes(parsedYear)) {
      setAvailableYears(prev => [...prev, parsedYear].sort((a, b) => a - b));
    }
    setActiveYear(parsedYear);
  };

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
