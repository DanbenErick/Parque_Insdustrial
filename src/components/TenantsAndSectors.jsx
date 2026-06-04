import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';

const TenantsAndSectors = () => {
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, manzana: '', company: '', stats: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState({ show: false, user: null, isActivating: false });
  const [isSavingToggle, setIsSavingToggle] = useState(false);
  
  // PDF Viewer State
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Global Stats para KPIs
  const [globalStats, setGlobalStats] = useState({ total: 0, activos: 0, inactivos: 0 });

  // Nuevos Estados Premium
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterRubro, setFilterRubro] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [editId, setEditId] = useState(null);
  const [drawerTenant, setDrawerTenant] = useState(null);

  // Form State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [formData, setFormData] = useState({
    nombre_razonsocial: '',
    documento_identidad: '',
    direccion: '',
    actividad: '', 
    correo: '',
    telefono: '',
    clave_acceso: '',
    medidores: [{ num_serie: '', tipo: 'Normal' }]
  });

  const [errors, setErrors] = useState({});

  // Función de validación por campo
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

  // Funciones del Tooltip
  const handleMouseEnter = (e, manzana, company, stats) => {
    setTooltip({
      show: true,
      x: e.clientX + 15,
      y: e.clientY + 15,
      manzana,
      company,
      stats: stats ? `Consumo/Estado: ${stats}` : 'Estado: Disponible'
    });
  };

  const handleMouseMove = (e) => {
    setTooltip(prev => ({ ...prev, x: e.clientX + 15, y: e.clientY + 15 }));
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, show: false }));
  };

  const fetchTenants = async (query = searchQuery, estado = filterEstado, rubro = filterRubro) => {
    try {
      setIsLoading(true);
      let url = `/usuarios?rol_id=3`;
      if (query.trim()) url += `&search=${encodeURIComponent(query.trim())}`;
      if (estado !== 'Todos') url += `&estado=${estado === 'Activos' ? 'activos' : 'suspendidos'}`;
      if (rubro !== 'Todos') url += `&rubro=${encodeURIComponent(rubro)}`;
        
      const response = await api.get(url);
      const propietarios = response.data.map(tenant => {
        let parsedMedidores = [];
        try {
          if (tenant.medidores) {
            const parsed = JSON.parse(tenant.medidores);
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].num_serie) {
              parsedMedidores = parsed;
            }
          }
        } catch (e) {}
        return { ...tenant, parsedMedidores };
      });
      setTenants(propietarios);

      // Si no hay búsqueda ni filtros, actualizamos las estadísticas globales
      if (!query.trim() && estado === 'Todos' && rubro === 'Todos') {
        try {
          const statsRes = await api.get('/usuarios/stats?rol_id=3');
          setGlobalStats({
            total: parseInt(statsRes.data.total) || 0,
            activos: parseInt(statsRes.data.activos) || 0,
            inactivos: parseInt(statsRes.data.inactivos) || 0
          });
        } catch (e) {
          console.error("Error al obtener stats:", e);
        }
      }
    } catch (error) {
      console.error("Error al obtener propietarios:", error);
      toast.error("No se pudieron cargar los propietarios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
    setCurrentPage(1);
  }, [filterEstado, filterRubro]); // Se ejecuta al inicio y cuando cambian los filtros

  const handleSearchClick = () => {
    fetchTenants(searchQuery);
    setCurrentPage(1);
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.substring(0, 2).toUpperCase();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let finalValue = value;
    // Limitar caracteres
    if (name === 'documento_identidad') {
      finalValue = value.replace(/\D/g, '').slice(0, 11);
    } else if (name === 'telefono') {
      finalValue = value.replace(/\D/g, '').slice(0, 9);
    } else if (name === 'clave_acceso') {
      finalValue = value.slice(0, 6);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    
    // Validar en tiempo real
    const errorMsg = validateField(name, finalValue);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { nombre_razonsocial, documento_identidad, direccion, actividad, cargo_representante, correo, telefono } = formData;

    if (!nombre_razonsocial || !documento_identidad || !direccion || !actividad || !cargo_representante || !correo || !telefono) {
      return toast.error("Todos los campos de la empresa y del representante son obligatorios.");
    }

    if (!editId && (!formData.medidores || formData.medidores.length === 0 || !formData.medidores[0].num_serie)) {
      return toast.error("El número de serie del medidor es obligatorio para nuevos miembros.");
    }

    if (formData.documento_identidad.length !== 8 && formData.documento_identidad.length !== 11) {
      return toast.error("El documento debe ser DNI (8 dígitos) o RUC (11 dígitos).");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        rol_id: 3,
        actividad_rubro: formData.actividad
      };
      
      if (!editId) {
        payload.clave_acceso = formData.clave_acceso || '123456';
        await api.post('/usuarios', payload);
        toast.success("Propietario registrado exitosamente.");
      } else {
        if (!formData.clave_acceso) delete payload.clave_acceso;
        await api.put(`/usuarios/${editId}`, payload);
        toast.success("Propietario actualizado exitosamente.");
      }

      setIsModalOpen(false);
      setFormData({
        nombre_razonsocial: '', documento_identidad: '', direccion: '', actividad: '',
        cargo_representante: '', correo: '', telefono: '', clave_acceso: '', medidores: [{ num_serie: '', tipo: 'Normal' }]
      });
      setErrors({});
      fetchTenants();
    } catch (error) {
      toast.error(error.response?.data?.error || "Error al registrar propietario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserStatus = (tenant) => {
    setConfirmModal({ show: true, user: tenant, isActivating: !tenant.es_activo });
  };

  const handleOpenNew = () => {
    setEditId(null);
    setFormData({
      nombre_razonsocial: '', documento_identidad: '', direccion: '', actividad: '',
      cargo_representante: '', correo: '', telefono: '', clave_acceso: '', medidores: [{ num_serie: '', tipo: 'Normal' }]
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tenant) => {
    setEditId(tenant.id);
    let parsedMedidores = [{ num_serie: '', tipo: 'Normal' }];
    try {
      if (tenant.medidores) {
        const parsed = JSON.parse(tenant.medidores);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].num_serie) {
          parsedMedidores = parsed;
        }
      }
    } catch (e) {}

    setFormData({
      nombre_razonsocial: tenant.nombre_razonsocial,
      documento_identidad: tenant.documento_identidad,
      direccion: tenant.direccion || '',
      actividad: tenant.actividad_rubro || '',
      cargo_representante: tenant.cargo_representante || '',
      correo: tenant.correo || '',
      telefono: tenant.telefono || '',
      clave_acceso: '', // vacío para no cambiarla
      medidores: parsedMedidores
    });
    setErrors({});
    setIsModalOpen(true);
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
      toast.success(isActivating ? 'Conexión reactivada' : 'Servicio cortado exitosamente');
      fetchTenants();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSavingToggle(false);
      setConfirmModal({ show: false, user: null, isActivating: false });
    }
  };

  // Helper para buscar tenant por sector
  const getTenant = (sectorId) => tenants.find(t => t.direccion === sectorId);

  const filteredTenants = tenants;

  // Lógica de Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTenants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);

  const handleExportExcel = () => {
    if (filteredTenants.length === 0) {
      return toast.warning('No hay datos para exportar');
    }

    try {
      const data = filteredTenants.map(t => ({
        'Nombre de Empresa': t.nombre_razonsocial,
        'RUC': t.documento_identidad,
        'Dirección': t.direccion || 'N/A',
        'Actividad / Cargo': t.cargo_representante || 'General',
        'Estado': t.es_activo ? 'Activo' : 'Suspendido / Cortado'
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Propietarios');
      XLSX.writeFile(workbook, `Propietarios_Empadronados_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Excel descargado exitosamente');
    } catch (error) {
      toast.error('Error al exportar a Excel');
    }
  };

  const handleExportPDF = async () => {
    if (filteredTenants.length === 0) {
      return toast.warning('No hay datos para exportar');
    }

    try {
      setIsGeneratingPdf(true);
      const doc = new jsPDF({ orientation: 'landscape' });
      
      // Load Logo.png to Base64
      let logoData = null;
      let logoRatio = 1;
      try {
        const res = await fetch('/logo.png');
        const blob = await res.blob();
        logoData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        
        // Obtener dimensiones reales para evitar que se achate
        logoRatio = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img.width / img.height);
          img.src = logoData;
        });
      } catch (e) {
        console.warn("No se pudo cargar el logo", e);
      }
      
      // Colores corporativos
      const primaryColor = [0, 51, 102]; // Azul Marino corporativo muy elegante
      
      // Cabecera Blanca Limpia (Membrete)
      let titleStartX = 14;
      if (logoData) {
        // Fijamos un alto de 16 y calculamos el ancho proporcional
        const targetHeight = 16;
        const calcWidth = targetHeight * logoRatio;
        doc.addImage(logoData, 'PNG', 14, 10, calcWidth, targetHeight);
        titleStartX = 14 + calcWidth + 8; // Dejar 8 puntos de separación
      }
      
      // Título Principal
      doc.setFontSize(22);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text('PARQUE INDUSTRIAL JICAMARCA', titleStartX, 20);
      
      // Subtítulo
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFont("helvetica", "normal");
      doc.text('Directorio Oficial de Miembros y Propietarios', titleStartX, 26);

      // Fecha y Datos de Cabecera (Alineados a la derecha)
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generado el: ${new Date().toLocaleString('es-PE')}`, 282, 20, { align: 'right' });
      doc.text(`Total Registros: ${filteredTenants.length}`, 282, 26, { align: 'right' });
      
      // Generación de Tabla con AutoTable
      autoTable(doc, {
        startY: 38,
        head: [['Empresa / Razón Social', 'RUC / DNI', 'Representante', 'Rubro', 'Dirección', 'Estado']],
        body: filteredTenants.map(t => [
          t.nombre_razonsocial,
          t.documento_identidad,
          t.cargo_representante || 'Sin asignar',
          t.actividad_rubro || 'General',
          t.direccion || 'N/A',
          t.es_activo ? 'ACTIVO' : 'SUSPENDIDO'
        ]),
        styles: {
          font: 'helvetica',
          fontSize: 9,
          cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
          minCellHeight: 0,
          textColor: [51, 65, 85], // slate-700
          lineColor: [226, 232, 240], // slate-200
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 55, fontStyle: 'bold' },
          1: { cellWidth: 30, fontStyle: 'bold', halign: 'center' },
          2: { cellWidth: 50 },
          3: { cellWidth: 35, halign: 'center' },
          4: { cellWidth: 'auto' },
          5: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: function (data) {
          // Pintar la columna de estado (Activo = Verde, Suspendido = Rojo)
          if (data.section === 'body' && data.column.index === 5) {
            if (data.cell.raw === 'ACTIVO') {
              data.cell.styles.textColor = [22, 163, 74]; // green-600
            } else {
              data.cell.styles.textColor = [220, 38, 38]; // red-600
            }
          }
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252] // slate-50 (Gris muy claro)
        },
        margin: { top: 38, left: 14, right: 14, bottom: 20 },
        // Footer de la página
        didDrawPage: function (data) {
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184); // slate-400
          doc.setFont("helvetica", "italic");
          
          doc.text(`Página ${data.pageNumber}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
          doc.text('Documento Confidencial - Uso Interno Exclusivo', doc.internal.pageSize.width - data.settings.margin.right, doc.internal.pageSize.height - 10, { align: 'right' });
        }
      });
      
      // En lugar de descargar, generamos un Blob URL para el iframe
      const blobUrl = doc.output('bloburl');
      setPdfBlobUrl(blobUrl);
      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <main className={`p-4 md:p-xl space-y-6 md:space-y-lg max-w-[1600px] mx-auto w-full flex-grow transition-opacity duration-300 ${isLoading && tenants.length === 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Directorio de Miembros y Conexiones</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Gestión de propietarios de predios, conexiones eléctricas y estado de suministro.</p>
        </div>
        <div className="flex flex-wrap gap-md">
          <div className="flex items-end">
            <button
              onClick={handleOpenNew}
              className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary font-semibold rounded-md hover:opacity-90 transition-all shadow-md h-[42px]"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span className="font-bold text-body-sm">Registrar Miembro</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {/* KPI 1: Total Miembros */}
        <div className="bg-white border border-outline-variant rounded-xl p-md shadow-sm flex items-center justify-between transition-transform hover:-translate-y-0.5 duration-200">
          <div className="space-y-1">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">Total de Miembros</p>
            <h3 className="font-data-mono text-headline-md text-on-surface font-bold">{globalStats.total}</h3>
            <p className="text-[11px] text-on-surface-variant">Propietarios empadronados</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[28px]">group</span>
          </div>
        </div>

        {/* KPI 2: Conexiones Activas */}
        <div className="bg-white border border-outline-variant rounded-xl p-md shadow-sm flex items-center justify-between transition-transform hover:-translate-y-0.5 duration-200">
          <div className="space-y-1">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">Conexiones Activas</p>
            <h3 className="font-data-mono text-headline-md text-green-600 font-bold">{globalStats.activos}</h3>
            <p className="text-[11px] text-on-surface-variant">Con suministro activo</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <span className="material-symbols-outlined text-[28px]">bolt</span>
          </div>
        </div>

        {/* KPI 3: Conexiones Suspendidas o Cortadas */}
        <div className="bg-white border border-outline-variant rounded-xl p-md shadow-sm flex items-center justify-between transition-transform hover:-translate-y-0.5 duration-200">
          <div className="space-y-1">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">Suspendidas / Cortadas</p>
            <h3 className="font-data-mono text-headline-md text-error font-bold">{globalStats.inactivos}</h3>
            <p className="text-[11px] text-on-surface-variant">Cortes o suspensiones de luz</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-[28px]">power_off</span>
          </div>
        </div>
      </div>

      {/* Active Members Table */}
      <section className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-md">
        {/* Cabecera Principal */}
        <div className="px-lg py-md border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-md bg-surface-container-low">
          <div className="flex items-center">
            <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Propietarios Empadronados</h4>
          </div>
          <div className="flex flex-wrap items-center gap-sm w-full lg:w-auto">
            {/* Buscador */}
            <div className="relative flex-grow md:flex-grow-0">
              <input
                type="text"
                placeholder="Buscar miembro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                className="pl-4 pr-10 py-2 border border-outline-variant rounded-lg font-body-sm text-body-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary w-full md:w-[260px] transition-all h-[38px]"
              />
              <button 
                onClick={handleSearchClick}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-8 h-8 rounded-md hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
              </button>
            </div>
            
            {/* Botón Filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-md py-2 font-bold text-sm rounded-lg transition-colors border h-[38px] ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container'}`}
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filtros {(filterEstado !== 'Todos' || filterRubro !== 'Todos') && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
            </button>

            {/* Botón Excel */}
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-md py-2 bg-[#107C41]/10 text-[#107C41] hover:bg-[#107C41]/20 font-bold text-sm rounded-lg transition-colors border border-[#107C41]/20 h-[38px]"
            >
              <span className="material-symbols-outlined text-[18px]">table_view</span>
              Excel
            </button>
            {/* Botón PDF */}
            <button 
              onClick={handleExportPDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-md py-2 bg-error/10 text-error hover:bg-error/20 font-bold text-sm rounded-lg transition-colors border border-error/20 h-[38px] disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[18px] ${isGeneratingPdf ? 'animate-spin' : ''}`}>
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
          <table className="w-full text-left zebra-table border-collapse">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-[11px] uppercase tracking-wider">
                <th className="px-lg py-sm font-bold bg-surface-container-low">Nombre de Empresa / Documento</th>
                <th className="px-lg py-sm font-bold bg-surface-container-low">Dirección</th>
                <th className="px-lg py-sm font-bold bg-surface-container-low">Medidor</th>
                <th className="px-lg py-sm font-bold bg-surface-container-low">Actividad / Cargo</th>
                <th className="px-lg py-sm font-bold bg-surface-container-low">Estado</th>
                <th className="px-lg py-sm font-bold text-right bg-surface-container-low">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-body-sm">
              {currentItems.map((tenant) => (
                <tr key={tenant.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group">
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-md">
                      <div 
                        className="w-9 h-9 rounded bg-primary-container/20 flex items-center justify-center text-primary font-bold text-xs cursor-pointer hover:bg-primary-container transition-colors"
                        onClick={() => setDrawerTenant(tenant)}
                        title="Ver Expediente"
                      >
                        {getInitials(tenant.nombre_razonsocial)}
                      </div>
                      <div className="flex flex-col">
                        <span 
                          className="font-semibold text-on-surface cursor-pointer hover:text-primary transition-colors"
                          onClick={() => setDrawerTenant(tenant)}
                        >
                          {tenant.nombre_razonsocial}
                        </span>
                        <span className="text-[11px] text-on-surface-variant font-data-mono mt-0.5">
                          {tenant.documento_identidad?.length === 8 ? 'DNI' : 'RUC'}: {tenant.documento_identidad}
                        </span>
                        {parseFloat(tenant.deuda_total) > 0 && (
                          <span className="text-[10px] font-bold text-error bg-error/10 px-2 py-0.5 rounded-sm w-fit mt-1 flex items-center gap-1 border border-error/20">
                            <span className="material-symbols-outlined text-[12px]">warning</span>
                            Deuda: S/ {parseFloat(tenant.deuda_total).toFixed(2)} ({tenant.recibos_pendientes})
                          </span>
                        )}
                        {parseFloat(tenant.saldo_a_favor) > 0 && (
                          <span className="text-[10px] font-bold text-[#059669] bg-[#059669]/10 px-2 py-0.5 rounded-sm w-fit mt-1 flex items-center gap-1 border border-[#059669]/20">
                            <span className="material-symbols-outlined text-[12px]">account_balance_wallet</span>
                            Saldo a Favor: S/ {parseFloat(tenant.saldo_a_favor).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-lg py-md font-data-mono text-on-surface-variant">{tenant.direccion || 'N/A'}</td>
                  <td className="px-lg py-md">
                    {tenant.parsedMedidores && tenant.parsedMedidores.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {tenant.parsedMedidores.map((m, i) => (
                          <span key={i} className="font-data-mono text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded border border-primary/20 w-fit">
                            {m.num_serie}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-on-surface-variant italic">Sin medidor</span>
                    )}
                  </td>
                  <td className="px-lg py-md">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[11px] font-bold uppercase">{tenant.actividad_rubro || 'General'}</span>
                    <span className="block text-xs text-on-surface-variant mt-1 font-semibold">{tenant.cargo_representante}</span>
                  </td>
                  <td className="px-lg py-md">
                    <span className={`flex items-center gap-2 text-[12px] font-semibold ${tenant.es_activo ? 'text-green-600' : 'text-error'}`}>
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {tenant.es_activo ? 'check_circle' : 'error'}
                      </span>
                      {tenant.es_activo ? 'Activo' : 'Suspendido / Cortado'}
                    </span>
                  </td>
                  <td className="px-lg py-md text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleOpenEdit(tenant)}
                        className="p-2 rounded-lg transition-colors text-blue-600 hover:bg-blue-50"
                        title="Editar Miembro"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button 
                        onClick={() => toggleUserStatus(tenant)}
                        className={`p-2 rounded-lg transition-colors ${tenant.es_activo ? 'text-error hover:bg-error/10' : 'text-primary hover:bg-primary/10'}`}
                        title={tenant.es_activo ? "Cortar Servicio" : "Reactivar Servicio"}
                      >
                        <span className="material-symbols-outlined text-[20px]">{tenant.es_activo ? 'power_off' : 'bolt'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTenants.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-lg py-xl text-center text-on-surface-variant">No se encontraron miembros registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginación e Información */}
        <div className="px-lg py-md border-t border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs text-on-surface-variant font-medium">
            Mostrando {filteredTenants.length > 0 ? indexOfFirstItem + 1 : 0} a {Math.min(indexOfLastItem, filteredTenants.length)} de {filteredTenants.length} registros
          </span>
          {totalPages > 1 && (
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-md border border-outline-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1 text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span> Anterior
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-md text-xs font-bold transition-colors ${currentPage === page ? 'bg-primary text-white' : 'hover:bg-surface-container text-on-surface-variant'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-md border border-outline-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1 text-on-surface"
              >
                Siguiente <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="fixed pointer-events-none bg-inverse-surface text-inverse-on-surface px-md py-sm rounded-lg text-body-sm shadow-xl z-[100] border border-outline"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="flex flex-col gap-1">
            <span className="font-data-mono text-primary-fixed-dim text-[10px]">{tooltip.manzana}</span>
            <span className="font-bold">{tooltip.company}</span>
            <span className="text-white/60 text-[11px]">{tooltip.stats}</span>
          </div>
        </div>
      )}

      {/* Nuevo Miembro Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-outline-variant flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-lg py-md border-b-0 bg-slate-800 text-white">
              <div>
              <h3 className="font-headline-sm text-headline-sm text-white font-bold">{editId ? 'Editar Propietario' : 'Registrar Nuevo Propietario'}</h3>
              <p className="font-body-sm text-body-sm text-white/80">{editId ? 'Modifique los datos comerciales o de contacto.' : 'Cree un nuevo registro corporativo y su usuario administrador.'}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-xs hover:bg-white/20 rounded-full transition-colors group"
              >
                <span className="material-symbols-outlined text-white/80 group-hover:text-white transition-colors">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-lg custom-scrollbar">
              <form className="space-y-lg" id="tenant-form" onSubmit={handleRegister}>
                {/* Section 1: Datos de la Empresa */}
                <div className="space-y-md">
                  <div className="flex items-center gap-sm text-primary">
                    <span className="material-symbols-outlined text-[20px]">factory</span>
                    <span className="font-label-caps text-label-caps font-bold">DATOS DE LA EMPRESA</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="flex flex-col gap-xs">
                      <label className="font-body-sm text-body-sm font-semibold text-on-surface-variant">Nombre o Razón Social *</label>
                      <input name="nombre_razonsocial" value={formData.nombre_razonsocial} onChange={handleInputChange} required className="border border-outline-variant rounded px-md py-sm font-body-md focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-all" placeholder="Ej. Alimentos del Sol S.A." type="text" />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-body-sm text-body-sm font-semibold text-on-surface-variant">RUC o DNI *</label>
                      <input name="documento_identidad" value={formData.documento_identidad} onChange={handleInputChange} required className={`border rounded px-md py-sm font-data-mono transition-all ${errors.documento_identidad ? 'border-error focus:border-error focus:ring-1 focus:ring-error/20 bg-error/5' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white'}`} placeholder="8 u 11 dígitos" type="text" />
                      {errors.documento_identidad && <span className="text-[11px] text-error font-bold">{errors.documento_identidad}</span>}
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-body-sm text-body-sm font-semibold text-on-surface-variant">Dirección *</label>
                      <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} required className="border border-outline-variant rounded px-md py-sm font-body-md focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-all" placeholder="Av. Principal, Mz A" />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-body-sm text-body-sm font-semibold text-on-surface-variant">Tipo de Actividad *</label>
                      <select name="actividad" value={formData.actividad} onChange={handleInputChange} required className="border border-outline-variant rounded px-md py-sm font-body-md focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-all appearance-none">
                        <option disabled value="">Seleccione rubro...</option>
                        <option value="Alimentos">Alimentos</option>
                        <option value="Manufactura">Manufactura</option>
                        <option value="Logística">Logística</option>
                        <option value="Químicos">Químicos</option>
                        <option value="Metalmecánica">Metalmecánica</option>
                        <option value="Textil">Textil</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-outline-variant/30"></div>

                {/* Section 2: Datos del Usuario Administrador */}
                <div className="space-y-md">
                  <div className="flex items-center gap-sm text-primary">
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    <span className="font-label-caps text-label-caps font-bold">DATOS DEL USUARIO (ADMINISTRADOR)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="flex flex-col gap-xs md:col-span-2">
                      <label className="font-body-sm text-body-sm font-semibold text-on-surface-variant">Nombre Completo del Representante *</label>
                      <input name="cargo_representante" value={formData.cargo_representante} onChange={handleInputChange} required className="border border-outline-variant rounded px-md py-sm font-body-md focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-all" placeholder="Nombre completo" type="text" />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-body-sm text-body-sm font-semibold text-on-surface-variant">Correo Electrónico *</label>
                      <input name="correo" value={formData.correo} onChange={handleInputChange} required className={`border rounded px-md py-sm font-body-md transition-all ${errors.correo ? 'border-error focus:border-error focus:ring-1 focus:ring-error/20 bg-error/5' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white'}`} placeholder="email@empresa.com" type="email" />
                      {errors.correo && <span className="text-[11px] text-error font-bold">{errors.correo}</span>}
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-body-sm text-body-sm font-semibold text-on-surface-variant">Teléfono de Contacto *</label>
                      <input name="telefono" value={formData.telefono} onChange={handleInputChange} required className={`border rounded px-md py-sm font-body-md transition-all ${errors.telefono ? 'border-error focus:border-error focus:ring-1 focus:ring-error/20 bg-error/5' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white'}`} placeholder="900 000 000" type="tel" />
                      {errors.telefono && <span className="text-[11px] text-error font-bold">{errors.telefono}</span>}
                    </div>
                    <div className="flex flex-col gap-xs md:col-span-2">
                      <div className="bg-surface-container-low p-md border-l-4 border-tertiary-container rounded">
                        <label className="font-body-sm text-body-sm font-semibold text-on-surface-variant flex items-center gap-xs">
                          Clave de Acceso al Sistema
                          <span className="material-symbols-outlined text-[16px]" title="Clave para que el usuario ingrese">info</span>
                        </label>
                        <input name="clave_acceso" value={formData.clave_acceso} onChange={handleInputChange} 
                          className={`mt-xs border rounded px-md py-sm font-data-mono w-full transition-all outline-none ${errors.clave_acceso ? 'border-error focus:border-error focus:ring-1 focus:ring-error/20 bg-error/5 text-error' : (formData.clave_acceso && formData.clave_acceso.length === 6 ? 'border-green-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-green-50 text-green-700 font-bold' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white')}`} 
                          placeholder="Ej. 123456" type="text" maxLength="6" />
                        {errors.clave_acceso && <p className="text-[11px] text-error mt-xs font-bold">{errors.clave_acceso}</p>}
                        {!errors.clave_acceso && <p className="text-[11px] text-on-surface-variant mt-xs italic">Dejar vacío para usar '123456'. Debe tener 6 caracteres.</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Datos del Medidor */}
                <>
                  <div className="h-[1px] bg-outline-variant/30"></div>
                  <div className="space-y-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-sm text-primary">
                        <span className="material-symbols-outlined text-[20px]">speed</span>
                        <span className="font-label-caps text-label-caps font-bold">MEDIDORES ASIGNADOS</span>
                      </div>
                      <button type="button" onClick={() => {
                        setFormData(prev => ({ ...prev, medidores: [...prev.medidores, { num_serie: '', tipo: 'Normal' }] }));
                      }} className="flex items-center gap-xs px-sm py-xs bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors font-bold text-[12px]">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Añadir Medidor
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-sm">
                      {formData.medidores.map((medidor, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-md p-md bg-surface-container-lowest rounded-lg border border-outline-variant relative">
                          {formData.medidores.length > 1 && (
                            <button type="button" onClick={() => {
                              const newMedidores = [...formData.medidores];
                              newMedidores.splice(index, 1);
                              setFormData(prev => ({ ...prev, medidores: newMedidores }));
                            }} className="absolute top-2 right-2 text-error hover:bg-error/10 p-xs rounded-full">
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                          )}
                          <div className="flex flex-col gap-xs md:col-span-7">
                            <label className="font-body-sm text-body-sm font-semibold text-on-surface-variant">Número de Serie {editId && index === 0 ? '' : '*'}</label>
                            <input value={medidor.num_serie} onChange={(e) => {
                              const newMedidores = [...formData.medidores];
                              newMedidores[index].num_serie = e.target.value;
                              setFormData(prev => ({ ...prev, medidores: newMedidores }));
                            }} required={!editId || index > 0} className="border border-outline-variant rounded px-md py-sm font-data-mono focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-all" placeholder="Ej. MED-00123" type="text" />
                          </div>
                          <div className="flex flex-col gap-xs md:col-span-5">
                            <label className="font-body-sm text-body-sm font-semibold text-on-surface-variant">Tipo de Medidor *</label>
                            <select value={medidor.tipo} onChange={(e) => {
                              const newMedidores = [...formData.medidores];
                              newMedidores[index].tipo = e.target.value;
                              setFormData(prev => ({ ...prev, medidores: newMedidores }));
                            }} required className="border border-outline-variant rounded px-md py-sm font-body-md focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-all appearance-none">
                              <option value="Normal">Normal</option>
                              <option value="Tiempo Real">Tiempo Real</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-xs italic">{editId ? 'Puede actualizar, eliminar o asignar medidores a este miembro.' : 'El registro de al menos un medidor es obligatorio al crear un nuevo miembro.'}</p>
                  </div>
                </>
              </form>
            </div>

            <div className="px-lg py-md bg-surface-container-high border-t border-outline-variant flex justify-between items-center">
              <p className="text-[12px] text-on-surface-variant max-w-[200px] leading-tight">
                El propietario quedará registrado en el directorio.
              </p>
              <div className="flex gap-md">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-lg py-sm border border-outline text-on-surface font-bold rounded-lg hover:bg-surface transition-colors active:scale-95 duration-150"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="tenant-form"
                  disabled={isSubmitting || Object.values(errors).some(e => e !== '')}
                  className="px-lg py-sm bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all duration-150 flex items-center gap-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  {isSubmitting ? 'Guardando...' : (editId ? 'Actualizar Registro' : 'Registrar Conexión')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Corte/Reactivación */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-md bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-outline-variant rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`px-lg py-md flex justify-between items-center border-b-0 ${confirmModal.isActivating ? 'bg-primary' : 'bg-error'}`}>
              <h3 className="font-headline-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-white">
                  {confirmModal.isActivating ? 'bolt' : 'power_off'}
                </span>
                {confirmModal.isActivating ? 'Reactivar Servicio' : 'Cortar Servicio'}
              </h3>
            </div>
            <div className="p-lg">
              <p className="text-on-surface-variant font-body-md">
                ¿Estás seguro de que deseas {confirmModal.isActivating ? 'reactivar' : 'cortar'} el servicio de <strong>{confirmModal.user?.nombre_razonsocial}</strong>?
              </p>
              {!confirmModal.isActivating && (
                <p className="text-xs text-error mt-2 font-bold">
                  El propietario aparecerá como "Suspendido / Cortado" en todo el sistema.
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
                disabled={isSavingToggle}
                className={`px-lg py-2 font-bold rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 ${confirmModal.isActivating ? 'bg-primary text-on-primary' : 'bg-error text-white'}`}
              >
                {isSavingToggle ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">
                    {confirmModal.isActivating ? 'check_circle' : 'warning'}
                  </span>
                )}
                {confirmModal.isActivating ? 'Sí, reactivar' : 'Sí, cortar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visor de PDF */}
      {pdfBlobUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="px-lg py-sm border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center text-error">
                  <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                </div>
                <h3 className="font-headline-sm font-bold text-on-surface">Visor de Reporte PDF</h3>
              </div>
              <div className="flex gap-2">
                <a 
                  href={pdfBlobUrl} 
                  download={`Directorio_PIJ_${new Date().toISOString().slice(0, 10)}.pdf`}
                  className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Descargar PDF
                </a>
                <button 
                  onClick={() => {
                    setPdfBlobUrl(null);
                  }} 
                  className="p-2 hover:bg-error/10 hover:text-error text-on-surface-variant rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                  Cerrar
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe 
                src={`${pdfBlobUrl}#toolbar=0`} 
                className="w-full h-full border-none"
                title="Reporte PDF"
              />
            </div>
          </div>
        </div>
      )}

      {/* Drawer del Expediente del Miembro */}
      <AnimatePresence>
        {drawerTenant && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" 
              onClick={() => setDrawerTenant(null)} 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-surface shadow-2xl z-[110] flex flex-col border-l border-outline-variant"
            >
              {/* Header del Drawer */}
              <div className="px-lg py-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">contact_page</span>
                  <h3 className="font-headline-sm font-bold text-on-surface">Expediente Oficial</h3>
                </div>
                <button onClick={() => setDrawerTenant(null)} className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            
            {/* Cuerpo del Drawer */}
            <div className="flex-1 overflow-y-auto p-lg custom-scrollbar space-y-6">
               {/* Perfil Principal */}
               <div className="flex flex-col items-center text-center space-y-3 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
                 <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center text-primary font-bold text-2xl shadow-inner">
                   {getInitials(drawerTenant.nombre_razonsocial)}
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-on-surface">{drawerTenant.nombre_razonsocial}</h2>
                   <p className="font-data-mono text-sm text-on-surface-variant mt-1">RUC/DNI: {drawerTenant.documento_identidad}</p>
                 </div>
                 <div className="flex items-center gap-2 mt-2">
                   <span className={`px-3 py-1 rounded-full text-xs font-bold border ${drawerTenant.es_activo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-error border-red-200'}`}>
                     {drawerTenant.es_activo ? 'CONEXIÓN ACTIVA' : 'SERVICIO SUSPENDIDO'}
                   </span>
                   <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 uppercase">
                     {drawerTenant.actividad_rubro || 'GENERAL'}
                   </span>
                 </div>
               </div>

               {/* Situación Financiera */}
               <div className="space-y-3">
                 <h4 className="text-sm font-label-caps font-bold text-on-surface-variant uppercase flex items-center gap-2">
                   <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                   Situación Financiera
                 </h4>
                 <div className={`p-4 rounded-xl border ${parseFloat(drawerTenant.deuda_total) > 0 ? 'bg-error/5 border-error/20' : 'bg-green-50 border-green-200'}`}>
                   <div className="flex justify-between items-center">
                     <div>
                       <p className={`text-sm font-semibold ${parseFloat(drawerTenant.deuda_total) > 0 ? 'text-error' : 'text-green-700'}`}>
                         {parseFloat(drawerTenant.deuda_total) > 0 ? 'Deuda Pendiente' : 'Al Día (Sin Deuda)'}
                       </p>
                       {parseFloat(drawerTenant.deuda_total) > 0 && (
                         <p className="text-xs text-on-surface-variant mt-1">
                           {drawerTenant.recibos_pendientes} recibo(s) sin pagar
                         </p>
                       )}
                     </div>
                     <div className={`text-2xl font-data-mono font-bold ${parseFloat(drawerTenant.deuda_total) > 0 ? 'text-error' : 'text-green-700'}`}>
                       S/ {parseFloat(drawerTenant.deuda_total || 0).toFixed(2)}
                     </div>
                   </div>
                 </div>
               </div>

               {/* Datos de Contacto y Representación */}
               <div className="space-y-3">
                 <h4 className="text-sm font-label-caps font-bold text-on-surface-variant uppercase flex items-center gap-2">
                   <span className="material-symbols-outlined text-[18px]">badge</span>
                   Contacto y Representación
                 </h4>
                 <div className="bg-white rounded-xl border border-outline-variant divide-y divide-outline-variant shadow-sm">
                   <div className="p-3 flex items-start gap-3">
                     <span className="material-symbols-outlined text-on-surface-variant mt-0.5">person</span>
                     <div>
                       <p className="text-xs text-on-surface-variant font-medium">Representante Legal</p>
                       <p className="text-sm font-semibold text-on-surface">{drawerTenant.cargo_representante || 'No registrado'}</p>
                     </div>
                   </div>
                   <div className="p-3 flex items-start gap-3">
                     <span className="material-symbols-outlined text-on-surface-variant mt-0.5">call</span>
                     <div>
                       <p className="text-xs text-on-surface-variant font-medium">Teléfono Principal</p>
                       <p className="text-sm font-semibold text-on-surface">{drawerTenant.telefono || 'No registrado'}</p>
                     </div>
                   </div>
                   <div className="p-3 flex items-start gap-3">
                     <span className="material-symbols-outlined text-on-surface-variant mt-0.5">mail</span>
                     <div>
                       <p className="text-xs text-on-surface-variant font-medium">Correo Electrónico</p>
                       <p className="text-sm font-semibold text-on-surface">{drawerTenant.correo || 'No registrado'}</p>
                     </div>
                   </div>
                   <div className="p-3 flex items-start gap-3">
                     <span className="material-symbols-outlined text-on-surface-variant mt-0.5">location_on</span>
                     <div>
                       <p className="text-xs text-on-surface-variant font-medium">Ubicación del Predio</p>
                       <p className="text-sm font-semibold text-on-surface">{drawerTenant.direccion || 'No registrado'}</p>
                     </div>
                   </div>
                 </div>
               </div>
               
            </div>
            
            {/* Footer del Drawer */}
              <div className="p-lg border-t border-outline-variant bg-surface-container-lowest">
                <button 
                  onClick={() => {
                    setDrawerTenant(null);
                    handleOpenEdit(drawerTenant);
                  }}
                  className="w-full py-3 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-lg font-bold flex justify-center items-center gap-2 border border-primary/20"
                >
                  <span className="material-symbols-outlined">edit</span>
                  Editar Datos del Propietario
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </main>
  );
};

export default TenantsAndSectors;
