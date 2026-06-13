import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

/**
 * Only store what the UI actually needs.
 * Strips server-only fields like timestamps, deleted_at, saldo_a_favor, etc.
 */
const pickUser = (raw) => {
  if (!raw) return {};
  const picked = {
    id:                   raw.id,
    rol_id:               raw.rol_id,
    nombre_rol:           raw.nombre_rol,
    nombre_razonsocial:   raw.nombre_razonsocial,
    cargo_representante:  raw.cargo_representante,
    correo:               raw.correo,
    telefono:             raw.telefono,
    documento_identidad:  raw.documento_identidad,
    es_activo:            raw.es_activo,
  };
  // Solo agregar rutas y permisos si el servidor realmente los envió
  if (raw.rutas) picked.rutas = raw.rutas;
  if (raw.permisos) picked.permisos = raw.permisos;
  return picked;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('luz_user');
    localStorage.removeItem('luz_token');
  }, []);

  /**
   * On mount:
   * 1. Optimistically restore session from localStorage (instant, no flicker).
   * 2. Silently validate with /auth/me in the background.
   *    - If the server returns 401 → token expired, clear session.
   *    - If the server returns 404 or any network error → keep session as-is
   *      (the endpoint might not exist yet, or the user is offline).
   */
  useEffect(() => {
    const savedToken = localStorage.getItem('luz_token');
    const savedUser  = localStorage.getItem('luz_user');

    // Nothing saved — not logged in
    if (!savedToken || !savedUser) {
      setIsLoading(false);
      return;
    }

    // Step 1: restore immediately so the UI doesn't flash the login page
    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    } catch {
      // localStorage was corrupted — clear and force re-login
      clearSession();
      setIsLoading(false);
      return;
    }

    // Step 2: background validation (optional — only invalidates on 401)
    api.get('/auth/me')
      .then((res) => {
        const data = res.data;
        const freshUser = pickUser(data.usuario || data);
        if (data.rutas) freshUser.rutas = data.rutas;
        if (data.permisos) freshUser.permisos = data.permisos;
        
        setUser((prev) => {
          const mergedUser = { ...prev, ...freshUser };
          localStorage.setItem('luz_user', JSON.stringify(mergedUser));
          return mergedUser;
        });
      })
      .catch((error) => {
        if (error?.response?.status === 401) {
          clearSession();
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [clearSession]);

  const login = async (documento_identidad, clave_acceso) => {
    const response = await api.post('/auth/login', {
      documento_identidad,
      clave_acceso,
    });

    const data = response.data;
    const minimalUser = pickUser(data.usuario || data);
    if (data.rutas) minimalUser.rutas = data.rutas;
    if (data.permisos) minimalUser.permisos = data.permisos;

    setUser(minimalUser);
    setIsAuthenticated(true);

    localStorage.setItem('luz_user', JSON.stringify(minimalUser));
    localStorage.setItem('luz_token', data.token);

    return { success: true };
  };

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
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
