import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosConfig';

const TopBar = ({ screens }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState([]);

  // Fetch real alerts from the API
  const { data: alerts = [] } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: () => api.get('/dashboard/alerts').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const hasAlerts = alerts.length > 0;

  const handleGlobalSearch = useCallback(
    (e) => {
      const term = e.target.value;
      setGlobalSearchTerm(term);

      if (term.trim().length > 1) {
        const results = screens.filter(
          (screen) =>
            screen.name.toLowerCase().includes(term.toLowerCase()) ||
            screen.keywords.some((k) => k.includes(term.toLowerCase())),
        );
        setGlobalSearchResults(results);
      } else {
        setGlobalSearchResults([]);
      }
    },
    [screens],
  );

  const handleNavClick = useCallback(
    (view) => {
      navigate(`/${view}`);
      setGlobalSearchTerm('');
      setGlobalSearchResults([]);
    },
    [navigate],
  );

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md hidden md:flex justify-between items-center w-full px-lg h-16 border-b border-outline-variant print:hidden">
      <div className="flex items-center gap-lg">
        <div className="relative hidden lg:block">
          <input
            type="text"
            value={globalSearchTerm}
            onChange={handleGlobalSearch}
            placeholder="Buscar pantallas..."
            className="bg-surface-container border border-outline-variant rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:border-primary outline-none focus:w-80 transition-all"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>

          {/* Search Results Dropdown */}
          {globalSearchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-surface border border-outline-variant rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
              <ul className="divide-y divide-outline-variant">
                {globalSearchResults.map((screen) => (
                  <li
                    key={screen.view}
                    onClick={() => handleNavClick(screen.view)}
                    className="px-4 py-3 hover:bg-surface-container cursor-pointer flex items-center gap-3 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[18px]">{screen.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">{screen.name}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Pantalla del Sistema</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-md relative">
        {/* Notifications button — badge only shows when there are real alerts */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 hover:bg-surface-container rounded-full transition-colors"
          aria-label={`Notificaciones${hasAlerts ? ` (${alerts.length})` : ''}`}
        >
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          {hasAlerts && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse" />
          )}
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-low transition-colors rounded-full text-on-surface-variant"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="absolute top-12 right-0 w-80 bg-surface border border-outline-variant rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-headline-sm font-bold text-on-surface">
                Notificaciones {hasAlerts && <span className="text-xs font-normal text-on-surface-variant">({alerts.length})</span>}
              </h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-on-surface-variant hover:text-on-surface"
                aria-label="Cerrar notificaciones"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="p-8 flex flex-col items-center gap-2 text-on-surface-variant opacity-60">
                  <span className="material-symbols-outlined text-[32px]">notifications_off</span>
                  <p className="text-sm font-medium">Sin notificaciones</p>
                </div>
              ) : (
                alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="p-md border-b border-outline-variant/50 hover:bg-surface-container-lowest transition-colors cursor-pointer"
                  >
                    <div className="flex gap-sm">
                      <span className={`material-symbols-outlined ${alert.tipo === 'error' ? 'text-error' : alert.tipo === 'success' ? 'text-secondary' : 'text-primary'}`}>
                        {alert.icono || 'info'}
                      </span>
                      <div>
                        <p className="font-body-sm font-bold text-on-surface">{alert.titulo}</p>
                        <p className="text-xs text-on-surface-variant mt-1">{alert.mensaje}</p>
                        {alert.tiempo && (
                          <span className="text-[10px] text-on-surface-variant mt-2 block">{alert.tiempo}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {alerts.length > 0 && (
              <div className="p-sm text-center border-t border-outline-variant bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
                <span className="text-xs font-bold text-primary">Marcar todas como leídas</span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
