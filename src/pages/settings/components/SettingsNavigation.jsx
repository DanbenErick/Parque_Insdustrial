const SETTINGS_TABS = [
  { id: 'profile', icon: 'person', label: 'Perfil de Usuario' },
  { id: 'notifications', icon: 'notifications_active', label: 'Notificaciones' },
  { id: 'periodos', icon: 'calendar_month', label: 'Periodos de Facturación' },
  { id: 'tarifas', icon: 'request_quote', label: 'Tarifas y Cobros' }
];

const SettingsButton = ({ activeTab, id, icon, label, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(id)}
    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-left text-xs ${activeTab === id ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
  >
    <span className="material-symbols-outlined text-[16px]" translate="no">{icon}</span>
    {label}
  </button>
);

const SettingsNavigation = ({ activeTab, onSelect }) => (
  <nav className="w-full md:w-72 space-y-1" aria-label="Secciones de configuración">
    {SETTINGS_TABS.map((tab) => (
      <SettingsButton key={tab.id} {...tab} activeTab={activeTab} onSelect={onSelect} />
    ))}

    <div className="my-2 border-t border-outline-variant/30" />
    <p className="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-widest px-3 mb-1">Herramientas</p>
    <SettingsButton
      activeTab={activeTab}
      id="herramientas"
      icon="build"
      label="Importar Datos"
      onSelect={onSelect}
    />
  </nav>
);

export default SettingsNavigation;
