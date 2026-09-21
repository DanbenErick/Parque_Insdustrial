import React from 'react';

const ROLE_COLORS = {
  Admin: 'bg-primary-container text-on-primary-container',
  Operario: 'bg-tertiary-container text-on-tertiary-container',
  Socio: 'bg-secondary-container text-on-secondary-container',
};

const UserMobileCard = ({ user, onEdit, onToggle }) => (
  <article className={`bg-white px-4 py-3 transition-all ${!user.es_activo ? 'opacity-65' : ''}`}>
    <div className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <h3 className={`text-sm font-bold leading-5 text-on-surface break-words ${!user.es_activo ? 'line-through' : ''}`}>{user.nombre_razonsocial}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
          <span className="font-bold text-primary">@{user.username || '-'}</span>
          <span className="min-w-0 truncate text-on-surface-variant">{user.correo || 'Sin correo'}</span>
        </div>
      </div>
      <button type="button" onClick={() => onEdit(user)} className="h-9 w-9 shrink-0 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors" aria-label={`Editar a ${user.nombre_razonsocial}`}>
        <span className="material-symbols-outlined text-[18px]" translate="no">edit</span>
      </button>
    </div>

    <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-outline-variant/70 bg-surface-container-lowest p-2.5">
      <div className="min-w-0">
        <span className="block text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Cargo y rol</span>
        <span className="mt-0.5 block truncate text-xs font-semibold text-on-surface">{user.cargo_representante || '-'}</span>
        <span className={`mt-1 inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${ROLE_COLORS[user.nombre_rol] || 'bg-surface-variant text-on-surface-variant'}`}>{user.nombre_rol}</span>
      </div>
      <div className="text-right">
        <span className="block text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Documento</span>
        <span className="mt-0.5 block font-data-mono text-xs font-semibold text-on-surface">{user.documento_identidad || '-'}</span>
      </div>
    </div>

    <div className="mt-2.5 flex items-start gap-1.5 text-[11px] leading-4 text-on-surface-variant">
      <span className="material-symbols-outlined shrink-0 text-[15px] text-primary/70" translate="no">location_on</span>
      <span className="min-w-0 break-words">{user.direccion || 'Sin dirección registrada'}</span>
    </div>

    <div className="mt-2.5 border-t border-outline-variant/60 pt-2.5 flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Acceso al sistema</span>
      <div className="flex items-center gap-2">
        <span className={`text-[9px] font-bold uppercase tracking-wider ${user.es_activo ? 'text-primary' : 'text-on-surface-variant'}`}>{user.es_activo ? 'Activo' : 'Inactivo'}</span>
        <button
          type="button"
          role="switch"
          aria-checked={user.es_activo}
          aria-label={`${user.es_activo ? 'Desactivar' : 'Activar'} a ${user.nombre_razonsocial}`}
          onClick={() => onToggle(user)}
          disabled={user.rol_id === 1}
          className={`relative flex h-5 w-9 items-center rounded-full px-0.5 shadow-inner transition-colors ${user.rol_id === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${user.es_activo ? 'bg-primary' : 'bg-surface-variant'}`}
        >
          <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${user.es_activo ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
      </div>
    </div>
  </article>
);

export default React.memo(UserMobileCard);
