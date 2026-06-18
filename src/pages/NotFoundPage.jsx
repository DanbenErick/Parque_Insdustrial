import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 bg-background min-h-[60vh]">
      <div
        className="flex flex-col items-center text-center max-w-md"
      >
        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-surface-container-low border border-outline-variant flex items-center justify-center mb-6 shadow-inner">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-50">
            travel_explore
          </span>
        </div>

        {/* Code */}
        <span className="font-data-mono text-6xl font-black text-primary/20 leading-none mb-2">
          404
        </span>

        <h1 className="text-2xl font-bold text-on-surface mb-2">Página no encontrada</h1>
        <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
          La ruta que estás buscando no existe o fue movida.
          Verifica la URL o regresa al inicio.
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          Volver al Inicio
        </button>
      </div>
    </main>
  );
};

export default NotFoundPage;
