import React, { createContext, useContext, useState } from 'react';

const YearContext = createContext();

export const YearProvider = ({ children }) => {
  // Initialize with current year
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());

  return (
    <YearContext.Provider value={{ activeYear, setActiveYear }}>
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
