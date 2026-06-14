import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';

import UserFormModal from './UserFormModal';
import ConfirmActionModal from '../../components/ui/ConfirmActionModal';
import PdfPreviewModal from '../../components/ui/PdfPreviewModal';

// --- Constants ---
const INITIAL_FORM = {
  rol_id: '2',
  nombre_razonsocial: '',
  correo: '',
  cargo_representante: '',
  documento_identidad: '',
  clave_acceso: '',
  telefono: '',
  direccion: '',
};

const ROLE_COLORS = {
  Admin: 'bg-primary-container text-on-primary-container',
  Operario: 'bg-tertiary-container text-on-tertiary-container',
  Socio: 'bg-secondary-container text-on-secondary-container',
};

const getInitials = (name) => {
  if (!name) return 'U';
  const words = name.split(' ');
  return words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
};

const getRoleColor = (rolName) => ROLE_COLORS[rolName] || 'bg-surface-variant text-on-surface-variant';

// --- Component ---
const UserManagement = () => {
  const { token } = useAuth();

  const [usersList, setUsersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, user: null, isActivating: false });
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);

  // Form
  const [formData, setFormData] = useState(INITIAL_FORM);

  // --- Data fetching ---
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/usuarios');
      const rawData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      const personalData = rawData.filter(
        u => u.rol_id === 1 || u.rol_id === 2 || u.nombre_rol === 'Admin' || u.nombre_rol === 'Operario'
      );
      setUsersList(personalData);
    } catch (error) {
      toast.error(error.message || 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // --- Memoized filtered list ---
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return usersList;
    return usersList.filter(user =>
      user.nombre_razonsocial?.toLowerCase().includes(term) ||
      user.documento_identidad?.includes(term) ||
      user.correo?.toLowerCase().includes(term) ||
      user.cargo_representante?.toLowerCase().includes(term) ||
      user.nombre_rol?.toLowerCase().includes(term)
    );
  }, [usersList, searchTerm]);

  // --- Form handlers ---
  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const openAddModal = useCallback(() => {
    setFormData(INITIAL_FORM);
    setShowAddModal(true);
  }, []);

  const closeAddModal = useCallback(() => setShowAddModal(false), []);

  const openEditModal = useCallback((user) => {
    setFormData({
      rol_id: user.rol_id.toString(),
      nombre_razonsocial: user.nombre_razonsocial,
      documento_identidad: user.documento_identidad,
      correo: user.correo,
      cargo_representante: user.cargo_representante,
      telefono: user.telefono,
      direccion: user.direccion,
      es_activo: user.es_activo,
    });
    setEditingUser(user);
  }, []);

  const closeEditModal = useCallback(() => setEditingUser(null), []);

  // --- API Actions ---
  const handleCreateSubmit = useCallback(async (data) => {
    setIsSaving(true);
    try {
      await api.post('/usuarios', data);
      toast.success('Usuario creado exitosamente');
      setShowAddModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  }, [fetchUsers]);

  const handleEditSubmit = useCallback(async (data) => {
    setIsSaving(true);
    try {
      await api.put(`/usuarios/${editingUser.id}`, data);
      toast.success('Usuario actualizado exitosamente');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  }, [editingUser, fetchUsers]);

  const toggleUserStatus = useCallback((user) => {
    if (user.rol_id === 1) return toast.info('No puedes desactivar a un Administrador.');
    setConfirmModal({ show: true, user, isActivating: !user.es_activo });
  }, []);

  const executeToggleUser = useCallback(async () => {
    const { user, isActivating } = confirmModal;
    setIsSaving(true);
    try {
      await api.put(`/usuarios/${user.id}`, {
        rol_id: user.rol_id,
        documento_identidad: user.documento_identidad,
        nombre_razonsocial: user.nombre_razonsocial,
        cargo_representante: user.cargo_representante,
        telefono: user.telefono,
        correo: user.correo,
        direccion: user.direccion,
        es_activo: isActivating,
      });
      toast.success(isActivating ? 'Usuario reactivado' : 'Usuario desactivado');
      fetchUsers();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
      setConfirmModal({ show: false, user: null, isActivating: false });
    }
  }, [confirmModal, fetchUsers]);

  const closeConfirmModal = useCallback(() => {
    setConfirmModal({ show: false, user: null, isActivating: false });
  }, []);

  // --- Export ---
  const handleExport = useCallback(async (type) => {
    try {
      const response = await api.get(`/usuarios/export/${type}`, { responseType: 'blob' });
      const mimeType = type === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);

      if (type === 'pdf') {
        setPdfPreviewUrl(url);
        setShowPdfModal(true);
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = `usuarios_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Archivo EXCEL descargado');
      }
    } catch (error) {
      toast.error('Error al generar el reporte');
    }
  }, []);

  const closePdfModal = useCallback(() => {
    setShowPdfModal(false);
    setTimeout(() => {
      if (pdfPreviewUrl) {
        window.URL.revokeObjectURL(pdfPreviewUrl);
        setPdfPreviewUrl(null);
      }
    }, 300);
  }, [pdfPreviewUrl]);

  // --- Render ---
  return (
    <main className="p-4 md:p-6 space-y-4 max-w-[1600px] mx-auto w-full flex-grow relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-2xl text-on-surface font-bold leading-tight">Gestión de Usuarios</h1>
          <p className="text-sm text-on-surface-variant">Control centralizado de accesos para el Parque Industrial Jicamarca.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-primary text-on-primary px-4 py-1.5 h-8 rounded-md font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          <span className="text-xs">Añadir Usuario</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="px-4 py-3 border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-base text-on-surface font-bold tracking-tight">Personal y Socios</h2>
                <span className="bg-surface-variant text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {filteredUsers.length}
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium">Directorio completo de usuarios registrados</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                type="text" placeholder="Buscar usuario..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all w-full md:w-[260px] shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-[1px] bg-outline-variant mx-1 hidden sm:block"></div>
              <button
                onClick={() => handleExport('excel')}
                className="group flex items-center gap-1.5 px-3 py-2 bg-[#107C41]/10 border border-transparent hover:border-[#107C41]/30 hover:bg-[#107C41]/20 text-[#107C41] font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">table_view</span>
                <span className="hidden sm:inline">Excel</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="group flex items-center gap-1.5 px-3 py-2 bg-error/10 border border-transparent hover:border-error/30 hover:bg-error/20 text-error font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">picture_as_pdf</span>
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-10 text-center text-on-surface-variant">Cargando usuarios...</div>
          ) : (
            <table className="w-full text-left border-collapse table-auto whitespace-nowrap">
              <thead>
                <tr className="bg-surface-container-lowest border-b border-outline-variant text-on-surface-variant text-[11px] uppercase tracking-wider">
                  <th className="px-4 py-2 font-semibold">Nombre / Entidad</th>
                  <th className="px-4 py-2 font-semibold">Cargo & Rol</th>
                  <th className="px-4 py-2 font-semibold">Documento</th>
                  <th className="px-4 py-2 font-semibold">Estado</th>
                  <th className="px-4 py-2 font-semibold">Dirección</th>
                  <th className="px-4 py-2 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50 bg-surface">
                {filteredUsers.map(user => (
                  <tr key={user.id} className={`hover:bg-surface-container-lowest transition-all group ${!user.es_activo ? 'opacity-60 grayscale' : ''}`}>
                    <td className="px-4 py-2">
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-bold text-on-surface group-hover:text-primary transition-colors ${!user.es_activo && 'line-through'}`}>{user.nombre_razonsocial}</span>
                        <span className="text-[10px] text-on-surface-variant">{user.correo || 'Sin correo'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="font-bold text-[11px] text-on-surface">{user.cargo_representante || '-'}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${getRoleColor(user.nombre_rol)}`}>
                          {user.nombre_rol}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 font-data-mono text-[11px] text-on-surface-variant">
                      {user.documento_identidad}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleUserStatus(user)}
                          disabled={user.rol_id === 1}
                          className={`w-7 h-4 rounded-full relative transition-colors shadow-inner flex items-center px-0.5 ${user.rol_id === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${user.es_activo ? 'bg-primary' : 'bg-surface-variant'}`}
                        >
                          <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ${user.es_activo ? 'translate-x-3' : 'translate-x-0'}`}></div>
                        </button>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${user.es_activo ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {user.es_activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-[10px] text-on-surface-variant max-w-[200px] truncate" title={user.direccion}>
                      {user.direccion || '-'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => openEditModal(user)}
                        className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors inline-flex"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-on-surface-variant">
                      <div className="flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                        <p>No se encontraron usuarios que coincidan con la búsqueda.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ====== MODALS ====== */}
      <AnimatePresence>
        {showAddModal && (
          <UserFormModal
            initialData={formData}
            onSubmit={handleCreateSubmit}
            onClose={closeAddModal}
            isSaving={isSaving}
            isEdit={false}
          />
        )}
        {editingUser && (
          <UserFormModal
            initialData={formData}
            onSubmit={handleEditSubmit}
            onClose={closeEditModal}
            isSaving={isSaving}
            isEdit={true}
            editingUser={editingUser}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmModal.show && (
          <ConfirmActionModal
            title={confirmModal.isActivating ? 'Reactivar Usuario' : 'Desactivar Usuario'}
            message={`¿Estás seguro de que deseas ${confirmModal.isActivating ? 'reactivar' : 'desactivar'} el usuario ${confirmModal.user?.nombre_razonsocial}?`}
            warningText={!confirmModal.isActivating ? 'El usuario no podrá iniciar sesión en el sistema.' : undefined}
            confirmText={confirmModal.isActivating ? 'Sí, reactivar' : 'Sí, desactivar'}
            isDestructive={!confirmModal.isActivating}
            isLoading={isSaving}
            icon={confirmModal.isActivating ? 'person_add' : 'person_off'}
            onConfirm={executeToggleUser}
            onClose={closeConfirmModal}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPdfModal && (
          <PdfPreviewModal
            pdfBlobUrl={pdfPreviewUrl}
            title="Reporte de Usuarios"
            downloadFileName={`usuarios_${new Date().toISOString().slice(0, 10)}.pdf`}
            onClose={closePdfModal}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default UserManagement;
