const count = (value) => Number(value || 0).toLocaleString('es-PE');

const ReadingProgress = ({ lecturasPeriodo }) => {
  const realizadas = Number(lecturasPeriodo?.realizadas || 0);
  const total = Number(lecturasPeriodo?.total || 0);
  const percent = total > 0 ? Math.min(100, Math.round(realizadas / total * 100)) : 0;

  return (
    <section className="bg-white border border-outline-variant rounded-xl p-md shadow-sm min-w-0" aria-label="Progreso de lectura del período">
      <h3 className="font-bold text-on-surface flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">speed</span>
        Progreso de lectura del período
      </h3>
      <p className="font-data-mono text-xl font-bold text-on-surface">
        {count(realizadas)} <span className="text-sm text-on-surface-variant">de {count(total)} medidores</span>
      </p>
      <div className="h-3 rounded-full bg-surface-container mt-3 overflow-hidden" role="progressbar"
        aria-label="Medidores leídos en el período" aria-valuenow={realizadas}
        aria-valuemin={0} aria-valuemax={total || 1}>
        <div className="h-full bg-primary rounded-full" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-xs text-on-surface-variant mt-2">{percent} % de medidores operativos con lectura registrada en este período.</p>
    </section>
  );
};

export default ReadingProgress;
