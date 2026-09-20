import  { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';
import { useTenants } from './hooks/useTenants';

import { exportToExcel, generatePDFPreview } from './tenantExportService';
import TenantKPICards from './TenantKPICards';
import TenantFormModal from './TenantFormModal';
import TenantDetailDrawer from './TenantDetailDrawer';
import TenantImportModal from './TenantImportModal';
import ConfirmActionModal from '../../components/ui/ConfirmActionModal';
import PdfPreviewModal from '../../components/ui/PdfPreviewModal';
import LoadingCurtain from '../../components/ui/LoadingCurtain';
import TenantDirectory from './components/TenantDirectory';

const INITIAL_FORM = {
  nombre_razonsocial: '',
  documento_identidad: '',
  actividad: 'General',
  correo: '',
  telefono: '',
  clave_acceso: '',
  medidores: [{ num_serie: '', tipo: 'Normal', direccion: '' }]
};

const TenantsAndSectors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterRubro, setFilterRubro] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);

  // Hook de React Query (carga todos los socios para búsqueda y filtrado local instantáneo)
  const { tenants, isLoadingTenants: isLoading, globalStats, refetchAll } = useTenants();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);

  // Modals / Drawers state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, user: null, specificMedidor: null, isActivating: false });
  const [resetPasswordModal, setResetPasswordModal] = useState({ show: false, tenant: null });
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [drawerTenant, setDrawerTenant] = useState(null);

  const [isSavingToggle, setIsSavingToggle] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [, setErrors] = useState({});

  const handleRegister = useCallback(async (data) => {
    setIsSubmitting(true);
    try {
      // Si estamos editando un socio, es posible que estemos viendo solo un medidor en pantalla.
      // Debemos preservar los demás medidores que no están en el formulario para que no se borren en el backend.
      let finalMedidores = data.medidores.map(m => ({ ...m, id: m.medidor_id }));
      if (editId) {
        const originalTenant = tenants.find(t => t.id === editId);
        if (originalTenant && originalTenant.parsedMedidores) {
           const formIds = finalMedidores.map(m => m.id);
           const hiddenMedidores = originalTenant.parsedMedidores.filter(om => !formIds.includes(om.id));
           finalMedidores = [...finalMedidores, ...hiddenMedidores];
        }
      }

      const payload = {
        ...data,
        cargo_representante: data.nombre_razonsocial, // backend fallback
        direccion: finalMedidores.length > 0 && finalMedidores[0].direccion ? finalMedidores[0].direccion : '-', // backend fallback
        rol_id: 3,
        actividad_rubro: data.actividad || 'General',
        medidores: finalMedidores // Restaurar medidores completos
      };

      if (editId) {
        if (!data.clave_acceso) delete payload.clave_acceso;
        await api.put(`/usuarios/${editId}`, payload);
        toast.success("Socio actualizado con éxito");
      } else {
        payload.clave_acceso = '000000';
        await api.post('/usuarios', payload);
        toast.success("Socio registrado con éxito");
      }
      setIsModalOpen(false);
      refetchAll(); // Refetch usando React Query
      setFormData(INITIAL_FORM);
      setEditId(null);
    } catch (error) {
      toast.error(error.message || "Error al procesar la solicitud", { duration: 6000 });
    } finally {
      setIsSubmitting(false);
    }
  }, [editId, tenants, refetchAll]);

  const handleResetPassword = useCallback((tenant) => {
    setResetPasswordModal({ show: true, tenant });
  }, []);

  const executeResetPassword = useCallback(async () => {
    const tenant = resetPasswordModal.tenant;
    if (!tenant) return;

    setIsResettingPassword(true);
    try {
      await api.post(`/usuarios/${tenant.id}/reset-password`);
      toast.success('Contraseña restablecida a 123456. El socio debe cambiarla al ingresar.', {
        duration: 10000,
      });
      setResetPasswordModal({ show: false, tenant: null });
    } catch {
      toast.error('Error al restablecer contraseña');
    } finally {
      setIsResettingPassword(false);
    }
  }, [resetPasswordModal]);

  const handleWhatsApp = useCallback((tenant) => {
    if (!tenant.telefono) return toast.error('El usuario no tiene número de teléfono registrado.');
    let phone = tenant.telefono.replace(/\s+/g, '');
    if (!phone.startsWith('+')) {
      if (phone.length === 9) phone = '51' + phone;
    } else {
      phone = phone.replace('+', '');
    }
    window.open(`https://api.whatsapp.com/send?phone=${phone}`, '_blank');
  }, []);

  const handleOpenNew = useCallback(() => {
    setEditId(null);
    setFormData(INITIAL_FORM);
    setErrors({});
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((tenant, specificMedidor) => {
    setEditId(tenant.id);
    let parsedMedidores = [{ num_serie: '', tipo: 'Normal', direccion: tenant.direccion || '' }];
    try {
      if (tenant.medidores) {
        const parsed = JSON.parse(tenant.medidores);
        if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0].num_serie || parsed[0].tipo === 'Sin Medidor')) {
          if (specificMedidor) {
            // Si editamos un medidor en específico, mostramos solo ese medidor
            const medidorToEdit = parsed.find(m => m.id === specificMedidor.id) || specificMedidor;
            parsedMedidores = [{
              ...medidorToEdit,
              medidor_id: medidorToEdit.id,
              direccion: medidorToEdit.direccion || tenant.direccion || ''
            }];
          } else {
            // Comportamiento normal para crear socio o si no hay specificMedidor
            parsedMedidores = parsed.map(m => ({
              ...m,
              medidor_id: m.id, // Guardar el id real en medidor_id para que react-hook-form no lo sobreescriba con su UUID
              direccion: m.direccion || tenant.direccion || '' // Fallback a la dirección antigua del tenant
            }));
          }
        }
      }
    } catch { /* medidores column may contain malformed JSON — silently skip */ }

    setFormData({
      nombre_razonsocial: tenant.nombre_razonsocial,
      documento_identidad: tenant.documento_identidad,
      actividad: tenant.actividad_rubro || 'General',
      correo: tenant.correo || '',
      telefono: tenant.telefono || '',
      clave_acceso: '',
      medidores: parsedMedidores
    });
    setErrors({});
    setIsModalOpen(true);
  }, []);

  const toggleUserStatus = useCallback((tenant, specificMedidor) => {
    // Si la fila tiene un medidor específico, usamos el estado del medidor; si no, el del usuario
    const isActivating = specificMedidor
      ? (specificMedidor.operativo === false || specificMedidor.operativo === 0 || specificMedidor.operativo === '0')
      : !tenant.es_activo;
    setConfirmModal({ show: true, user: tenant, specificMedidor, isActivating });
  }, []);

  const handleOpenMenu = useCallback((tenant, specificMedidor, e) => {
    e.stopPropagation();
    const menuKey = `${tenant.id}-${specificMedidor ? specificMedidor.id : 'none'}`;
    if (actionMenu?.key === menuKey) {
      setActionMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = 250;
    const openUp = spaceBelow < menuHeight && rect.top > menuHeight;

    setActionMenu({
      key: menuKey,
      tenant,
      specificMedidor,
      top: openUp ? undefined : rect.bottom + 4,
      bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
      right: Math.max(12, window.innerWidth - rect.right),
    });
  }, [actionMenu]);

  // Cerrar menú de acciones al presionar Escape, hacer scroll o redimensionar
  useEffect(() => {
    if (!actionMenu) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') setActionMenu(null); };
    const handleScrollOrResize = () => setActionMenu(null);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [actionMenu]);

  const executeToggleUser = useCallback(async () => {
    const { user, specificMedidor, isActivating } = confirmModal;
    setIsSavingToggle(true);

    try {
      if (specificMedidor) {
        // Dar de baja o reactivar solo el medidor
        await api.put(`/medidores/${specificMedidor.id}`, { operativo: isActivating });
      } else {
        // Suspender/Reactivar todo el usuario
        const toggleData = {
          rol_id: user.rol_id,
          documento_identidad: user.documento_identidad,
          nombre_razonsocial: user.nombre_razonsocial,
          cargo_representante: user.cargo_representante,
          actividad_rubro: user.actividad_rubro,
          telefono: user.telefono,
          correo: user.correo,
          direccion: user.direccion,
          es_activo: isActivating
        };
        await api.put(`/usuarios/${user.id}`, toggleData);
      }

      toast.custom((t) => (
        <div className="bg-surface border-l-4 border-outline-variant shadow-lg rounded-r-lg p-4 flex items-start gap-3 w-[350px] animate-in slide-in-from-top-5" style={{ borderLeftColor: isActivating ? '#059669' : '#d97706' }}>
          <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isActivating ? 'bg-[#059669]/10 text-[#059669]' : 'bg-amber-100 text-amber-700'}`}>
            <span className="material-symbols-outlined text-[18px]" translate="no">
              {isActivating ? 'bolt' : 'power_off'}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-on-surface">
              {specificMedidor
                ? (isActivating ? 'Medidor Reactivado' : 'Medidor Dado de Baja')
                : (isActivating ? 'Socio Reactivado' : 'Socio Suspendido')}
            </h4>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              {specificMedidor
                ? `El medidor ${specificMedidor.num_serie || 'Sin Serie'} ha sido ${isActivating ? 'reactivado' : 'dado de baja'} con éxito.`
                : `El socio ${user.nombre_razonsocial} ha sido ${isActivating ? 'reactivado' : 'suspendido'} con éxito.`}
            </p>
          </div>
          <button onClick={() => toast.dismiss(t)} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[16px]" translate="no">close</span>
          </button>
        </div>
      ), { duration: 5000, position: 'top-center' });
      refetchAll();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSavingToggle(false);
      setConfirmModal({ show: false, user: null, specificMedidor: null, isActivating: false });
    }
  }, [confirmModal, refetchAll]);

  const flattenedTenants = useMemo(() => {
    const flattened = [];
    tenants.forEach(tenant => {
      const medidores = tenant.parsedMedidores || [];
      if (medidores.length === 0) {
        flattened.push({ ...tenant, specificMedidor: null });
      } else {
        medidores.forEach((m, index) => {
          flattened.push({ ...tenant, specificMedidor: m, medidorIndex: index });
        });
      }
    });
    return flattened;
  }, [tenants]);

  const filteredTenants = useMemo(() => {
    let result = flattenedTenants;

    // Filtro Estado
    if (filterEstado !== 'Todos') {
      const wantActivo = filterEstado === 'Activos';
      result = result.filter(t => {
        const isOperativo = t.specificMedidor
          ? (t.specificMedidor.operativo !== false && t.specificMedidor.operativo !== 0 && t.specificMedidor.operativo !== '0')
          : Boolean(t.es_activo);
        return isOperativo === wantActivo;
      });
    }

    // Filtro Rubro
    if (filterRubro !== 'Todos') {
      result = result.filter(t => (t.actividad_rubro || '').toLowerCase() === filterRubro.toLowerCase());
    }

    // Búsqueda en tiempo real local en la tabla
    const term = searchQuery.trim().toLowerCase();
    if (!term) return result;

    return result.filter(t => {
      const socio = (t.nombre_razonsocial || '').toLowerCase();
      const username = (t.username || '').toLowerCase();
      const doc = (t.documento_identidad || '').toLowerCase();
      const direccion = (t.specificMedidor?.direccion || t.direccion || '').toLowerCase();
      const medidor = (t.specificMedidor?.num_serie || '').toLowerCase();
      const tipoMedidor = (t.specificMedidor?.tipo || '').toLowerCase();
      const telefono = (t.telefono || '').toLowerCase();
      const rubro = (t.actividad_rubro || '').toLowerCase();

      return socio.includes(term) ||
             username.includes(term) ||
             doc.includes(term) ||
             direccion.includes(term) ||
             medidor.includes(term) ||
             tipoMedidor.includes(term) ||
             telefono.includes(term) ||
             rubro.includes(term);
    });
  }, [flattenedTenants, searchQuery, filterEstado, filterRubro]);

  const onExportExcel = useCallback(() => exportToExcel(filteredTenants), [filteredTenants]);
  const onExportPDF = useCallback(async () => {
    setIsGeneratingPdf(true);
    const url = await generatePDFPreview(filteredTenants);
    if (url) setPdfBlobUrl(url);
    setIsGeneratingPdf(false);
  }, [filteredTenants]);

  return (
    <>
      <LoadingCurtain
        isOpen={isLoading && tenants.length === 0}
        title="Cargando el directorio"
        subtitle="Consultando socios, medidores y estados de suministro."
      />
      <main className="p-4 md:p-6 space-y-4 max-w-[1600px] mx-auto w-full flex-grow">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 className="text-2xl text-on-surface font-bold leading-tight">Directorio de Socios</h2>
          <p className="text-sm text-on-surface-variant">Gestión de socios, conexiones eléctricas y estado de suministro.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">

          <button
            onClick={handleOpenNew}
            className="group px-4 py-2 bg-primary text-on-primary font-bold rounded-xl shadow-sm hover:shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:-translate-y-0.5 transition-transform" translate="no">add_circle</span>
            Nuevo Socio
          </button>
        </div>
      </div>

      <TenantKPICards globalStats={globalStats} />

      <TenantDirectory
        tenants={filteredTenants}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((current) => !current)}
        filterEstado={filterEstado}
        onEstadoChange={setFilterEstado}
        filterRubro={filterRubro}
        onRubroChange={setFilterRubro}
        onClearFilters={() => { setFilterEstado('Todos'); setFilterRubro('Todos'); }}
        onExportExcel={onExportExcel}
        onExportPDF={onExportPDF}
        isGeneratingPdf={isGeneratingPdf}
        onOpenDrawer={setDrawerTenant}
        onOpenMenu={handleOpenMenu}
        actionMenuKey={actionMenu?.key}
      />

      {/* --- Modals and Drawers --- */}

      {isModalOpen && (
        <TenantFormModal
          initialData={formData}
          onSubmit={handleRegister}
          isSubmitting={isSubmitting}
          editId={editId}
          onClose={() => {
            setIsModalOpen(false);
            setFormData(INITIAL_FORM);
            setEditId(null);
          }}
        />
      )}

      {isImportModalOpen && (
        <TenantImportModal
          onClose={() => setIsImportModalOpen(false)}
          onImportSuccess={() => {
            refetchAll();
          }}
        />
      )}

      {confirmModal.show && (
        <ConfirmActionModal
          title={
            confirmModal.specificMedidor
              ? (confirmModal.isActivating ? 'Reactivar Medidor' : 'Dar de Baja Medidor')
              : (confirmModal.isActivating ? 'Reactivar Socio' : 'Suspender Socio')
          }
          message={
            confirmModal.specificMedidor
              ? `¿Estás seguro de que deseas ${confirmModal.isActivating ? 'reactivar' : 'dar de baja'} el medidor ${confirmModal.specificMedidor?.num_serie || 'Sin Serie'} de ${confirmModal.user?.nombre_razonsocial}?`
              : `¿Estás seguro de que deseas ${confirmModal.isActivating ? 'reactivar' : 'suspender'} a ${confirmModal.user?.nombre_razonsocial}?`
          }
          warningText={
            !confirmModal.isActivating
              ? (confirmModal.specificMedidor
                  ? 'Mientras esté dado de baja, no aparecerá en la toma de lecturas ni se le emitirá facturación mensual.'
                  : 'El socio aparecerá como "Suspendido" en todo el sistema.')
              : undefined
          }
          confirmText={
            confirmModal.specificMedidor
              ? (confirmModal.isActivating ? 'Sí, reactivar medidor' : 'Sí, dar de baja')
              : (confirmModal.isActivating ? 'Sí, reactivar' : 'Sí, suspender')
          }
          isDestructive={!confirmModal.isActivating}
          isLoading={isSavingToggle}
          icon={confirmModal.isActivating ? 'bolt' : 'power_off'}
          onConfirm={executeToggleUser}
          onClose={() => setConfirmModal({ show: false, user: null, specificMedidor: null, isActivating: false })}
        />
      )}

      {resetPasswordModal.show && (
        <ConfirmActionModal
          title="Restablecer Contraseña"
          message={`¿Estás seguro de que deseas restablecer la contraseña de ${resetPasswordModal.tenant?.nombre_razonsocial}?`}
          warningText="Se asignará la clave temporal 123456. El socio deberá cambiarla después de ingresar a su cuenta."
          confirmText="Sí, restablecer clave"
          isDestructive={true}
          isLoading={isResettingPassword}
          icon="key"
          onConfirm={executeResetPassword}
          onClose={() => setResetPasswordModal({ show: false, tenant: null })}
        />
      )}

      {pdfBlobUrl && (
        <PdfPreviewModal
          pdfBlobUrl={pdfBlobUrl}
          onClose={() => setPdfBlobUrl(null)}
        />
      )}

      {drawerTenant && (
        <TenantDetailDrawer
          drawerTenant={drawerTenant}
          setDrawerTenant={setDrawerTenant}
          handleOpenEdit={handleOpenEdit}
        />
      )}

      {actionMenu && createPortal(
        <div className="dropdown-portal">
          <div
            className="fixed inset-0 z-[80]"
            onClick={() => setActionMenu(null)}
            onContextMenu={(e) => { e.preventDefault(); setActionMenu(null); }}
          />
          <div
            style={{
              top: actionMenu.top !== undefined ? `${actionMenu.top}px` : 'auto',
              bottom: actionMenu.bottom !== undefined ? `${actionMenu.bottom}px` : 'auto',
              right: `${actionMenu.right}px`,
            }}
            className="fixed z-[85] w-60 bg-white rounded-xl shadow-2xl border border-outline-variant/80 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del dropdown */}
            <div className="px-3.5 py-2 mb-1 border-b border-outline-variant/50 bg-surface-container-lowest">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Opciones de Socio</span>
              <p className="text-[11px] font-bold text-on-surface truncate mt-0.5">
                {actionMenu.tenant.nombre_razonsocial || 'Socio'}
              </p>
              {actionMenu.specificMedidor?.num_serie && (
                <span className="font-data-mono text-[9px] text-primary font-bold">
                  Medidor: {actionMenu.specificMedidor.num_serie}
                </span>
              )}
            </div>

            {/* Ver Expediente */}
            <button
              type="button"
              onClick={() => {
                const t = actionMenu.tenant;
                setActionMenu(null);
                setDrawerTenant(t);
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-primary" translate="no">visibility</span>
              <span>Ver Expediente</span>
            </button>

            {/* Enviar WhatsApp */}
            <button
              type="button"
              onClick={() => {
                const t = actionMenu.tenant;
                setActionMenu(null);
                handleWhatsApp(t);
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-[#25D366] shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.062-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              <span>Enviar WhatsApp</span>
            </button>

            {/* Restablecer Contraseña */}
            <button
              type="button"
              onClick={() => {
                const t = actionMenu.tenant;
                setActionMenu(null);
                handleResetPassword(t);
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary" translate="no">key</span>
              <span>Restablecer Clave</span>
            </button>

            {/* Editar Socio */}
            <button
              type="button"
              onClick={() => {
                const { tenant, specificMedidor } = actionMenu;
                setActionMenu(null);
                handleOpenEdit(tenant, specificMedidor);
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-600" translate="no">edit</span>
              <span>Editar Socio</span>
            </button>

            <div className="my-1 border-t border-outline-variant/50" />

            {/* Dar de Baja o Reactivar Servicio / Medidor */}
            <button
              type="button"
              onClick={() => {
                const { tenant, specificMedidor } = actionMenu;
                setActionMenu(null);
                toggleUserStatus(tenant, specificMedidor);
              }}
              className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                (actionMenu.specificMedidor
                  ? (actionMenu.specificMedidor.operativo !== false && actionMenu.specificMedidor.operativo !== 0 && actionMenu.specificMedidor.operativo !== '0')
                  : actionMenu.tenant.es_activo)
                  ? 'text-error hover:bg-error/10'
                  : 'text-primary hover:bg-primary/10'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]" translate="no">
                {(actionMenu.specificMedidor
                  ? (actionMenu.specificMedidor.operativo !== false && actionMenu.specificMedidor.operativo !== 0 && actionMenu.specificMedidor.operativo !== '0')
                  : actionMenu.tenant.es_activo) ? 'power_off' : 'bolt'}
              </span>
              <span>
                {actionMenu.specificMedidor
                  ? ((actionMenu.specificMedidor.operativo !== false && actionMenu.specificMedidor.operativo !== 0 && actionMenu.specificMedidor.operativo !== '0') ? 'Dar de Baja Medidor' : 'Reactivar Medidor')
                  : (actionMenu.tenant.es_activo ? 'Suspender Socio' : 'Reactivar Socio')}
              </span>
            </button>
          </div>
        </div>,
        document.body,
      )}
      </main>
    </>
  );
};

export default TenantsAndSectors;
