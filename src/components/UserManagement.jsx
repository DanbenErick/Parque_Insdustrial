import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import api from '../api/axiosConfig';

const UserManagement = () => {
  const { token, user: currentUser } = useAuth();
  
  const [usersList, setUsersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals for admin actions
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, user: null, isActivating: false });
  
  const [isSaving, setIsSaving] = useState(false);

  // Formularios
  const [formData, setFormData] = useState({
    rol_id: '2', // Default: Operario
    nombre_razonsocial: '',
    correo: '',
    cargo_representante: '',
    documento_identidad: '',
    clave_acceso: '',
    telefono: '',
    direccion: ''
  });

  const [passwordForm, setPasswordForm] = useState({ clave_acceso: '' });

  // ----------------------------------------------------
  // FETCH USERS
  // ----------------------------------------------------
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/usuarios');
      // Filtrar para mostrar únicamente Admin (1) y Operario (2)
      const personalData = response.data.filter(u => u.rol_id === 1 || u.rol_id === 2 || u.nombre_rol === 'Admin' || u.nombre_rol === 'Operario');
      setUsersList(personalData);
    } catch (error) {
      toast.error(error.message || 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // ----------------------------------------------------
  // HELPERS
  // ----------------------------------------------------
  const getInitials = (name) => {
    if (!name) return 'U';
    const words = name.split(' ');
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleColor = (rolName) => {
    switch (rolName) {
      case 'Admin': return 'bg-primary-container text-on-primary-container';
      case 'Operario': return 'bg-tertiary-container text-on-tertiary-container';
      case 'Miembro': return 'bg-secondary-container text-on-secondary-container';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      documento_identidad: '', clave_acceso: '', telefono: '', direccion: ''
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (user) => {
    setFormData({
      rol_id: user.rol_id.toString(),
      nombre_razonsocial: user.nombre_razonsocial,
      documento_identidad: user.documento_identidad,
      correo: user.correo,
      cargo_representante: user.cargo_representante,
      telefono: user.telefono,
      direccion: user.direccion,
      es_activo: user.es_activo
    });
    setEditingUser(user);
  };

  // ----------------------------------------------------
  // API ACTIONS
  // ----------------------------------------------------
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/usuarios', formData);
      toast.success('Usuario creado exitosamente');
      setShowAddModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put(`/usuarios/${editingUser.id}`, formData);
      toast.success('Usuario actualizado exitosamente');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleUserStatus = async (user) => {
    if (user.rol_id === 1) return toast.info('No puedes desactivar a un Administrador.');
    
    // En lugar de window.confirm, abrimos nuestro modal personalizado
    setConfirmModal({ show: true, user, isActivating: !user.es_activo });
  };

  const executeToggleUser = async () => {
    const { user, isActivating } = confirmModal;
    setIsSaving(true);

    try {
      const toggleData = {
        rol_id: user.rol_id,
        documento_identidad: user.documento_identidad,
        nombre_razonsocial: user.nombre_razonsocial,
        cargo_representante: user.cargo_representante,
        telefono: user.telefono,
        correo: user.correo,
        direccion: user.direccion,
        es_activo: isActivating
      };

      await api.put(`/usuarios/${user.id}`, toggleData);
      toast.success(isActivating ? 'Usuario reactivado' : 'Usuario desactivado');
      fetchUsers();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
      setConfirmModal({ show: false, user: null, isActivating: false });
    }
  };


  // ---- Export helpers ----
  const handleExport = async (type) => {
    try {
      const response = await api.get(`/usuarios/export/${type}`, { responseType: 'blob' });
      const extension = type === 'excel' ? 'xlsx' : 'pdf';
      const mimeType = type === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        : 'application/pdf';

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `usuarios_${new Date().toISOString().slice(0, 10)}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Archivo ${extension.toUpperCase()} descargado`);
    } catch (error) {
      toast.error('Error al descargar el reporte');
    }
  };

  const filteredUsers = usersList.filter(user => {
    const term = searchTerm.toLowerCase();
    return (
      (user.nombre_razonsocial && user.nombre_razonsocial.toLowerCase().includes(term)) ||
      (user.documento_identidad && user.documento_identidad.includes(term)) ||
      (user.correo && user.correo.toLowerCase().includes(term)) ||
      (user.cargo_representante && user.cargo_representante.toLowerCase().includes(term)) ||
      (user.nombre_rol && user.nombre_rol.toLowerCase().includes(term))
    );
  });

  return (
    <main className="p-4 md:p-xl space-y-4 md:space-y-lg max-w-[1600px] mx-auto w-full flex-grow relative">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Gestión de Usuarios</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Control centralizado de accesos para el Parque Industrial Jicamarca.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-sm bg-primary text-on-primary px-lg py-md rounded-lg font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">person_add</span>
          <span className="font-body-md text-body-md font-bold">Añadir Usuario</span>
        </button>
      </div>

      {/* Users Table Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
        <div className="px-lg py-md border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-md bg-surface-container-low">
          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Listado del Personal y Miembros</span>
          <div className="flex flex-wrap items-center gap-sm">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input 
                type="text" 
                placeholder="Buscar por nombre, DNI, rol..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-surface border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary outline-none min-w-[200px]"
              />
            </div>
            <div className="hidden md:block w-[1px] h-6 bg-outline-variant mx-1"></div>
            <button onClick={() => handleExport('excel')} className="flex items-center gap-2 px-md py-2 bg-[#107C41]/10 text-[#107C41] hover:bg-[#107C41]/20 font-bold text-sm rounded-lg transition-colors border border-[#107C41]/20">
              <span className="material-symbols-outlined text-[18px]">table_view</span>
              Exportar Excel
            </button>
            <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-md py-2 bg-error/10 text-error hover:bg-error/20 font-bold text-sm rounded-lg transition-colors border border-error/20">
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              Exportar PDF
            </button>
            <div className="w-[1px] h-6 bg-outline-variant mx-1"></div>
            <button className="p-2 hover:bg-surface-container-high rounded-lg transition-all text-on-surface-variant flex items-center justify-center" title="Recargar" onClick={fetchUsers}>
              <span className="material-symbols-outlined">refresh</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-xl text-center text-on-surface-variant">Cargando usuarios...</div>
          ) : (
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant">
                  <th className="px-lg py-md font-label-caps text-[11px] uppercase tracking-wider">Nombre / Entidad</th>
                  <th className="px-lg py-md font-label-caps text-[11px] uppercase tracking-wider">Cargo</th>
                  <th className="px-lg py-md font-label-caps text-[11px] uppercase tracking-wider">Documento</th>
                  <th className="px-lg py-md font-label-caps text-[11px] uppercase tracking-wider">Estado</th>
                  <th className="px-lg py-md font-label-caps text-[11px] uppercase tracking-wider">Dirección</th>
                  <th className="px-lg py-md font-label-caps text-[11px] uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredUsers.map(user => (
                  <tr key={user.id} className={`hover:bg-surface-container-high/50 transition-colors ${!user.es_activo ? 'opacity-50 grayscale' : ''}`}>
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-md">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${user.es_activo ? getRoleColor(user.nombre_rol) : 'bg-surface-variant text-on-surface-variant'}`}>
                          {getInitials(user.nombre_razonsocial)}
                        </div>
                        <div>
                          <span className={`block font-body-md text-body-md font-bold ${!user.es_activo && 'line-through'}`}>{user.nombre_razonsocial}</span>
                          <span className="block font-body-sm text-body-sm text-on-surface-variant">{user.correo || 'Sin correo'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-lg py-md">
                      <span className="font-bold text-sm text-on-surface-variant">{user.cargo_representante || '-'}</span>
                      <span className="block text-[10px] text-primary font-bold uppercase tracking-wider">{user.nombre_rol}</span>
                    </td>
                    <td className="px-lg py-md font-data-mono text-sm">
                      {user.documento_identidad}
                    </td>
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleUserStatus(user)}
                          disabled={user.rol_id === 1}
                          className={`w-10 h-5 rounded-full relative transition-colors ${user.rol_id === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${user.es_activo ? 'bg-primary' : 'bg-surface-variant'}`}
                          title={user.es_activo ? "Desactivar" : "Activar"}
                        >
                          <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${user.es_activo ? 'left-6' : 'left-1'}`}></div>
                        </button>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${user.es_activo ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {user.es_activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-lg py-md font-data-mono text-xs text-on-surface-variant">
                      {user.direccion || '-'}
                    </td>
                    <td className="px-lg py-md text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Funcionalidad de cambiar contraseña pendiente para versión 2 */}
                        <button 
                          onClick={() => openEditModal(user)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Editar Datos"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-xl text-on-surface-variant">No se encontraron usuarios que coincidan con la búsqueda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 1. Modal: Añadir Usuario */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleCreateSubmit} className="bg-surface border border-outline-variant rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-lg py-md border-b-0 bg-slate-800 flex justify-between items-center">
              <h3 className="font-headline-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-white">person_add</span>
                Registrar Nuevo Usuario
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/20">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-lg space-y-md max-h-[70vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tipo de Rol</label>
                <select name="rol_id" value={formData.rol_id} onChange={handleFormChange} className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none">
                  <option value="1">Administrador</option>
                  <option value="2">Operario (Moderador)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nombre Completo o Razón Social</label>
                <input required type="text" name="nombre_razonsocial" value={formData.nombre_razonsocial} onChange={handleFormChange} className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none" placeholder="Ej. Juan Pérez o Corp Industrial S.A." />
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">DNI / RUC</label>
                  <input required type="text" name="documento_identidad" value={formData.documento_identidad} onChange={handleFormChange} className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none font-data-mono" placeholder="Documento" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    {formData.rol_id === '3' ? 'PIN (6 dígitos)' : 'Contraseña de Acceso'}
                  </label>
                  <input 
                    required 
                    type={formData.rol_id === '3' ? 'text' : 'password'} 
                    maxLength={formData.rol_id === '3' ? 6 : undefined}
                    name="clave_acceso" 
                    value={formData.clave_acceso} 
                    onChange={handleFormChange} 
                    className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none font-data-mono" 
                    placeholder="Clave inicial" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Correo Electrónico</label>
                  <input required type="email" name="correo" value={formData.correo} onChange={handleFormChange} className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none" placeholder="usuario@correo.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cargo</label>
                  <input required type="text" name="cargo_representante" value={formData.cargo_representante} onChange={handleFormChange} className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none" placeholder="Ej. Gerente / Operador" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md pt-2 border-t border-outline-variant">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Teléfono de Contacto</label>
                  <input required type="text" name="telefono" value={formData.telefono} onChange={handleFormChange} className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none" placeholder="Teléfono / Celular" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Dirección</label>
                  <input required type="text" name="direccion" value={formData.direccion} onChange={handleFormChange} className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none" placeholder="Ej. Calle las Artes Mz A Lt 15" />
                </div>
              </div>
            </div>
            
            <div className="px-lg py-md border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-md">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-md py-2 font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">Cancelar</button>
              <button 
                type="submit"
                disabled={isSaving}
                className="px-lg py-2 bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                {isSaving ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : <span className="material-symbols-outlined text-[18px]">save</span>}
                {isSaving ? 'Guardando...' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Modal: Editar Usuario */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleEditSubmit} className="bg-surface border border-outline-variant rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-lg py-md border-b-0 bg-slate-800 flex justify-between items-center">
              <h3 className="font-headline-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-white">edit</span>
                Editar Usuario
              </h3>
              <button type="button" onClick={() => setEditingUser(null)} className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/20">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-lg space-y-md max-h-[70vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tipo de Rol</label>
                <select name="rol_id" value={formData.rol_id} onChange={handleFormChange} className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none" disabled={editingUser.rol_id === 1}>
                  <option value="1">Administrador</option>
                  <option value="2">Operario (Moderador)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nombre Completo o Razón Social</label>
                <input required type="text" name="nombre_razonsocial" value={formData.nombre_razonsocial} onChange={handleFormChange} className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">DNI / RUC</label>
                  <input required type="text" name="documento_identidad" value={formData.documento_identidad} onChange={handleFormChange} className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none font-data-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cargo</label>
                  <input required type="text" name="cargo_representante" value={formData.cargo_representante} onChange={handleFormChange} className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Correo Electrónico</label>
                  <input required type="email" name="correo" value={formData.correo} onChange={handleFormChange} className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Teléfono de Contacto</label>
                  <input required type="text" name="telefono" value={formData.telefono} onChange={handleFormChange} className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md pt-2 border-t border-outline-variant">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Dirección</label>
                  <input required type="text" name="direccion" value={formData.direccion} onChange={handleFormChange} className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm focus:border-primary outline-none" />
                </div>
              </div>
            </div>
            
            <div className="px-lg py-md border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-md">
              <button type="button" onClick={() => setEditingUser(null)} className="px-md py-2 font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">Cancelar</button>
              <button 
                type="submit"
                disabled={isSaving}
                className="px-lg py-2 bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                {isSaving ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : <span className="material-symbols-outlined text-[18px]">save</span>}
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Modal: Confirmación de Acción */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-md bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-outline-variant rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`px-lg py-md flex justify-between items-center border-b-0 ${confirmModal.isActivating ? 'bg-primary' : 'bg-error'}`}>
              <h3 className="font-headline-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-white">
                  {confirmModal.isActivating ? 'how_to_reg' : 'warning'}
                </span>
                {confirmModal.isActivating ? 'Reactivar Usuario' : 'Desactivar Usuario'}
              </h3>
            </div>
            <div className="p-lg">
              <p className="text-on-surface-variant font-body-md">
                ¿Estás seguro de que deseas {confirmModal.isActivating ? 'reactivar' : 'desactivar'} el acceso a <strong>{confirmModal.user?.nombre_razonsocial}</strong>?
              </p>
              {!confirmModal.isActivating && (
                <p className="text-xs text-error mt-2 font-bold">
                  El usuario no podrá iniciar sesión en el sistema.
                </p>
              )}
            </div>
            <div className="px-lg py-md border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-md">
              <button 
                type="button" 
                onClick={() => setConfirmModal({ show: false, user: null, isActivating: false })} 
                className="px-md py-2 font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={executeToggleUser}
                disabled={isSaving}
                className={`px-lg py-2 font-bold rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 ${confirmModal.isActivating ? 'bg-primary text-on-primary' : 'bg-error text-white'}`}
              >
                {isSaving ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">
                    {confirmModal.isActivating ? 'check_circle' : 'person_cancel'}
                  </span>
                )}
                {confirmModal.isActivating ? 'Sí, reactivar' : 'Sí, desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
};

export default UserManagement;
