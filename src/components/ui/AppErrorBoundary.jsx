import React from 'react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Error no controlado en la interfaz', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-[100dvh] bg-background flex items-center justify-center p-6">
        <section className="w-full max-w-md bg-surface border border-outline-variant rounded-2xl shadow-lg p-6 text-center">
          <span className="material-symbols-outlined text-error text-5xl" aria-hidden="true">
            error
          </span>
          <h1 className="mt-3 text-xl font-bold text-on-surface">No pudimos mostrar esta pantalla</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Ocurrió un error inesperado. Recarga la aplicación para volver a intentarlo.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg"
          >
            Recargar aplicación
          </button>
        </section>
      </main>
    );
  }
}

export default AppErrorBoundary;
