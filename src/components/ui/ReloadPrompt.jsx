import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-surface border border-outline-variant rounded-xl shadow-lg p-4 animate-in slide-in-from-bottom-5 max-w-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined">system_update</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-on-surface">
              {offlineReady ? 'Aplicación lista' : 'Actualización disponible'}
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              {offlineReady
                ? 'La aplicación se ha instalado y está lista para trabajar sin conexión.'
                : 'Hay una nueva versión disponible. Por favor, actualiza para ver los cambios.'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-2 mt-2">
          <button
            onClick={close}
            className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-variant rounded-md transition-colors"
          >
            Cerrar
          </button>
          {needRefresh && (
            <button
              onClick={() => updateServiceWorker(true)}
              className="px-3 py-1.5 text-xs font-bold bg-primary text-on-primary hover:bg-primary/90 rounded-md transition-colors shadow-sm"
            >
              Actualizar Ahora
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
