import React from 'react';

export const BadgeType = React.memo(({ tipo }) => {
  const isTR = tipo === 'Tiempo Real';
  return (
    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${isTR ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
      {tipo || 'Normal'}
    </span>
  );
});
