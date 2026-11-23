import React from 'react';

const CHUNK_ERROR_PATTERNS = [
  /chunkloaderror/i,
  /loading chunk .+ failed/i,
  /failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /importing a module script failed/i,
];

const isStaleChunkError = (error) => {
  const message = String(error?.message || error || '');
  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message));
};

const clearAppAssetCaches = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) await registration.unregister();
  }

  if ('caches' in window) {
    const cacheNames = await window.caches.keys();
    const appCacheNames = cacheNames.filter((name) => (
      name.startsWith('workbox-') || name.includes('precache')
    ));
    await Promise.all(appCacheNames.map((name) => window.caches.delete(name)));
  }
};

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, isRecovering: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Error no controlado en la interfaz', error, info);
    try {
      sessionStorage.setItem('last-ui-error', JSON.stringify({
        message: error?.message || String(error),
        path: window.location.pathname,
        occurredAt: new Date().toISOString(),
        componentStack: info?.componentStack || '',
      }));
    } catch {
      // El diagnóstico no debe bloquear la recuperación de la interfaz.
    }
  }

  handleReload = async () => {
    const staleChunk = isStaleChunkError(this.state.error);
    this.setState({ isRecovering: true });

    try {
      if (staleChunk) await clearAppAssetCaches();
    } catch (error) {
      console.warn('No se pudo limpiar por completo el caché de la aplicación', error);
    } finally {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const staleChunk = isStaleChunkError(this.state.error);

    return (
      <main className="min-h-[100dvh] bg-background flex items-center justify-center p-6">
        <section className="w-full max-w-md bg-surface border border-outline-variant rounded-2xl shadow-lg p-6 text-center">
          <span className="material-symbols-outlined text-error text-5xl" aria-hidden="true">
            error
          </span>
          <h1 className="mt-3 text-xl font-bold text-on-surface">No pudimos mostrar esta pantalla</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            {staleChunk
              ? 'Hay una versión nueva de la aplicación. Actualiza para cargarla correctamente.'
              : 'Ocurrió un error inesperado. Recarga la aplicación para volver a intentarlo.'}
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            disabled={this.state.isRecovering}
            className="mt-5 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg disabled:opacity-60"
          >
            {this.state.isRecovering
              ? 'Actualizando...'
              : staleChunk ? 'Actualizar aplicación' : 'Recargar aplicación'}
          </button>
        </section>
      </main>
    );
  }
}

export default AppErrorBoundary;
