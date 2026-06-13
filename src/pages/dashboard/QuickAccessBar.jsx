import React from 'react';
import { useNavigate } from 'react-router-dom';

const QUICK_ACCESS_ITEMS = [
  {
    view: 'manual_billing',
    name: 'Registrar Lectura',
    icon: 'edit_document',
    color: 'bg-primary/10 text-primary border-primary/20',
    hover: 'hover:bg-primary hover:text-white hover:border-primary',
  },
  {
    view: 'billing',
    name: 'Facturación',
    icon: 'receipt_long',
    color: 'bg-[#107C41]/10 text-[#107C41] border-[#107C41]/20',
    hover: 'hover:bg-[#107C41] hover:text-white hover:border-[#107C41]',
  },
  {
    view: 'payments',
    name: 'Pagos Recibidos',
    icon: 'payments',
    color: 'bg-[#F57F17]/10 text-[#F57F17] border-[#F57F17]/20',
    hover: 'hover:bg-[#F57F17] hover:text-white hover:border-[#F57F17]',
  },
  {
    view: 'tenants',
    name: 'Directorio Socios',
    icon: 'factory',
    color: 'bg-secondary-container/50 text-on-secondary-container border-secondary-container',
    hover: 'hover:bg-secondary hover:text-on-secondary hover:border-secondary',
  },
];

const QuickAccessBar = React.memo(() => {
  const navigate = useNavigate();

  return (
    <div className="mt-2">
      <h2 className="text-[11px] text-on-surface-variant font-bold mb-2 uppercase tracking-wider">
        Accesos Rápidos
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_ACCESS_ITEMS.map(item => (
          <button
            key={item.view}
            onClick={() => navigate(`/${item.view}`)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors border shadow-sm group ${item.color} ${item.hover} bg-white`}
          >
            <span
              className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {item.icon}
            </span>
            <span className="font-bold text-xs leading-tight">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
});

QuickAccessBar.displayName = 'QuickAccessBar';

export default QuickAccessBar;
