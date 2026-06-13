import React from 'react';

export const EmptyStateIcon = React.memo(({ icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6 text-on-surface-variant border border-dashed border-outline-variant rounded-xl m-4 bg-surface">
    <span className="material-symbols-outlined text-[32px] sm:text-[48px] opacity-20 mb-2 sm:mb-4">{icon}</span>
    <p className="text-sm sm:text-base font-bold">{title}</p>
    {subtitle && <p className="text-xs sm:text-sm mt-1">{subtitle}</p>}
  </div>
));
