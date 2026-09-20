const ROLE_COLORS = {
  Admin: 'bg-primary-container text-on-primary-container',
  Operario: 'bg-tertiary-container text-on-tertiary-container',
  Socio: 'bg-secondary-container text-on-secondary-container'
};

const UserStatus = ({ user, onToggle }) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      role="switch"
      aria-checked={user.es_activo}
      aria-label={`${user.es_activo ? 'Desactivar' : 'Activar'} a ${user.nombre_razonsocial}`}
      onClick={() => onToggle(user)}
      disabled={user.rol_id === 1}
      className={`w-7 h-4 rounded-full relative transition-colors shadow-inner flex items-center px-0.5 ${user.rol_id === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${user.es_activo ? 'bg-primary' : 'bg-surface-variant'}`}
    >
      <span className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ${user.es_activo ? 'translate-x-3' : 'translate-x-0'}`} />
    </button>
    <span className={`text-[9px] font-bold uppercase tracking-wider ${user.es_activo ? 'text-primary' : 'text-on-surface-variant'}`}>{user.es_activo ? 'Activo' : 'Inactivo'}</span>
  </div>
);

const UserRow = ({ user, onEdit, onToggle }) => (
  <tr className={`hover:bg-surface-container-lowest transition-all group ${!user.es_activo ? 'opacity-60 grayscale' : ''}`}>
    <td className="px-4 py-2"><div className="flex flex-col"><span className={`text-[11px] font-bold text-on-surface group-hover:text-primary transition-colors ${!user.es_activo ? 'line-through' : ''}`}>{user.nombre_razonsocial}</span><span className="text-[10px] font-bold text-primary mt-0.5">Usuario: {user.username || '-'}</span><span className="text-[10px] text-on-surface-variant">{user.correo || 'Sin correo'}</span></div></td>
    <td className="px-4 py-2"><div className="flex flex-col items-start gap-0.5"><span className="font-bold text-[11px] text-on-surface">{user.cargo_representante || '-'}</span><span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${ROLE_COLORS[user.nombre_rol] || 'bg-surface-variant text-on-surface-variant'}`}>{user.nombre_rol}</span></div></td>
    <td className="px-4 py-2 font-data-mono text-[11px] text-on-surface-variant">{user.documento_identidad}</td>
    <td className="px-4 py-2"><UserStatus user={user} onToggle={onToggle} /></td>
    <td className="px-4 py-2 text-[10px] text-on-surface-variant max-w-[200px] truncate" title={user.direccion}>{user.direccion || '-'}</td>
    <td className="px-4 py-2 text-right"><button type="button" onClick={() => onEdit(user)} className="w-7 h-7 items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors inline-flex" aria-label={`Editar a ${user.nombre_razonsocial}`}><span className="material-symbols-outlined text-[16px]" translate="no">edit</span></button></td>
  </tr>
);

const UserDirectory = ({ users, searchTerm, onSearchChange, onExport, onEdit, onToggle, isLoading }) => (
  <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm animate-in fade-in">
    <div className="px-4 py-3 border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-surface-container-lowest">
      <div className="flex flex-col"><div className="flex items-center gap-2"><h2 className="text-base text-on-surface font-bold tracking-tight">Personal y Administradores</h2><span className="bg-surface-variant text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full">{users.length}</span></div><span className="text-[11px] text-on-surface-variant font-medium">Directorio de cuentas con acceso al panel</span></div>
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="relative flex-grow md:flex-grow-0"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]" translate="no">search</span><input type="search" placeholder="Buscar usuario..." value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} className="bg-surface-container-lowest border border-outline-variant rounded-xl pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all w-full md:w-[260px] shadow-sm" /></div>
        <div className="flex items-center gap-2"><div className="h-8 w-px bg-outline-variant mx-1 hidden sm:block" /><button type="button" onClick={() => onExport('excel')} className="group flex items-center gap-1.5 px-3 py-2 bg-[#107C41]/10 border border-transparent hover:border-[#107C41]/30 hover:bg-[#107C41]/20 text-[#107C41] font-bold text-xs rounded-xl transition-all shadow-sm"><span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform" translate="no">table_view</span><span className="hidden sm:inline">Excel</span></button><button type="button" onClick={() => onExport('pdf')} className="group flex items-center gap-1.5 px-3 py-2 bg-error/10 border border-transparent hover:border-error/30 hover:bg-error/20 text-error font-bold text-xs rounded-xl transition-all shadow-sm"><span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform" translate="no">picture_as_pdf</span><span className="hidden sm:inline">PDF</span></button></div>
      </div>
    </div>
    <div className="overflow-x-auto">
      {isLoading ? <div className="p-10 text-center text-on-surface-variant">Cargando usuarios...</div> : (
        <table className="w-full text-left border-collapse table-auto whitespace-nowrap">
          <thead><tr className="bg-surface-container-lowest border-b border-outline-variant text-on-surface-variant text-[11px] uppercase tracking-wider"><th className="px-4 py-2 font-semibold">Nombre / Correo</th><th className="px-4 py-2 font-semibold">Cargo & Rol</th><th className="px-4 py-2 font-semibold">Documento</th><th className="px-4 py-2 font-semibold">Estado</th><th className="px-4 py-2 font-semibold">Dirección</th><th className="px-4 py-2 font-semibold text-right">Acciones</th></tr></thead>
          <tbody className="divide-y divide-outline-variant/50 bg-surface">
            {users.map((user) => <UserRow key={user.id} user={user} onEdit={onEdit} onToggle={onToggle} />)}
            {users.length === 0 && <tr><td colSpan="6" className="text-center py-12 text-on-surface-variant"><div className="flex flex-col items-center justify-center"><span className="material-symbols-outlined text-4xl mb-2 opacity-50" translate="no">search_off</span><p>No se encontraron usuarios que coincidan con la búsqueda.</p></div></td></tr>}
          </tbody>
        </table>
      )}
    </div>
  </div>
);

export default UserDirectory;
