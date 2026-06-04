import React, { createContext, useContext, useState, useEffect } from 'react';

import api from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('luz_user');
    const savedToken = localStorage.getItem('luz_token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (documento_identidad, clave_acceso) => {
    try {
      const response = await api.post('/auth/login', {
        documento_identidad,
        clave_acceso
      });

      const data = response.data;

      // Guardar en el estado
      setUser(data.usuario);
      setToken(data.token);
      setIsAuthenticated(true);

      // Persistir sesión
      localStorage.setItem('luz_user', JSON.stringify(data.usuario));
      localStorage.setItem('luz_token', data.token);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('luz_user');
    localStorage.removeItem('luz_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
