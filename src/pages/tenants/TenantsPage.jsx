import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';

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
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Drawers state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, user: null, isActivating: false });
  const [drawerTenant, setDrawerTenant] = useState(null);

  const [isSavingToggle, setIsSavingToggle] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [globalStats, setGlobalStats] = useState({ total: 0, activos: 0, inactivos: 0 });

  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterRubro, setFilterRubro] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);

  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Validación
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'documento_identidad':
        if (value && value.length !== 8 && value.length !== 11) {
          error = 'Debe tener 8 (DNI) u 11 (RUC) dígitos.';
        }
        break;
      case 'telefono':
        if (value && value.length !== 9) {
          error = 'El celular debe tener 9 dígitos.';
        }
        break;
      case 'correo':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Ingrese un correo electrónico válido.';
        }
        break;
      case 'clave_acceso':
        if (value && value.length !== 6) {
          error = 'La clave debe ser de 6 caracteres.';
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'documento_identidad') {
      finalValue = value.replace(/\D/g, '').slice(0, 11);
    } else if (name === 'telefono') {
      finalValue = value.replace(/\D/g, '').slice(0, 9);
    } else if (name === 'clave_acceso') {
      finalValue = value.slice(0, 6);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, finalValue) }));
  };

  const fetchTenants = async (query = searchQuery, estado = filterEstado, rubro = filterRubro) => {
    try {
      setIsLoading(true);
      let url = `/usuarios?rol_id=3`;
      if (query.trim()) url += `&search=${encodeURIComponent(query.trim())}`;
      if (estado !== 'Todos') url += `&estado=${estado === 'Activos' ? 'activos' : 'suspendidos'}`;
      if (rubro !== 'Todos') url += `&rubro=${encodeURIComponent(rubro)}`;

      const response = await api.get(url);
      // Backend may return { data: [...], meta: {...} } or [...] directly
      const rawData = Array.isArray(response.data) ? response.data : (response.data?.data || []);

      const socios = rawData.map(tenant => {
        let parsedMedidores = [];
        try {
          if (tenant.medidores) {
            const parsed = JSON.parse(tenant.medidores);
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].num_serie) {
              parsedMedidores = parsed;
            }
          }
        } catch { /* medidores column may contain malformed JSON — silently skip */ }
        return { ...tenant, parsedMedidores };
      });
      setTenants(socios);

      if (!query.trim() && estado === 'Todos' && rubro === 'Todos') {
        try {
          const statsRes = await api.get('/usuarios/stats?rol_id=3');
          setGlobalStats({
            total: parseInt(statsRes.data.total) || 0,
            activos: parseInt(statsRes.data.activos) || 0,
            inactivos: parseInt(statsRes.data.inactivos) || 0,
            medidores_normal: parseInt(statsRes.data.medidores_normal) || 0,
            medidores_tiempo_real: parseInt(statsRes.data.medidores_tiempo_real) || 0,
            socios_sin_medidor: parseInt(statsRes.data.socios_sin_medidor) || 0
          });
        } catch {
          // Stats are non-critical — silently skip if endpoint fails
        }
      }
    } catch (error) {
      console.error("Error al obtener socios:", error);
      toast.error(`No se pudieron cargar los socios: ${error?.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
    setCurrentPage(1);
  }, [filterEstado, filterRubro]);

  const handleSearchClick = () => {
    fetchTenants(searchQuery);
    setCurrentPage(1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { nombre_razonsocial, documento_identidad, telefono } = formData;

    if (!nombre_razonsocial || !documento_identidad || !telefono) {
      return toast.error("Por favor complete los campos obligatorios del socio (Nombre, DNI y Teléfono).");
    }

    if (!editId && (!formData.medidores || formData.medidores.length === 0 || (!formData.medidores[0].num_serie && formData.medidores[0].tipo !== 'Sin Medidor'))) {
      return toast.error("El número de serie del medidor es obligatorio para nuevos socios (a menos que indique 'Sin Medidor').");
    }

    if (formData.documento_identidad.length !== 8 && formData.documento_identidad.length !== 11) {
      return toast.error("El documento debe ser DNI (8 dígitos) o RUC (11 dígitos).");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        cargo_representante: formData.nombre_razonsocial, // backend fallback
        direccion: formData.medidores.length > 0 && formData.medidores[0].direccion ? formData.medidores[0].direccion : '-', // backend fallback
        rol_id: 3,
        actividad_rubro: formData.actividad || 'General'
      };

      if (!editId) {
        payload.clave_acceso = '000000';
        await api.post('/usuarios', payload);
        toast.success("Socio registrado exitosamente.");
      } else {
        if (!formData.clave_acceso) delete payload.clave_acceso;
        await api.put(`/usuarios/${editId}`, payload);
        toast.success("Socio actualizado exitosamente.");
      }

      setIsModalOpen(false);
      setFormData(INITIAL_FORM);
      setErrors({});
      fetchTenants();
    } catch (error) {
      toast.error(error.response?.data?.error || "Error al registrar socio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenNew = () => {
    setEditId(null);
    setFormData(INITIAL_FORM);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tenant) => {
    setEditId(tenant.id);
    let parsedMedidores = [{ num_serie: '', tipo: 'Normal', direccion: tenant.direccion || '' }];
    try {
      if (tenant.medidores) {
        const parsed = JSON.parse(tenant.medidores);
        if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0].num_serie || parsed[0].tipo === 'Sin Medidor')) {
          parsedMedidores = parsed.map(m => ({
            ...m,
            direccion: m.direccion || tenant.direccion || '' // Fallback a la dirección antigua del tenant
          }));
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
      fetchTenants();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSavingToggle(false);
      setConfirmModal({ show: false, user: null, isActivating: false });
    }
  };

  const filteredTenants = tenants;
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
                <th className="px-4 py-2 font-semibold bg-surface-container-lowest">Nombresß / Documento</th>
                <th className="px-4 py-2 font-semibold bg-surface-container-lowest">Dirección</th>
                <th className="px-4 py-2 font-semibold bg-surface-container-lowest">Medidor</th>
                <th className="px-4 py-2 font-semibold bg-surface-container-lowest">Estado</th>
                <th className="px-4 py-2 font-semibold text-right bg-surface-container-lowest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50 bg-surface text-body-sm">
              {currentItems.map((tenant) => (
                <TenantTableRow
                  key={tenant.id}
                  tenant={tenant}
                  onOpenDrawer={setDrawerTenant}
                  onOpenEdit={handleOpenEdit}
                  onToggleStatus={toggleUserStatus}
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
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          handleInputChange={handleInputChange}
          handleRegister={handleRegister}
          isSubmitting={isSubmitting}
          editId={editId}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isImportModalOpen && (
        <TenantImportModal
          onClose={() => setIsImportModalOpen(false)}
          onImportSuccess={() => {
            fetchTenants();
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
