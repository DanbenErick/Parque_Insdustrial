import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import api from '../../../api/axiosConfig';
import { createBlobUrl, downloadBlob, MIME_TYPES } from '../../../utils/downloadFile';

const INITIAL_FORM = {
  rol_id: '2', nombre_razonsocial: '', correo: '', cargo_representante: '',
  documento_identidad: '', clave_acceso: '', telefono: '', direccion: ''
};
const emptyConfirmation = { show: false, user: null, isActivating: false };

export const useUserManagement = () => {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [usersList, setUsersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmModal, setConfirmModal] = useState(emptyConfirmation);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/usuarios?limit=1000');
      const rawData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setUsersList(rawData.filter((user) => user.rol_id === 1 || user.rol_id === 2 || user.nombre_rol === 'Admin' || user.nombre_rol === 'Operario'));
    } catch (error) {
      toast.error(error.message || 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return usersList;
    return usersList.filter((user) =>
      user.nombre_razonsocial?.toLowerCase().includes(term) ||
      user.documento_identidad?.includes(term) ||
      user.correo?.toLowerCase().includes(term) ||
      user.cargo_representante?.toLowerCase().includes(term) ||
      user.nombre_rol?.toLowerCase().includes(term)
    );
  }, [usersList, searchTerm]);

  const openAddModal = useCallback(() => { setFormData(INITIAL_FORM); setShowAddModal(true); }, []);
  const openEditModal = useCallback((user) => {
    setFormData({
      rol_id: user.rol_id.toString(), nombre_razonsocial: user.nombre_razonsocial,
      documento_identidad: user.documento_identidad, correo: user.correo,
      cargo_representante: user.cargo_representante, telefono: user.telefono,
      direccion: user.direccion, es_activo: user.es_activo
    });
    setEditingUser(user);
  }, []);

  const handleCreateSubmit = useCallback(async (data) => {
    setIsSaving(true);
    try {
      await api.post('/usuarios', data);
      toast.success('Usuario creado exitosamente');
      setShowAddModal(false);
      await fetchUsers();
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
      await fetchUsers();
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
        rol_id: user.rol_id, documento_identidad: user.documento_identidad,
        nombre_razonsocial: user.nombre_razonsocial, cargo_representante: user.cargo_representante,
        telefono: user.telefono, correo: user.correo, direccion: user.direccion, es_activo: isActivating
      });
      toast.success(isActivating ? 'Usuario reactivado' : 'Usuario desactivado');
      await fetchUsers();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
      setConfirmModal(emptyConfirmation);
    }
  }, [confirmModal, fetchUsers]);

  const handleExport = useCallback(async (type) => {
    try {
      const response = await api.get(`/usuarios/export/${type}`, { responseType: 'blob' });
      if (type === 'pdf') {
        setPdfPreviewUrl(createBlobUrl(response.data, MIME_TYPES.PDF));
      } else {
        downloadBlob(response.data, `usuarios_${new Date().toISOString().slice(0, 10)}.xlsx`, MIME_TYPES.EXCEL);
        toast.success('Archivo EXCEL descargado');
      }
    } catch {
      toast.error('Error al generar el reporte');
    }
  }, []);

  const closePdfModal = useCallback(() => {
    const urlToRevoke = pdfPreviewUrl;
    setPdfPreviewUrl(null);
    setTimeout(() => { if (urlToRevoke) window.URL.revokeObjectURL(urlToRevoke); }, 300);
  }, [pdfPreviewUrl]);

  return {
    activeTab, setActiveTab, filteredUsers, searchTerm, setSearchTerm, isLoading, isSaving,
    showAddModal, openAddModal, closeAddModal: () => setShowAddModal(false),
    editingUser, openEditModal, closeEditModal: () => setEditingUser(null),
    confirmModal, closeConfirmModal: () => setConfirmModal(emptyConfirmation), executeToggleUser,
    pdfPreviewUrl, closePdfModal, formData, handleCreateSubmit, handleEditSubmit,
    toggleUserStatus, handleExport
  };
};
