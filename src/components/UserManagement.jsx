import React, { useState } from 'react';

const UserManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Modals for admin actions
  const [editingUser, setEditingUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [usersList, setUsersList] = useState([
    { id: 1, initials: 'CH', name: 'Carlos Huamaní', email: 'c.huamani@jicamarca.pe', dni: '40123456', role: 'Admin', cargo: 'Administrador Principal', lastAccess: '24/05/2024 08:45', colorClass: 'bg-primary-container text-on-primary-container', isActive: true },
    { id: 2, initials: 'RM', name: 'Rosa Mendoza', email: 'r.mendoza@jicamarca.pe', dni: '72345678', role: 'Moderador', cargo: 'Secretaría', lastAccess: '23/05/2024 16:12', colorClass: 'bg-tertiary-container text-on-tertiary-container', isActive: true },
    { id: 3, initials: 'JS', name: 'Jorge Sánchez', email: 'j.sanchez@jicamarca.pe', dni: '09876543', role: 'Moderador', cargo: 'Operario de Campo', lastAccess: '24/05/2024 09:20', colorClass: 'bg-secondary-container text-on-secondary-container', isActive: false },
    { id: 4, initials: 'LV', name: 'Lucía Valdivia', email: 'l.valdivia@jicamarca.pe', dni: '45678912', role: 'Moderador', cargo: 'Atención al Cliente', lastAccess: '22/05/2024 11:30', colorClass: 'bg-primary-container text-on-primary-container', isActive: true },
  ]);

  const toggleUserStatus = (id) => {
    setUsersList(prev => prev.map(user => 
      user.id === id ? { ...user, isActive: !user.isActive } : user
    ));
  };

  return (
    <main className="p-4 md:p-xl space-y-4 md:space-y-lg max-w-[1600px] mx-auto w-full flex-grow relative">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Gestión de Usuarios y Permisos</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Control centralizado de accesos para el Parque Industrial Jicamarca.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-sm bg-primary text-on-primary px-lg py-md rounded-lg font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">person_add</span>
          <span className="font-body-md text-body-md font-bold">Añadir Moderador</span>
        </button>
      </div>

      {/* Users Table Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
        <div className="px-lg py-md border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-md bg-surface-container-low">
          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Listado de Usuarios</span>
          <div className="flex flex-wrap items-center gap-sm">
            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input 
                type="text" 
                placeholder="Buscar usuario..." 
                className="bg-surface border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary outline-none min-w-[200px]"
              />
            </div>
            <div className="hidden md:block w-[1px] h-6 bg-outline-variant mx-1"></div>
            <button className="flex items-center gap-2 px-md py-2 bg-[#107C41]/10 text-[#107C41] hover:bg-[#107C41]/20 font-bold text-sm rounded-lg transition-colors border border-[#107C41]/20">
              <span className="material-symbols-outlined text-[18px]">table_view</span>
              Exportar Excel
            </button>
            <button className="flex items-center gap-2 px-md py-2 bg-error/10 text-error hover:bg-error/20 font-bold text-sm rounded-lg transition-colors border border-error/20">
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              Exportar PDF
            </button>
            <div className="w-[1px] h-6 bg-outline-variant mx-1"></div>
            <button className="p-2 hover:bg-surface-container-high rounded-lg transition-all text-on-surface-variant flex items-center justify-center" title="Filtrar">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant">
                <th className="px-lg py-md font-label-caps text-[11px] uppercase tracking-wider">Nombre de Usuario</th>
                <th className="px-lg py-md font-label-caps text-[11px] uppercase tracking-wider">Cargo</th>
                <th className="px-lg py-md font-label-caps text-[11px] uppercase tracking-wider">DNI</th>
                <th className="px-lg py-md font-label-caps text-[11px] uppercase tracking-wider">Estado</th>
                <th className="px-lg py-md font-label-caps text-[11px] uppercase tracking-wider">Último Acceso</th>
                <th className="px-lg py-md font-label-caps text-[11px] uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {usersList.map(user => (
                <tr key={user.id} className={`hover:bg-surface-container-high/50 transition-colors ${!user.isActive ? 'opacity-50 grayscale' : ''}`}>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-md">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${user.isActive ? user.colorClass : 'bg-surface-variant text-on-surface-variant'}`}>
                        {user.initials}
                      </div>
                      <div>
                        <span className={`block font-body-md text-body-md font-bold ${!user.isActive && 'line-through'}`}>{user.name}</span>
                        <span className="block font-body-sm text-body-sm text-on-surface-variant">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-lg py-md">
                    <span className="font-bold text-sm text-on-surface-variant">{user.cargo}</span>
                    <span className="block text-[10px] text-primary font-bold uppercase tracking-wider">{user.role}</span>
                  </td>
                  <td className="px-lg py-md font-data-mono text-sm">
                    {user.dni}
                  </td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleUserStatus(user.id)}
                        disabled={user.role === 'Admin'}
                        className={`w-10 h-5 rounded-full relative transition-colors ${user.role === 'Admin' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${user.isActive ? 'bg-primary' : 'bg-surface-variant'}`}
                        title={user.isActive ? "Desactivar" : "Activar"}
                      >
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${user.isActive ? 'left-6' : 'left-1'}`}></div>
                      </button>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${user.isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>
                  <td className="px-lg py-md font-data-mono text-xs text-on-surface-variant">
                    {user.lastAccess}
                  </td>
                  <td className="px-lg py-md text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => setPasswordUser(user)}
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Cambiar Contraseña"
                      >
                        <span className="material-symbols-outlined text-[20px]">key</span>
                      </button>
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Editar Datos"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Modal: Añadir Moderador */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-outline-variant rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-lg py-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h3 className="font-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person_add</span>
                Registrar Nuevo Moderador
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-lg hover:bg-error/10">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg space-y-md">
              <p className="text-sm text-on-surface-variant mb-md">Ingresa los datos del nuevo Moderador. Podrá acceder al sistema para registrar información según su cargo.</p>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nombre Completo</label>
                <input type="text" className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none" placeholder="Ej. Juan Pérez" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Correo Corporativo</label>
                <input type="email" className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none" placeholder="usuario@jicamarca.pe" />
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cargo / Puesto</label>
                  <select className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none">
                    <option>Secretaría</option>
                    <option>Vigilante / Seguridad</option>
                    <option>Operario de Campo</option>
                    <option>Atención al Cliente</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Número de DNI</label>
                  <input type="text" maxLength="8" className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none font-data-mono" placeholder="Ej. 76543210" />
                </div>
              </div>
            </div>
            <div className="px-lg py-md border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-md">
              <button onClick={() => setShowAddModal(false)} className="px-md py-2 font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">Cancelar</button>
              <button 
                onClick={() => { setIsSaving(true); setTimeout(() => { setIsSaving(false); setShowAddModal(false); }, 1000); }}
                disabled={isSaving}
                className="px-lg py-2 bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                {isSaving ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : <span className="material-symbols-outlined text-[18px]">save</span>}
                {isSaving ? 'Guardando...' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Editar Usuario */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-outline-variant rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-lg py-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h3 className="font-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit</span>
                Editar Datos de Usuario
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-lg hover:bg-error/10">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg space-y-md">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nombre Completo</label>
                <input type="text" defaultValue={editingUser.name} className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Correo Corporativo</label>
                <input type="email" defaultValue={editingUser.email} className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cargo / Puesto</label>
                  <select defaultValue={editingUser.cargo} className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none">
                    <option>Administrador Principal</option>
                    <option>Secretaría</option>
                    <option>Vigilante / Seguridad</option>
                    <option>Operario de Campo</option>
                    <option>Atención al Cliente</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Número de DNI</label>
                  <input type="text" maxLength="8" defaultValue={editingUser.dni} className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none font-data-mono" />
                </div>
              </div>
            </div>
            <div className="px-lg py-md border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-md">
              <button onClick={() => setEditingUser(null)} className="px-md py-2 font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">Cancelar</button>
              <button 
                onClick={() => { setIsSaving(true); setTimeout(() => { setIsSaving(false); setEditingUser(null); }, 1000); }}
                disabled={isSaving}
                className="px-lg py-2 bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                {isSaving ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : <span className="material-symbols-outlined text-[18px]">save</span>}
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: Cambiar Contraseña */}
      {passwordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-outline-variant rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-lg py-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h3 className="font-headline-sm font-bold text-error flex items-center gap-2">
                <span className="material-symbols-outlined text-error">key</span>
                Resetear Contraseña
              </h3>
              <button onClick={() => setPasswordUser(null)} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-lg hover:bg-error/10">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg space-y-md">
              <p className="text-sm text-on-surface-variant">Estás a punto de cambiar la contraseña para el usuario <strong className="text-on-surface">{passwordUser.name}</strong>.</p>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nueva Contraseña Temporal</label>
                <div className="relative">
                  <input type="text" className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-error outline-none font-data-mono" placeholder="Ej. temp1234" />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">visibility_off</span>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1">El usuario deberá cambiar esta contraseña en su próximo inicio de sesión.</p>
              </div>
            </div>
            <div className="px-lg py-md border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-md">
              <button onClick={() => setPasswordUser(null)} className="px-md py-2 font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">Cancelar</button>
              <button 
                onClick={() => { setIsSaving(true); setTimeout(() => { setIsSaving(false); setPasswordUser(null); }, 1000); }}
                disabled={isSaving}
                className="px-lg py-2 bg-error text-white font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                {isSaving ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : <span className="material-symbols-outlined text-[18px]">lock_reset</span>}
                {isSaving ? 'Aplicando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
};

export default UserManagement;
