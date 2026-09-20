const NOTIFICATION_OPTIONS = [
  { key: 'pagos', title: 'Vencimiento de Pagos', description: 'Mostrar alertas cuando un socio tenga retraso.' },
  { key: 'facturas', title: 'Generación de Facturas Exitosas', description: 'Alerta al culminar el procesamiento masivo a fin de mes.' },
  { key: 'socios', title: 'Nuevos Socios Registrados', description: 'Notificar cuando un operador registre una nueva empresa.' },
  { key: 'reportes', title: 'Reporte Semanal Automatizado', description: 'Mostrar un resumen estadístico de consumos en el panel.' }
];

const NotificationsSettingsTab = ({ notifications, onToggle }) => (
  <div className="animate-in fade-in space-y-4">
    <div>
      <h3 className="text-base font-bold text-on-surface mb-1">Avisos y Notificaciones</h3>
      <p className="text-[11px] text-on-surface-variant mb-4">Elige qué alertas deseas recibir localmente en la plataforma.</p>
    </div>

    <div className="space-y-0 divide-y divide-outline-variant border border-outline-variant rounded-md">
      {NOTIFICATION_OPTIONS.map(({ key, title, description }) => (
        <button
          key={key}
          type="button"
          role="switch"
          aria-checked={notifications[key]}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface-container-lowest focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => onToggle(key)}
        >
          <span>
            <span className="block font-bold text-on-surface text-[11px]">{title}</span>
            <span className="block text-[10px] text-on-surface-variant mt-0.5">{description}</span>
          </span>
          <span aria-hidden="true" className={`w-8 h-4 rounded-full relative shrink-0 shadow-inner transition-colors ${notifications[key] ? 'bg-primary' : 'bg-surface-container-high'}`}>
            <span className={`w-3 h-3 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${notifications[key] ? 'right-0.5' : 'left-0.5'}`} />
          </span>
        </button>
      ))}
    </div>
  </div>
);

export default NotificationsSettingsTab;
