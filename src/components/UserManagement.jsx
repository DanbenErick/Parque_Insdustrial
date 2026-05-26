import React from 'react';

const UserManagement = () => {
  const users = [
    { id: 1, initials: 'CH', name: 'Carlos Huamaní', email: 'c.huamani@jicamarca.pe', role: 'Admin', sector: 'Sector A - Metalmecánica', lastAccess: '24/05/2024 08:45', colorClass: 'bg-primary-container text-on-primary-container', roleClass: 'bg-primary/10 text-primary border-primary/20' },
    { id: 2, initials: 'RM', name: 'Rosa Mendoza', email: 'r.mendoza@jicamarca.pe', role: 'Moderador', sector: 'Sector B - Textil', lastAccess: '23/05/2024 16:12', colorClass: 'bg-tertiary-container text-on-tertiary-container', roleClass: 'bg-tertiary/10 text-tertiary border-tertiary/20' },
    { id: 3, initials: 'JS', name: 'Jorge Sánchez', email: 'j.sanchez@jicamarca.pe', role: 'Miembro', sector: 'Sector C - Logística', lastAccess: '24/05/2024 09:20', colorClass: 'bg-secondary-container text-on-secondary-container', roleClass: 'bg-secondary/10 text-secondary border-secondary/20' },
    { id: 4, initials: 'LV', name: 'Lucía Valdivia', email: 'l.valdivia@jicamarca.pe', role: 'Miembro', sector: 'Sector A - Metalmecánica', lastAccess: '22/05/2024 11:30', colorClass: 'bg-primary-container text-on-primary-container', roleClass: 'bg-secondary/10 text-secondary border-secondary/20' },
  ];

  return (
    <main className="p-xl space-y-lg max-w-[1600px] mx-auto w-full flex-grow relative">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Gestión de Usuarios y Permisos</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Control centralizado de accesos para el Parque Industrial Jicamarca.</p>
        </div>
        <button className="flex items-center gap-sm bg-primary text-on-primary px-lg py-md rounded-lg font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all">
          <span className="material-symbols-outlined">person_add</span>
          <span className="font-body-md text-body-md font-bold">Añadir Usuario</span>
        </button>
      </div>

      {/* Dashboard Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex items-center gap-md shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <span className="block font-label-caps text-[11px] uppercase text-on-surface-variant">TOTAL USUARIOS</span>
            <span className="block font-data-mono text-headline-sm font-bold">128</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex items-center gap-md shadow-sm">
          <div className="w-12 h-12 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined">admin_panel_settings</span>
          </div>
          <div>
            <span className="block font-label-caps text-[11px] uppercase text-on-surface-variant">ADMINS</span>
            <span className="block font-data-mono text-headline-sm font-bold">12</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex items-center gap-md shadow-sm">
          <div className="w-12 h-12 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">domain_verification</span>
          </div>
          <div>
            <span className="block font-label-caps text-[11px] uppercase text-on-surface-variant">SECTORES ACTIVOS</span>
            <span className="block font-data-mono text-headline-sm font-bold">08</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex items-center gap-md shadow-sm">
          <div className="w-12 h-12 rounded-full bg-error-container/10 flex items-center justify-center text-error">
            <span className="material-symbols-outlined">lock_reset</span>
          </div>
          <div>
            <span className="block font-label-caps text-[11px] uppercase text-on-surface-variant">PENDIENTES</span>
            <span className="block font-data-mono text-headline-sm font-bold">03</span>
          </div>
        </div>
      </div>

      {/* Users Table Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
        <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Listado de Usuarios</span>
          <div className="flex gap-sm">
            <button className="p-2 hover:bg-surface-container-high rounded transition-all"><span className="material-symbols-outlined text-on-surface-variant">filter_list</span></button>
            <button className="p-2 hover:bg-surface-container-high rounded transition-all"><span className="material-symbols-outlined text-on-surface-variant">download</span></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-zebra">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant">
                <th className="px-lg py-md font-label-caps text-[11px] uppercase tracking-wider">Nombre de Usuario</th>
                <th className="px-lg py-md font-label-caps text-[11px] uppercase tracking-wider">Rol</th>
                <th className="px-lg py-md font-label-caps text-[11px] uppercase tracking-wider">Sector Asignado</th>
                <th className="px-lg py-md font-label-caps text-[11px] uppercase tracking-wider">Último Acceso</th>
                <th className="px-lg py-md font-label-caps text-[11px] uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-surface-container-high/50 transition-colors">
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-md">
                      <div className={`w-8 h-8 rounded-full ${user.colorClass} flex items-center justify-center font-bold text-xs`}>
                        {user.initials}
                      </div>
                      <div>
                        <span className="block font-body-md text-body-md font-bold">{user.name}</span>
                        <span className="block font-body-sm text-body-sm text-on-surface-variant">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-lg py-md">
                    <span className={`inline-flex items-center px-sm py-xs rounded ${user.roleClass} font-bold text-[11px] uppercase tracking-wider border`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-lg py-md">
                    <span className="font-body-md text-body-md">{user.sector}</span>
                  </td>
                  <td className="px-lg py-md">
                    <span className="font-data-mono text-[13px] text-on-surface-variant">{user.lastAccess}</span>
                  </td>
                  <td className="px-lg py-md">
                    <div className="flex justify-center gap-md">
                      <button className="text-primary hover:scale-110 transition-transform" title="Editar"><span className="material-symbols-outlined">edit</span></button>
                      <button className="text-secondary hover:scale-110 transition-transform" title="Permisos"><span className="material-symbols-outlined">key</span></button>
                      <button className="text-error hover:scale-110 transition-transform" title="Eliminar"><span className="material-symbols-outlined">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default UserManagement;
