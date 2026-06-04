import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'sonner';

const ReceiptDetail = ({ receiptId, onClose }) => {
  const [searchParams] = useSearchParams();
  const id = receiptId || searchParams.get('id');
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (onClose) {
      handleClose();
    } else if (location.state && location.state.from) {
      navigate(location.state.from);
    } else {
      navigate('/billing');
    }
  };

  const [recibo, setRecibo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [pagosHistorial, setPagosHistorial] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 250); // Matches the duration-300 but slight overlap
  };
  
  // State for form
  const [cargos, setCargos] = useState({
    multa_manipulacion: 0,
    cargo_corte: 0,
    multa_reconexion: 0,
    instalacion_medidor: 0,
    deuda_vencida: 0,
    descuento: 0,
    motivo_descuento: ''
  });
  
  const [tarifasGlobales, setTarifasGlobales] = useState({ monto_multa_base: 50 });
  const [tipoMulta, setTipoMulta] = useState('ninguna'); // ninguna, estandar, personalizada

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchReceiptDetail = async () => {
      try {
        setIsLoading(true);
        const [res, configRes] = await Promise.all([
          api.get(`/recibos/${id}`),
          api.get('/config')
        ]);
        
        const r = res.data.recibo;
        setRecibo(r);
        setHistorial(res.data.historial || []);
        setPagosHistorial(res.data.pagos_historial || []);
        
        const baseMulta = configRes.data.monto_multa_base || 50;
        setTarifasGlobales({ monto_multa_base: baseMulta });
        
        setCargos({
          multa_manipulacion: r.multa_manipulacion || 0,
          cargo_corte: r.cargo_corte || 0,
          multa_reconexion: r.multa_reconexion || 0,
          instalacion_medidor: r.instalacion_medidor || 0,
          deuda_vencida: r.deuda_vencida || 0,
          descuento: r.descuento || 0,
          motivo_descuento: r.motivo_descuento || ''
        });
        
        if (r.multa_manipulacion > 0) {
          if (parseFloat(r.multa_manipulacion) === parseFloat(baseMulta)) {
            setTipoMulta('estandar');
          } else {
            setTipoMulta('personalizada');
          }
        }
      } catch (err) {
        console.error('Error fetching receipt detail:', err);
        toast.error('Error al cargar el detalle del recibo');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceiptDetail();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!id || !recibo) return;
    try {
      const response = await api.get(`/recibos/${id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recibo_${recibo.numero_comprobante || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar el PDF');
    }
  };

  const handleSaveCargos = async (e) => {
    e.preventDefault();
    if (cargos.descuento > 0 && !cargos.motivo_descuento.trim()) {
      return toast.error('Debes ingresar un sustento/motivo para aplicar el descuento.');
    }
    
    setIsSaving(true);
    try {
      // Ajustar la multa antes de guardar según el tipo seleccionado
      let payload = { ...cargos };
      if (tipoMulta === 'ninguna') payload.multa_manipulacion = 0;
      else if (tipoMulta === 'estandar') payload.multa_manipulacion = tarifasGlobales.monto_multa_base;
      
      const res = await api.put(`/recibos/${id}/cargos`, payload);
      toast.success('Cargos y descuentos actualizados');
      setIsEditModalOpen(false);
      // Reload receipt data
      const resData = await api.get(`/recibos/${id}`);
      setRecibo(resData.data.recibo);
    } catch (error) {
      toast.error('Error al actualizar cargos');
    } finally {
      setIsSaving(false);
    }
  };

  const formatPeriodo = (p) => {
    if (!p) return '-';
    // If format is YYYY-MM
    if (p.includes('-')) {
      const [anio, mes] = p.split('-');
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      return `${meses[parseInt(mes) - 1] || mes} ${anio}`;
    }
    return p;
  };

  const renderLoading = () => (
    <div className="flex-grow flex items-center justify-center bg-background min-h-[50vh]">
      <div className="flex flex-col items-center gap-md">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
        <p className="text-body-md text-on-surface-variant font-medium">Cargando detalle del recibo...</p>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="flex-grow flex flex-col items-center justify-center bg-background min-h-[50vh] gap-md p-lg">
      <span className="material-symbols-outlined text-error text-[48px]">warning</span>
      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Recibo no encontrado</h3>
      <p className="text-body-sm text-on-surface-variant max-w-sm text-center">
        No se ha especificado un ID de recibo válido o el recibo solicitado no existe en el sistema.
      </p>
      <button 
        onClick={handleBack} 
        className="mt-md px-lg py-sm bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-xs shadow-sm"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Regresar
      </button>
    </div>
  );

  // Helpers
  const formatDayMonth = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  const renderContent = () => {
    if (isLoading) return renderLoading();
    if (!id || !recibo) return renderError();

    const totalMantenimiento = parseFloat(recibo.cargo_mantenimiento || 0);
    let cargoFijo = 0;
    let mantenimientoRed = 0;
    let alumbrado = 0;

    if (totalMantenimiento >= 229.50) {
      cargoFijo = 45.00;
      alumbrado = 2.50;
      mantenimientoRed = totalMantenimiento - cargoFijo - alumbrado;
    } else if (totalMantenimiento > 10) {
      cargoFijo = Math.min(45.00, totalMantenimiento * 0.2);
      alumbrado = Math.min(2.50, totalMantenimiento * 0.01);
      mantenimientoRed = totalMantenimiento - cargoFijo - alumbrado;
    } else {
      cargoFijo = totalMantenimiento;
      mantenimientoRed = 0;
      alumbrado = 0;
    }

    const currentConsumo = parseFloat(recibo.consumo_calculado || 0);
    let pctChangeText = '';
    if (historial && historial.length > 1) {
      const currentIdx = historial.findIndex(h => h.mes_anio === recibo.mes_anio);
      if (currentIdx > 0) {
        const prevConsumo = parseFloat(historial[currentIdx - 1].consumo_calculado || 0);
        if (prevConsumo > 0) {
          const diff = currentConsumo - prevConsumo;
          const pct = (diff / prevConsumo) * 100;
          if (pct >= 0) {
            pctChangeText = `Incremento de ${pct.toFixed(1)}% respecto al mes anterior`;
          } else {
            pctChangeText = `Reducción de ${Math.abs(pct).toFixed(1)}% respecto al mes anterior`;
          }
        }
      }
    }

    return (
      <div className="flex-grow flex flex-col relative bg-background w-full">
      {/* TopAppBar inside content for layout consistency */}
      <div className="flex justify-between items-center mb-lg p-xl pb-0 print:hidden">
        <h2 className="font-headline-lg text-headline-lg text-primary font-bold">Detalle de Recibo</h2>
      </div>

      <div className="flex-grow overflow-y-auto p-xl pt-md pb-32 print:p-0 print:overflow-visible print:h-auto">
        <div className="receipt-container space-y-lg max-w-6xl mx-auto">
          {/* Actions Toolbar */}
          <div className="flex justify-between items-center bg-white p-md rounded-xl border border-outline-variant shadow-sm print:hidden">
            <button 
              onClick={handleBack} 
              className="flex items-center text-secondary hover:text-primary transition-colors font-label-caps text-[11px] uppercase tracking-widest font-bold"
            >
              <span className="material-symbols-outlined mr-xs">arrow_back</span> REGRESAR
            </button>
            <div className="flex gap-md">
              <button 
                onClick={handlePrint}
                className="flex items-center px-md py-2 border border-outline-variant rounded-lg text-secondary hover:bg-surface-container-low transition-colors font-bold text-sm" 
              >
                <span className="material-symbols-outlined mr-sm">print</span> Imprimir
              </button>
              {recibo.estado === 'Pendiente' && (
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center px-md py-2 bg-secondary text-on-secondary rounded-lg hover:opacity-90 transition-all font-bold text-sm shadow-sm"
                >
                  <span className="material-symbols-outlined mr-sm">edit</span> Editar Multas / Cargos
                </button>
              )}
              <button 
                onClick={handleDownloadPdf}
                className="flex items-center px-md py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all font-bold text-sm shadow-sm"
              >
                <span className="material-symbols-outlined mr-sm">picture_as_pdf</span> Descargar PDF
              </button>
            </div>
          </div>

          {/* Receipt Document */}
          <div className="bg-white border border-outline-variant shadow-sm rounded-lg overflow-hidden" id="receipt-document">
            {/* Document Header */}
            <div className="p-xl border-b border-outline-variant flex flex-col md:flex-row justify-between items-start gap-lg bg-surface-container-lowest">
              <div className="space-y-sm w-full md:w-2/3">
                <div className="flex items-center gap-md border-b border-outline-variant/50 pb-sm mb-md">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-lg">
                    <span className="material-symbols-outlined text-primary text-[28px]">factory</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-sm uppercase tracking-wider">Parque Industrial Jicamarca S.A.</h3>
                    <p className="text-[11px] text-on-surface-variant font-data-mono">RUC: 20456789123 | Emisor del Recibo</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-label-caps text-[11px] tracking-wider text-primary font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    FACTURADO A:
                  </h4>
                  <p className="font-headline-md text-headline-md font-bold mt-1 text-on-surface">{recibo.nombre_razonsocial}</p>
                  <div className="grid grid-cols-2 gap-x-xl gap-y-xs mt-sm bg-surface p-sm rounded-lg border border-outline-variant/30">
                    <p className="text-body-sm text-on-surface-variant">RUC/DNI: <span className="text-on-surface font-bold font-data-mono">{recibo.documento_identidad}</span></p>
                    <p className="text-body-sm text-on-surface-variant">Dirección: <span className="text-on-surface font-bold">{recibo.direccion || 'No registrada'}</span></p>
                    <p className="text-body-sm text-on-surface-variant">Mes de Facturación: <span className="text-on-surface font-bold">{formatPeriodo(recibo.mes_anio)}</span></p>
                    <p className="text-body-sm text-on-surface-variant">Vencimiento: <span className="text-on-surface font-bold">{recibo.fecha_vencimiento ? new Date(recibo.fecha_vencimiento).toLocaleDateString('es-PE') : '-'}</span></p>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-xs w-full md:w-auto">
                <div className="bg-surface-container-high px-md py-sm rounded-lg inline-block text-center w-full md:w-auto">
                  <span className="block font-label-caps text-[11px] tracking-wider text-on-surface-variant text-center font-bold">TOTAL A PAGAR</span>
                  <span className="block font-headline-lg text-headline-lg text-primary font-bold">S/ {parseFloat(recibo.total).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
                <p className={`text-[12px] font-bold tracking-widest text-center md:text-right mt-2 ${recibo.estado === 'Pagado' ? 'text-green-600' : recibo.estado === 'Pago Parcial' ? 'text-[#0ea5e9]' : recibo.estado === 'Pendiente' ? 'text-yellow-600' : 'text-error'}`}>
                  ESTADO: {recibo.estado.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Consumption Breakdown Grid */}
            <div className="p-xl grid grid-cols-1 md:grid-cols-3 gap-xl bg-surface-container-lowest">
              {/* Meter Readings */}
              <div className="md:col-span-2">
                <h4 className="font-label-caps text-[11px] tracking-wider text-on-surface-variant mb-md font-bold">DETALLE DE LECTURAS (MEDIDOR {recibo.num_medidor || 'N/A'})</h4>
                <div className="grid grid-cols-2 gap-md">
                  <div className="p-md bg-white border border-outline-variant rounded-lg shadow-sm">
                    <span className="text-sm text-on-surface-variant block mb-xs">Lectura Anterior ({formatDayMonth(recibo.periodo_inicio)})</span>
                    <span className="font-data-mono text-xl text-on-surface font-bold">{recibo.lectura_anterior !== null ? parseFloat(recibo.lectura_anterior).toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '0.00'} <span className="text-xs font-sans text-on-surface-variant font-normal">kWh</span></span>
                  </div>
                  <div className="p-md bg-white border border-outline-variant rounded-lg shadow-sm">
                    <span className="text-sm text-on-surface-variant block mb-xs">Lectura Actual ({formatDayMonth(recibo.periodo_fin)})</span>
                    <span className="font-data-mono text-xl text-on-surface font-bold">{recibo.lectura_actual !== null ? parseFloat(recibo.lectura_actual).toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '0.00'} <span className="text-xs font-sans text-on-surface-variant font-normal">kWh</span></span>
                  </div>
                </div>
                <div className="mt-md p-md bg-primary-container/10 border border-primary-container/20 rounded-lg flex justify-between items-center shadow-sm">
                  <div>
                    <span className="text-[12px] text-primary font-bold block tracking-wider">CONSUMO TOTAL DEL PERIODO</span>
                    {pctChangeText && <span className="text-xs text-on-surface-variant font-bold block mt-0.5">{pctChangeText}</span>}
                  </div>
                  <div className="text-right">
                    <span className="font-data-mono text-headline-md text-primary font-bold">{parseFloat(recibo.consumo_calculado || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                    <span className="text-sm text-primary font-bold ml-1">kWh</span>
                  </div>
                </div>
              </div>

              {/* Consumption Trend Mini-Chart Simulation */}
              <div className="bg-white border border-outline-variant rounded-lg p-md flex flex-col shadow-sm">
                <h4 className="font-label-caps text-[11px] tracking-wider text-on-surface-variant mb-md font-bold">TENDENCIA CONSUMO</h4>
                <div className="flex-grow flex items-end justify-between gap-1.5 px-sm h-24">
                  {historial.length > 0 ? (
                    historial.map((hist, index) => {
                      const maxHist = Math.max(...historial.map(h => parseFloat(h.consumo_calculado || 0)), 1);
                      const heightPercent = (parseFloat(hist.consumo_calculado || 0) / maxHist) * 100;
                      const isCurrent = index === historial.length - 1;
                      return (
                        <div 
                          key={index} 
                          className={`w-full rounded-t transition-all ${isCurrent ? 'bg-primary' : 'bg-outline-variant/60'}`} 
                          style={{ height: `${Math.max(heightPercent, 12)}%` }}
                          title={`${formatPeriodo(hist.mes_anio)}: ${parseFloat(hist.consumo_calculado).toFixed(1)} kWh`}
                        ></div>
                      );
                    })
                  ) : (
                    <div className="text-center w-full text-on-surface-variant text-[10px] pb-md">Sin historial</div>
                  )}
                </div>
                <div className="flex justify-between mt-sm text-[8px] text-on-surface-variant font-bold tracking-tight">
                  {historial.map((hist, index) => (
                    <span key={index} className={index === historial.length - 1 ? 'text-primary font-bold' : ''}>
                      {hist.mes_anio ? hist.mes_anio.substring(5) : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Billing Concepts Table */}
            <div className="px-xl py-lg">
              <h4 className="font-label-caps text-[11px] tracking-wider text-on-surface-variant mb-md font-bold">CONCEPTOS DE FACTURACIÓN</h4>
              <table className="w-full text-left border-collapse table-zebra">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    <th className="px-md py-sm font-label-caps text-[11px] text-on-surface-variant font-bold">Descripción</th>
                    <th className="px-md py-sm font-label-caps text-[11px] text-on-surface-variant text-right font-bold">Cant/Unid</th>
                    <th className="px-md py-sm font-label-caps text-[11px] text-on-surface-variant text-right font-bold">Precio Unit. (S/)</th>
                    <th className="px-md py-sm font-label-caps text-[11px] text-on-surface-variant text-right font-bold">Importe (S/)</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-outline-variant/50">
                    <td className="px-md py-md">Consumo Energía Activa (Baja Tensión)</td>
                    <td className="px-md py-md text-right font-data-mono">{parseFloat(recibo.consumo_calculado || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })} kWh</td>
                    <td className="px-md py-md text-right font-data-mono">S/ {parseFloat(recibo.tarifa_kwh || 0.65).toFixed(4)}</td>
                    <td className="px-md py-md text-right font-data-mono">{parseFloat(recibo.cargo_energia || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr className="border-b border-outline-variant/50">
                    <td className="px-md py-md">Cargo Fijo Mensual</td>
                    <td className="px-md py-md text-right font-data-mono">1.00</td>
                    <td className="px-md py-md text-right font-data-mono">S/ {parseFloat(cargoFijo).toFixed(2)}</td>
                    <td className="px-md py-md text-right font-data-mono">{parseFloat(cargoFijo).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  {mantenimientoRed > 0 && (
                    <tr className="border-b border-outline-variant/50">
                      <td className="px-md py-md">Mantenimiento de Red e Infraestructura</td>
                      <td className="px-md py-md text-right font-data-mono">1.00</td>
                      <td className="px-md py-md text-right font-data-mono">S/ {parseFloat(mantenimientoRed).toFixed(2)}</td>
                      <td className="px-md py-md text-right font-data-mono">{parseFloat(mantenimientoRed).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  )}
                  {alumbrado > 0 && (
                    <tr className="border-b border-outline-variant/50">
                      <td className="px-md py-md">Alumbrado Público Prorrateado</td>
                      <td className="px-md py-md text-right font-data-mono">1.00</td>
                      <td className="px-md py-md text-right font-data-mono">S/ {parseFloat(alumbrado).toFixed(2)}</td>
                      <td className="px-md py-md text-right font-data-mono">{parseFloat(alumbrado).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  )}
                  {parseFloat(recibo.cargo_corte || 0) > 0 && (
                    <tr className="border-b border-outline-variant/50">
                      <td className="px-md py-md text-error font-bold">Cargo por Corte / Reconexión</td>
                      <td className="px-md py-md text-right font-data-mono">1.00</td>
                      <td className="px-md py-md text-right font-data-mono">S/ {parseFloat(recibo.cargo_corte).toFixed(2)}</td>
                      <td className="px-md py-md text-right font-data-mono">{parseFloat(recibo.cargo_corte).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  )}
                  {parseFloat(recibo.multa_manipulacion || 0) > 0 && (
                    <tr className="border-b border-outline-variant/50">
                      <td className="px-md py-md text-error font-bold">Multa por Manipulación / Infracción</td>
                      <td className="px-md py-md text-right font-data-mono">1.00</td>
                      <td className="px-md py-md text-right font-data-mono">S/ {parseFloat(recibo.multa_manipulacion).toFixed(2)}</td>
                      <td className="px-md py-md text-right font-data-mono">{parseFloat(recibo.multa_manipulacion).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  )}
                  {parseFloat(recibo.multa_reconexion || 0) > 0 && (
                    <tr className="border-b border-outline-variant/50">
                      <td className="px-md py-md text-error font-bold">Multa por Reconexión Sin Autorización</td>
                      <td className="px-md py-md text-right font-data-mono">1.00</td>
                      <td className="px-md py-md text-right font-data-mono">S/ {parseFloat(recibo.multa_reconexion).toFixed(2)}</td>
                      <td className="px-md py-md text-right font-data-mono">{parseFloat(recibo.multa_reconexion).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  )}
                  {parseFloat(recibo.instalacion_medidor || 0) > 0 && (
                    <tr className="border-b border-outline-variant/50">
                      <td className="px-md py-md">Instalación de Medidor Nuevo</td>
                      <td className="px-md py-md text-right font-data-mono">1.00</td>
                      <td className="px-md py-md text-right font-data-mono">S/ {parseFloat(recibo.instalacion_medidor).toFixed(2)}</td>
                      <td className="px-md py-md text-right font-data-mono">{parseFloat(recibo.instalacion_medidor).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  )}
                  {parseFloat(recibo.deuda_vencida || 0) > 0 && (
                    <tr className="border-b border-outline-variant/50">
                      <td className="px-md py-md text-warning font-bold">Deuda Vencida Meses Anteriores</td>
                      <td className="px-md py-md text-right font-data-mono">1.00</td>
                      <td className="px-md py-md text-right font-data-mono">S/ {parseFloat(recibo.deuda_vencida).toFixed(2)}</td>
                      <td className="px-md py-md text-right font-data-mono">{parseFloat(recibo.deuda_vencida).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  )}
                  {parseFloat(recibo.descuento || 0) > 0 && (
                    <tr className="border-b border-outline-variant/50 bg-[#107C41]/5">
                      <td className="px-md py-md text-[#107C41] font-bold">
                        Descuento Especial Aplicado <br/>
                        <span className="text-xs font-normal italic text-on-surface-variant">Motivo: {recibo.motivo_descuento}</span>
                      </td>
                      <td className="px-md py-md text-right font-data-mono text-[#107C41]">1.00</td>
                      <td className="px-md py-md text-right font-data-mono text-[#107C41]">- S/ {parseFloat(recibo.descuento).toFixed(2)}</td>
                      <td className="px-md py-md text-right font-data-mono font-bold text-[#107C41]">- {parseFloat(recibo.descuento).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary and QR */}
            <div className="p-xl border-t border-outline-variant flex flex-col md:flex-row gap-xl items-center bg-surface-container-low/50">
              <div className="flex-1 flex flex-col sm:flex-row gap-lg items-center sm:items-start text-center sm:text-left">
                <div className="bg-white p-sm border border-outline-variant rounded-lg shadow-sm">
                  <img alt="Código QR para validación y pago" className="w-24 h-24" src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ReceiptId_${recibo.id}_${recibo.numero_comprobante}`} />
                </div>
                <div className="max-w-xs">
                  <h5 className="font-label-caps text-[11px] tracking-wider text-on-surface-variant font-bold">VALIDACIÓN DIGITAL</h5>
                  <p className="text-sm text-on-surface-variant mt-xs">Escanee este código para validar la autenticidad del recibo o realizar el pago directo vía App PI Jicamarca.</p>
                  <p className="text-[10px] font-data-mono text-outline mt-sm">HASH: {recibo.id}_{recibo.numero_comprobante}_8f2a1c</p>
                </div>
              </div>
              <div className="w-full md:w-64 space-y-xs">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal:</span>
                  <span className="font-data-mono font-bold">S/ {parseFloat(recibo.subtotal).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">IGV (18%):</span>
                  <span className="font-data-mono font-bold">S/ {parseFloat(recibo.igv).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between pt-sm border-t border-outline-variant mt-2">
                  <span className="font-bold text-on-surface">TOTAL:</span>
                  <span className="font-headline-sm text-primary font-bold">S/ {parseFloat(recibo.total).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
                {pagosHistorial.length > 0 && (
                  <>
                    <div className="flex justify-between pt-sm mt-1 text-sm text-[#059669]">
                      <span className="font-bold">Total Pagado:</span>
                      <span className="font-data-mono font-bold">- S/ {pagosHistorial.reduce((acc, p) => acc + parseFloat(p.monto_pagado || 0), 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between pt-sm border-t border-outline-variant mt-2">
                      <span className="font-bold text-error">SALDO PENDIENTE:</span>
                      <span className="font-headline-sm text-error font-bold">S/ {Math.max(0, parseFloat(recibo.total) - pagosHistorial.reduce((acc, p) => acc + parseFloat(p.monto_pagado || 0), 0)).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment History Table */}
            {pagosHistorial.length > 0 && (
              <div className="px-xl py-lg border-t border-outline-variant bg-surface-container-lowest">
                <h4 className="font-label-caps text-[11px] tracking-wider text-on-surface-variant mb-md font-bold">HISTORIAL DE PAGOS</h4>
                <table className="w-full text-left border-collapse table-zebra">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low">
                      <th className="px-md py-sm font-label-caps text-[11px] text-on-surface-variant font-bold">Fecha</th>
                      <th className="px-md py-sm font-label-caps text-[11px] text-on-surface-variant font-bold">Método / Op.</th>
                      <th className="px-md py-sm font-label-caps text-[11px] text-on-surface-variant text-right font-bold">Monto (S/)</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {pagosHistorial.map((pago, index) => (
                      <tr key={index} className="border-b border-outline-variant/50">
                        <td className="px-md py-sm">{new Date(pago.fecha_pago).toLocaleString('es-PE')}</td>
                        <td className="px-md py-sm">{pago.metodo_pago} {pago.numero_operacion ? `(${pago.numero_operacion})` : ''}</td>
                        <td className="px-md py-sm text-right font-data-mono text-[#059669] font-bold">S/ {parseFloat(pago.monto_pagado).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Notice / Disclaimer */}
          <div className="bg-tertiary-container/10 border-l-4 border-tertiary p-md flex items-start gap-md print-hidden rounded-r-md">
            <span className="material-symbols-outlined text-tertiary">warning</span>
            <p className="text-sm text-on-tertiary-fixed-variant">
              <strong className="font-bold">Aviso importante:</strong> Si el pago no se registra antes de la fecha de vencimiento ({recibo.fecha_vencimiento ? new Date(recibo.fecha_vencimiento).toLocaleDateString('es-PE') : '-'}), se procederá al corte preventivo del suministro de acuerdo al reglamento interno del Parque Industrial. Evite recargos por mora.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Edit Cargos */}
      {isEditModalOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:hidden animate-in fade-in duration-200`}>
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg border border-outline-variant overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-lg py-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h3 className="font-headline-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_note</span>
                Editar Multas y Cargos
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-surface-container-highest rounded-full text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-lg">
              <form onSubmit={handleSaveCargos} className="space-y-md">
                
                <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant space-y-3">
                  <label className="text-sm font-bold text-on-surface uppercase tracking-wider text-[11px] block">Multa por Manipulación / Infracción</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="radio" name="tipoMulta" value="ninguna" checked={tipoMulta === 'ninguna'} onChange={() => setTipoMulta('ninguna')} className="text-primary accent-primary" />
                      Sin Multa
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="radio" name="tipoMulta" value="estandar" checked={tipoMulta === 'estandar'} onChange={() => setTipoMulta('estandar')} className="text-primary accent-primary" />
                      Multa Estándar (S/ {tarifasGlobales.monto_multa_base})
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="radio" name="tipoMulta" value="personalizada" checked={tipoMulta === 'personalizada'} onChange={() => setTipoMulta('personalizada')} className="text-primary accent-primary" />
                      Personalizada
                    </label>
                  </div>
                  {tipoMulta === 'personalizada' && (
                    <input 
                      type="number" step="0.01" min="0" required
                      className="w-full mt-2 border border-outline-variant rounded-md px-3 py-2 bg-white text-sm font-data-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      value={cargos.multa_manipulacion}
                      onChange={(e) => setCargos({...cargos, multa_manipulacion: e.target.value})}
                      placeholder="Ingrese monto exacto"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-md">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">Cargo por Corte (S/)</label>
                    <input 
                      type="number" step="0.01" min="0"
                      className="border border-outline-variant rounded-md px-3 py-2 bg-white text-sm font-data-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      value={cargos.cargo_corte}
                      onChange={(e) => setCargos({...cargos, cargo_corte: e.target.value})}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">Instalación de Medidor (S/)</label>
                    <input 
                      type="number" step="0.01" min="0"
                      className="border border-outline-variant rounded-md px-3 py-2 bg-white text-sm font-data-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      value={cargos.instalacion_medidor}
                      onChange={(e) => setCargos({...cargos, instalacion_medidor: e.target.value})}
                    />
                  </div>

                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">Multa por Reconexión Sin Autorización (S/)</label>
                    <input 
                      type="number" step="0.01" min="0"
                      className="border border-outline-variant rounded-md px-3 py-2 bg-white text-sm font-data-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      value={cargos.multa_reconexion}
                      onChange={(e) => setCargos({...cargos, multa_reconexion: e.target.value})}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">Deuda Vencida (S/)</label>
                    <input 
                      type="number" step="0.01" min="0"
                      className="border border-outline-variant rounded-md px-3 py-2 bg-white text-sm font-data-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      value={cargos.deuda_vencida}
                      onChange={(e) => setCargos({...cargos, deuda_vencida: e.target.value})}
                    />
                  </div>
                </div>

                <div className="bg-[#107C41]/10 border border-[#107C41]/20 p-md rounded-lg space-y-md">
                  <h4 className="font-bold text-[#107C41] text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">discount</span>
                    Aplicar Descuento Especial
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-bold text-[#107C41] uppercase tracking-wider text-[11px]">Monto a descontar (S/)</label>
                      <input 
                        type="number" step="0.01" min="0"
                        className="border border-[#107C41]/30 rounded-md px-3 py-2 bg-white text-sm font-data-mono focus:border-[#107C41] focus:ring-1 focus:ring-[#107C41] outline-none"
                        value={cargos.descuento}
                        onChange={(e) => setCargos({...cargos, descuento: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-sm font-bold text-[#107C41] uppercase tracking-wider text-[11px]">Sustento / Motivo (Obligatorio)</label>
                      <input 
                        type="text"
                        required={cargos.descuento > 0}
                        className="border border-[#107C41]/30 rounded-md px-3 py-2 bg-white text-sm focus:border-[#107C41] focus:ring-1 focus:ring-[#107C41] outline-none"
                        value={cargos.motivo_descuento}
                        onChange={(e) => setCargos({...cargos, motivo_descuento: e.target.value})}
                        placeholder="Ej: Problemas técnicos con el cableado, etc."
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-md mt-md border-t border-outline-variant flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-outline-variant rounded-md font-bold text-sm hover:bg-surface-container-low transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-primary text-on-primary rounded-md font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar y Recalcular'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      </div>
    );
  };

  if (onClose) {
    return (
      <>
        <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity print:hidden ${isClosing ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-300'}`} onClick={handleClose}></div>
        <div className={`fixed right-0 top-0 bottom-0 w-full max-w-4xl bg-surface shadow-2xl z-50 flex flex-col border-l border-outline-variant overflow-y-auto ${isClosing ? 'animate-out slide-out-to-right duration-300 fill-mode-forwards' : 'animate-in slide-in-from-right duration-300'}`}>
          {renderContent()}
        </div>
      </>
    );
  }

  return <main className="flex-grow flex flex-col relative overflow-hidden bg-background">{renderContent()}</main>;
};

export default ReceiptDetail;
