import React from 'react';

export const BadgeType = React.memo(({ tipo }) => {
  const isHoraPunta = tipo === 'Hora Punta' || tipo === 'Tiempo Real';
  const displayTipo = isHoraPunta ? 'Hora Punta' : (tipo === 'Normal' ? 'Fuera Punta' : (tipo || 'Fuera Punta'));
  return (
    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${isHoraPunta ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
      {displayTipo}
    </span>
  );
});
