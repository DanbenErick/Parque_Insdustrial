import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';
import { useTenants } from './hooks/useTenants';

import { exportToExcel, generatePDFPreview } from './tenantExportService';
import TenantKPICards from './TenantKPICards';
import TenantTableRow from './TenantTableRow';
import TenantFormModal from './TenantFormModal';
import TenantDetailDrawer from './TenantDetailDrawer';
import TenantImportModal from './TenantImportModal';
import ConfirmActionModal from '../../components/ui/ConfirmActionModal';
import PdfPreviewModal from '../../components/ui/PdfPreviewModal';

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

  // Hook de React Query
  const { tenants, isLoadingTenants: isLoading, globalStats, refetchAll } = useTenants(searchQuery, filterEstado, filterRubro);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals / Drawers state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, user: null, isActivating: false });
  const [resetPasswordModal, setResetPasswordModal] = useState({ show: false, tenant: null });
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [drawerTenant, setDrawerTenant] = useState(null);

  const [isSavingToggle, setIsSavingToggle] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // En TenantsPage ya no necesitamos handleInputChange ni validateField manual, 
  // porque de eso se encarga react-hook-form en TenantFormModal.

  const handleSearchClick = () => {
    setCurrentPage(1);
    // React Query automáticamente re-fetchea cuando searchQuery, filterEstado o filterRubro cambian,
    // así que no necesitamos llamar a fetchTenants() manualmente aquí.
  };

  const handleRegister = async (data) => {
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
      toast.error(error.message || "Error al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = (tenant) => {
    setResetPasswordModal({ show: true, tenant });
  };

  const executeResetPassword = async () => {
    const tenant = resetPasswordModal.tenant;
    if (!tenant) return;
    
    setIsResettingPassword(true);
    try {
      const response = await api.post(`/usuarios/${tenant.id}/reset-password`);
      const { newPassword } = response.data;
      
      let phone = tenant.telefono?.replace(/\s+/g, '') || '';
      if (phone) {
        if (!phone.startsWith('+')) {
          if (phone.length === 9) phone = '51' + phone;
        } else {
          phone = phone.replace('+', '');
        }
        const msg = `Hola *${tenant.nombre_razonsocial}*, tu contraseña ha sido restablecida. Tu nueva clave de acceso al sistema es: *${newPassword}*. Te recomendamos cambiarla luego de ingresar.`;
        window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`, '_blank');
      } else {
        toast.success(`Contraseña restablecida. La nueva clave es: ${newPassword}`, { duration: 10000 });
      }
      setResetPasswordModal({ show: false, tenant: null });
    } catch (error) {
      toast.error('Error al restablecer contraseña');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleWhatsApp = (tenant) => {
    if (!tenant.telefono) return toast.error('El usuario no tiene número de teléfono registrado.');
    let phone = tenant.telefono.replace(/\s+/g, '');
    if (!phone.startsWith('+')) {
      if (phone.length === 9) phone = '51' + phone;
    } else {
      phone = phone.replace('+', '');
    }
    window.open(`https://api.whatsapp.com/send?phone=${phone}`, '_blank');
  };

  const handleOpenNew = () => {
    setEditId(null);
    setFormData(INITIAL_FORM);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tenant, specificMedidor) => {
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
  };

  const toggleUserStatus = (tenant) => {
    setConfirmModal({ show: true, user: tenant, isActivating: !tenant.es_activo });
  };

  const executeToggleUser = async () => {
    const { user, isActivating } = confirmModal;
    setIsSavingToggle(true);

    try {
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
      toast.custom((t) => (
        <div className="bg-surface border-l-4 border-outline-variant shadow-lg rounded-r-lg p-4 flex items-start gap-3 w-[350px] animate-in slide-in-from-top-5" style={{ borderLeftColor: isActivating ? '#059669' : '#d97706' }}>
          <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isActivating ? 'bg-[#059669]/10 text-[#059669]' : 'bg-amber-100 text-amber-700'}`}>
            <span className="material-symbols-outlined text-[18px]">
              {isActivating ? 'power' : 'power_off'}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-on-surface">
              {isActivating ? 'Conexión Reactivada' : 'Servicio Suspendido'}
            </h4>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              El suministro de <strong className="text-on-surface">{user.nombre_razonsocial}</strong> ha sido actualizado con éxito.
            </p>
          </div>
          <button onClick={() => toast.dismiss(t)} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ), { duration: 5000, position: 'top-center' });
      refetchAll();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSavingToggle(false);
      setConfirmModal({ show: false, user: null, isActivating: false });
    }
  };

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

  const filteredTenants = flattenedTenants;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTenants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);

  const onExportExcel = () => exportToExcel(filteredTenants);
  const onExportPDF = async () => {
    setIsGeneratingPdf(true);
    const url = await generatePDFPreview(filteredTenants);
    if (url) setPdfBlobUrl(url);
    setIsGeneratingPdf(false);
  };

  return (
    <main className={`p-4 md:p-6 space-y-4 max-w-[1600px] mx-auto w-full flex-grow transition-opacity duration-300 ${isLoading && tenants.length === 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
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
            <span className="material-symbols-outlined text-[20px] group-hover:-translate-y-0.5 transition-transform">add_circle</span>
            Nuevo Socio
          </button>
        </div>
      </div>

      <TenantKPICards globalStats={globalStats} />

      <section className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-md">
        {/* Cabecera Principal */}
        <div className="px-4 py-3 border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-surface-container-low">
          <div className="flex items-center">
            <h4 className="text-base text-on-surface font-bold">Socios Empadronados</h4>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
              <input
                type="text"
                placeholder="Buscar socio..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value === '') setTimeout(handleSearchClick, 100);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                className="pl-8 pr-3 py-1.5 h-8 border border-outline-variant rounded-md text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full md:w-48 bg-white transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 h-8 font-bold text-xs rounded-md transition-colors border ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container'}`}
            >
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              Filtros {(filterEstado !== 'Todos' || filterRubro !== 'Todos') && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-0.5"></span>}
            </button>

            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 h-8 bg-[#107C41]/10 text-[#107C41] hover:bg-[#107C41]/20 font-bold text-xs rounded-md transition-colors border border-[#107C41]/20"
            >
              <span className="material-symbols-outlined text-[16px]">table_view</span>
              Excel
            </button>
            <button
              onClick={onExportPDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 h-8 bg-error/10 text-error hover:bg-error/20 font-bold text-xs rounded-md transition-colors border border-error/20 disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[16px] ${isGeneratingPdf ? 'animate-spin' : ''}`}>
                {isGeneratingPdf ? 'sync' : 'picture_as_pdf'}
              </span>
              PDF
            </button>
          </div>
        </div>

        {/* Panel de Filtros Desplegable */}
        {showFilters && (
          <div className="px-lg py-sm border-b border-outline-variant bg-surface-container-lowest flex flex-wrap items-center gap-md animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-on-surface-variant">Estado:</span>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="border border-outline-variant rounded-lg font-body-sm text-body-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary px-3 py-1.5 cursor-pointer"
              >
                <option value="Todos">Todos los Estados</option>
                <option value="Activos">Solo Activos</option>
                <option value="Suspendidos">Suspendidos</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-on-surface-variant">Rubro:</span>
              <select
                value={filterRubro}
                onChange={(e) => setFilterRubro(e.target.value)}
                className="border border-outline-variant rounded-lg font-body-sm text-body-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary px-3 py-1.5 cursor-pointer"
              >
                <option value="Todos">Todos los Rubros</option>
                <option value="Metalmecánica">Metalmecánica</option>
                <option value="Alimentos">Alimentos</option>
                <option value="Logística">Logística</option>
                <option value="Textil">Textil</option>
                <option value="General">General</option>
              </select>
            </div>

            {(filterEstado !== 'Todos' || filterRubro !== 'Todos') && (
              <button
                onClick={() => { setFilterEstado('Todos'); setFilterRubro('Todos'); }}
                className="text-xs font-bold text-error hover:underline ml-auto flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
                Limpiar Filtros
              </button>
            )}
          </div>
        )}

        <div className="overflow-x-auto overflow-y-auto max-h-[500px] custom-scrollbar relative">
          <table className="w-full min-w-[900px] text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-10 shadow-sm bg-surface-container-lowest text-on-surface-variant text-[11px] uppercase tracking-wider">
              <tr className="border-b border-outline-variant">
                <th className="px-4 py-2 font-semibold bg-surface-container-lowest">Nombres / Documento</th>
                <th className="px-4 py-2 font-semibold bg-surface-container-lowest">Dirección</th>
                <th className="px-4 py-2 font-semibold bg-surface-container-lowest">Medidor</th>
                <th className="px-4 py-2 font-semibold bg-surface-container-lowest">Estado</th>
                <th className="px-4 py-2 font-semibold text-right bg-surface-container-lowest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50 bg-surface text-body-sm">
              {currentItems.map((tenant) => (
                <TenantTableRow
                  key={`${tenant.id}-${tenant.specificMedidor ? tenant.specificMedidor.id : 'none'}`}
                  tenant={tenant}
                  specificMedidor={tenant.specificMedidor}
                  onOpenDrawer={setDrawerTenant}
                  onOpenEdit={(t) => handleOpenEdit(t, tenant.specificMedidor)}
                  onToggleStatus={toggleUserStatus}
                  onWhatsApp={() => handleWhatsApp(tenant)}
                  onResetPassword={() => handleResetPassword(tenant)}
                />
              ))}
              {filteredTenants.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-on-surface-variant">No se encontraron socios registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="px-4 py-2 border-t border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-[11px] text-on-surface-variant font-medium">
            Mostrando {filteredTenants.length > 0 ? indexOfFirstItem + 1 : 0} a {Math.min(indexOfLastItem, filteredTenants.length)} de {filteredTenants.length} registros
          </span>
          {totalPages > 1 && (
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-md border border-outline-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[11px] font-bold flex items-center gap-0.5 text-on-surface"
              >
                <span className="material-symbols-outlined text-[14px]">chevron_left</span> Anterior
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                  .map((page, i, arr) => (
                    <React.Fragment key={page}>
                      {i > 0 && arr[i - 1] !== page - 1 && (
                        <span className="px-1 text-on-surface-variant text-[11px]">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-6 h-6 rounded-md text-[11px] font-bold transition-colors ${currentPage === page ? 'bg-primary text-white' : 'hover:bg-surface-container text-on-surface-variant'}`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-md border border-outline-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[11px] font-bold flex items-center gap-0.5 text-on-surface"
              >
                Siguiente <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </section>

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
          title={confirmModal.isActivating ? 'Reactivar Servicio' : 'Cortar Servicio'}
          message={`¿Estás seguro de que deseas ${confirmModal.isActivating ? 'reactivar' : 'cortar'} el servicio de ${confirmModal.user?.nombre_razonsocial}?`}
          warningText={!confirmModal.isActivating ? 'El socio aparecerá como "Suspendido / Cortado" en todo el sistema.' : undefined}
          confirmText={confirmModal.isActivating ? 'Sí, reactivar' : 'Sí, cortar'}
          isDestructive={!confirmModal.isActivating}
          isLoading={isSavingToggle}
          icon={confirmModal.isActivating ? 'bolt' : 'power_off'}
          onConfirm={executeToggleUser}
          onClose={() => setConfirmModal({ show: false, user: null, isActivating: false })}
        />
      )}

      {resetPasswordModal.show && (
        <ConfirmActionModal
          title="Restablecer Contraseña"
          message={`¿Estás seguro de que deseas restablecer la contraseña de ${resetPasswordModal.tenant?.nombre_razonsocial}?`}
          warningText="Se le asignará una nueva clave por defecto y, si tiene número de teléfono registrado, se abrirá WhatsApp automáticamente para notificarle."
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

    </main>
  );
};

export default TenantsAndSectors;
