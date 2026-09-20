const UserManagementHeader = ({ activeTab, onAdd, onTabChange }) => (
  <>
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
      <div><h1 className="text-2xl text-on-surface font-bold leading-tight">Modulo de Usuarios</h1><p className="text-sm text-on-surface-variant">Control de usuarios.</p></div>
      {activeTab === 'usuarios' && <button type="button" onClick={onAdd} className="flex items-center gap-1.5 bg-primary text-on-primary px-4 py-1.5 h-8 rounded-md font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all"><span className="material-symbols-outlined text-[16px]" translate="no">person_add</span><span className="text-xs">Añadir Usuario</span></button>}
    </div>
    <div className="flex border-b border-outline-variant mb-4" role="tablist" aria-label="Gestión de usuarios">
      {[['usuarios', 'Usuarios y Permisos'], ['sesiones', 'Historial de Sesiones']].map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => onTabChange(id)} className={`px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors relative ${activeTab === id ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'}`}>{label}{activeTab === id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}</button>)}
    </div>
  </>
);

export default UserManagementHeader;
