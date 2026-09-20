const ImportCard = ({ icon, title, description, buttonLabel, onClick, primary = false }) => (
  <div className="bg-surface border border-outline-variant rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors flex flex-col">
    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
    <div className="flex flex-col gap-4 flex-grow ml-2">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
        <span className="material-symbols-outlined text-[24px]" translate="no">{icon}</span>
      </div>
      <div>
        <h4 className="font-bold text-on-surface text-sm mb-1">{title}</h4>
        <p className="text-xs text-on-surface-variant leading-relaxed">{description}</p>
      </div>
    </div>
    <div className="mt-5 ml-2">
      <button
        type="button"
        onClick={onClick}
        className={`w-full px-5 py-2.5 font-bold text-xs rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${primary ? 'bg-primary text-on-primary shadow-primary/20' : 'bg-surface-container-highest text-on-surface hover:text-primary hover:border-primary border border-outline-variant'}`}
      >
        <span className="material-symbols-outlined text-[16px]" translate="no">upload_file</span>
        {buttonLabel}
      </button>
    </div>
  </div>
);

const ImportToolsTab = ({ onOpenTenantImport, onOpenBillingImport }) => (
  <div className="animate-in fade-in space-y-6">
    <div>
      <h3 className="text-base font-bold text-on-surface mb-1">Herramientas de Importación</h3>
      <p className="text-[11px] text-on-surface-variant mb-6">Carga datos históricos o masivos desde archivos Excel.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ImportCard
        icon="group_add"
        title="Importar Socios Masivamente"
        description="Sube un Excel para registrar múltiples socios o inquilinos de una sola vez, junto con sus respectivos medidores si los tuvieran."
        buttonLabel="Abrir Importador de Socios"
        onClick={onOpenTenantImport}
      />
      <ImportCard
        icon="database_upload"
        title="Importar Facturación Masiva"
        description="Herramienta integral para subir lecturas, generar recibos automáticamente y registrar pagos desde un solo archivo Excel."
        buttonLabel="Abrir Importador de Facturación"
        onClick={onOpenBillingImport}
        primary
      />
    </div>
  </div>
);

export default ImportToolsTab;
