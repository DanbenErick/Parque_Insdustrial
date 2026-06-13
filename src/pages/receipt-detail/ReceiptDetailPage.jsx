import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'sonner';

// ── Constants ────────────────────────────────────────────────────────
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const ESTADO_CONFIG = {
  Pagado:       { icon: 'check_circle', bg: 'bg-emerald-600', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
  'Pago Parcial': { icon: 'timelapse', bg: 'bg-sky-600', text: 'text-sky-700', badge: 'bg-sky-100 text-sky-800' },
  Pendiente:    { icon: 'schedule', bg: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
};
const ESTADO_DEFAULT = { icon: 'warning', bg: 'bg-rose-600', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-800' };

const INITIAL_CARGOS = {
  multa_manipulacion: 0,
  cargo_corte: 0,
  multa_reconexion: 0,
  instalacion_medidor: 0,
  deuda_vencida: 0,
  descuento: 0,
  motivo_descuento: '',
};

const CLOSE_ANIMATION_MS = 250;

// ── Helpers ──────────────────────────────────────────────────────────
const formatCurrency = (value) =>
  parseFloat(value || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const formatPeriodo = (p) => {
  if (!p) return '-';
  if (p.includes('-')) {
    const [anio, mes] = p.split('-');
    return `${MESES[parseInt(mes) - 1] || mes} ${anio}`;
  }
  return p;
};

const getEstadoConfig = (estado) => ESTADO_CONFIG[estado] || ESTADO_DEFAULT;

// ── Sub-components ───────────────────────────────────────────────────
const CargoLine = React.memo(({ label, amount, className = '' }) => (
  <div className={`flex justify-between items-center ${className}`}>
    <span>{label}</span>
    <span className="font-mono">S/ {formatCurrency(amount)}</span>
  </div>
));

const CargoLineConditional = React.memo(({ value, label, className = 'text-rose-600' }) => {
  const parsed = parseFloat(value || 0);
  if (parsed <= 0) return null;
  return <CargoLine label={label} amount={value} className={className} />;
});

const InfoRow = React.memo(({ label, value, valueClassName = 'text-slate-800', hasBorder = true }) => (
  <div className={`flex justify-between items-center ${hasBorder ? 'border-b border-slate-100 pb-3' : ''}`}>
    <span className="text-sm text-slate-500">{label}</span>
    <span className={`text-sm font-semibold ${valueClassName}`}>{value}</span>
  </div>
));

const SectionHeader = React.memo(({ icon, title, children }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-slate-400 text-[20px]">{icon}</span>
      <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-600">{title}</h4>
    </div>
    {children}
  </div>
));

// ── Main Component ───────────────────────────────────────────────────
const ReceiptDetail = ({ receiptId, onClose }) => {
  const [searchParams] = useSearchParams();
  const id = receiptId || searchParams.get('id');
  const navigate = useNavigate();
  const location = useLocation();

  // ── State ──────────────────────────────────────────────────────────
  const [recibo, setRecibo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [pagosHistorial, setPagosHistorial] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [cargos, setCargos] = useState(INITIAL_CARGOS);
  const [tarifasGlobales, setTarifasGlobales] = useState({ monto_multa_base: 50 });
  const [tipoMulta, setTipoMulta] = useState('ninguna');
  const [availableCargosDinamicos, setAvailableCargosDinamicos] = useState([]);
  const [selectedCargosDinamicos, setSelectedCargosDinamicos] = useState([]);

  // ── Memoised derived data ──────────────────────────────────────────
  const estadoConfig = useMemo(() => getEstadoConfig(recibo?.estado), [recibo?.estado]);

  const pctChangeText = useMemo(() => {
    if (!recibo || !historial || historial.length <= 1) return '';
    const currentConsumo = parseFloat(recibo.consumo_calculado || 0);
    const currentIdx = historial.findIndex(h => h.mes_anio === recibo.mes_anio);
    if (currentIdx <= 0) return '';
    const prevConsumo = parseFloat(historial[currentIdx - 1].consumo_calculado || 0);
    if (prevConsumo <= 0) return '';
    const pct = ((currentConsumo - prevConsumo) / prevConsumo) * 100;
    return pct >= 0
      ? `Incremento de ${pct.toFixed(1)}% respecto al mes anterior`
      : `Reducción de ${Math.abs(pct).toFixed(1)}% respecto al mes anterior`;
  }, [recibo, historial]);

  const chartData = useMemo(() => {
    if (!historial?.length) return { displayData: [], maxConsumo: 0 };
    const displayData = historial.slice(0, 6).reverse();
    const maxConsumo = Math.max(...historial.map(x => parseFloat(x.consumo_calculado || 0)));
    return { displayData, maxConsumo };
  }, [historial]);

  const totalPagado = useMemo(
    () => pagosHistorial.reduce((acc, p) => acc + parseFloat(p.monto_pagado || 0), 0),
    [pagosHistorial],
  );

  const isVencido = useMemo(
    () => recibo && new Date(recibo.fecha_vencimiento) < new Date() && recibo.estado !== 'Pagado',
    [recibo],
  );

  // ── Callbacks ──────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => { if (onClose) onClose(); }, CLOSE_ANIMATION_MS);
  }, [onClose]);

  const handleBack = useCallback(() => {
    if (onClose) {
      handleClose();
    } else if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate('/billing');
    }
  }, [onClose, handleClose, location.state, navigate]);

  const handleDownloadPdf = useCallback(async () => {
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
    } catch (err) {
      console.error(err);
      toast.error('Error al descargar el PDF');
    }
  }, [id, recibo]);

  const handleSaveCargos = useCallback(async (e) => {
    e.preventDefault();
    if (cargos.descuento > 0 && !cargos.motivo_descuento.trim()) {
      return toast.error('Debes ingresar un sustento/motivo para aplicar el descuento.');
    }
    setIsSaving(true);
    try {
      const payload = { ...cargos, cargos_dinamicos: selectedCargosDinamicos };
      if (tipoMulta === 'ninguna') payload.multa_manipulacion = 0;
      else if (tipoMulta === 'estandar') payload.multa_manipulacion = tarifasGlobales.monto_multa_base;

      await api.put(`/recibos/${id}/cargos`, payload);
      toast.success('Cargos y descuentos actualizados');
      setIsEditModalOpen(false);
      const resData = await api.get(`/recibos/${id}`);
      setRecibo(resData.data.recibo);
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar cargos');
    } finally {
      setIsSaving(false);
    }
  }, [cargos, selectedCargosDinamicos, tipoMulta, tarifasGlobales, id]);

  const openEditModal = useCallback(() => setIsEditModalOpen(true), []);
  const closeEditModal = useCallback(() => setIsEditModalOpen(false), []);

  const handleCargosChange = useCallback((field, value) => {
    setCargos(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleToggleCargoDinamico = useCallback((cargo, checked) => {
    setSelectedCargosDinamicos(prev =>
      checked
        ? [...prev, { descripcion: cargo.descripcion, tipo: cargo.tipo, monto: cargo.monto_defecto }]
        : prev.filter(c => c.descripcion !== cargo.descripcion),
    );
  }, []);

  // ── Data fetching ──────────────────────────────────────────────────
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchReceiptDetail = async () => {
      try {
        setIsLoading(true);
        const [res, configRes] = await Promise.all([
          api.get(`/recibos/${id}`),
          api.get('/config'),
        ]);

        if (cancelled) return;

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
          motivo_descuento: r.motivo_descuento || '',
        });

        if (r.multa_manipulacion > 0) {
          setTipoMulta(parseFloat(r.multa_manipulacion) === parseFloat(baseMulta) ? 'estandar' : 'personalizada');
        }

        // Fetch dynamic cargos
        try {
          const catRes = await api.get(`/catalogo-cargos/periodo/${r.periodo_id}`);
          if (!cancelled) {
            setAvailableCargosDinamicos(catRes.data || []);
            setSelectedCargosDinamicos(r.cargos_dinamicos || []);
          }
        } catch (e) {
          console.error('Error fetching catalogo cargos', e);
        }
      } catch (err) {
        console.error('Error fetching receipt detail:', err);
        if (!cancelled) toast.error('Error al cargar el detalle del recibo');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchReceiptDetail();
    return () => { cancelled = true; };
  }, [id]);

  // ── Render helpers ─────────────────────────────────────────────────
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

  const renderChart = () => {
    if (!historial?.length) return null;
    const { displayData, maxConsumo } = chartData;

    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex-grow">
        <SectionHeader icon="bar_chart" title="Historial de Consumo (6 Meses)" />
        <div className="flex items-end gap-2 sm:gap-4 h-40 mt-4 border-b border-slate-200 pb-2">
          {displayData.map((h, i) => {
            const height = maxConsumo > 0 ? (parseFloat(h.consumo_calculado || 0) / maxConsumo) * 100 : 0;
            const isCurrent = h.mes_anio === recibo.mes_anio;
            return (
              <div key={i} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                <div
                  className={`w-full max-w-[40px] rounded-t-sm transition-all relative ${isCurrent ? 'bg-blue-600' : 'bg-blue-100 hover:bg-blue-200'}`}
                  style={{ height: `${Math.max(height, 5)}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20">
                    {parseFloat(h.consumo_calculado || 0).toFixed(2)} kWh
                  </div>
                </div>
                <span className={`text-[10px] mt-2 truncate w-full text-center ${isCurrent ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                  {formatPeriodo(h.mes_anio).split(' ')[0].substring(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!isEditModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:hidden animate-in fade-in duration-200">
        <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg border border-outline-variant overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="px-lg py-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <h3 className="font-headline-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              Editar Multas y Cargos
            </h3>
            <button
              onClick={closeEditModal}
              className="p-1 hover:bg-surface-container-highest rounded-full text-on-surface-variant"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-lg">
            <form onSubmit={handleSaveCargos} className="space-y-md">
              {/* Dynamic Cargos Section */}
              <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant space-y-3">
                <label className="text-sm font-bold text-on-surface uppercase tracking-wider text-[11px] block">
                  Cargos Adicionales y Multas Dinámicas
                </label>

                {availableCargosDinamicos.length === 0 ? (
                  <p className="text-xs text-on-surface-variant italic">
                    No hay cargos adicionales configurados para este periodo.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availableCargosDinamicos.map(cargo => {
                      const isSelected = selectedCargosDinamicos.some(c => c.descripcion === cargo.descripcion);
                      return (
                        <div
                          key={cargo.id}
                          className={`flex items-center justify-between p-2 rounded border ${isSelected ? 'bg-primary/5 border-primary/30' : 'bg-white border-outline-variant'} transition-colors`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer flex-grow">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleToggleCargoDinamico(cargo, e.target.checked)}
                              className="rounded text-primary focus:ring-primary w-4 h-4"
                            />
                            <div>
                              <span className="text-sm font-bold block">{cargo.descripcion}</span>
                              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${cargo.tipo === 'Multa' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                                {cargo.tipo}
                              </span>
                            </div>
                          </label>
                          <span className="text-sm font-data-mono font-bold text-on-surface-variant">
                            S/ {parseFloat(cargo.monto_defecto).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Descuento section */}
              <div className="bg-[#f0fdf4] p-md rounded-lg border border-[#bbf7d0] space-y-4">
                <div className="flex items-center gap-2 border-b border-[#bbf7d0]/50 pb-2">
                  <span className="material-symbols-outlined text-[#16a34a] text-[18px]">loyalty</span>
                  <h4 className="font-bold text-[#166534] text-sm uppercase tracking-wide">Descuento a Favor</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-[#15803d] uppercase tracking-wider text-[11px]">Monto (S/)</label>
                    <input
                      type="number" step="0.01" min="0"
                      className="w-full border border-[#86efac] rounded-md px-3 py-2 bg-white text-sm font-data-mono text-[#14532d] focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] outline-none"
                      value={cargos.descuento}
                      onChange={(e) => handleCargosChange('descuento', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-sm font-bold text-[#15803d] uppercase tracking-wider text-[11px] truncate" title="Motivo del Descuento (Obligatorio)">
                      Motivo (Obligatorio)
                    </label>
                    <input
                      type="text"
                      required={cargos.descuento > 0}
                      className="w-full border border-[#86efac] rounded-md px-3 py-2 bg-white text-sm text-[#14532d] focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] outline-none placeholder:text-[#86efac]"
                      value={cargos.motivo_descuento}
                      onChange={(e) => handleCargosChange('motivo_descuento', e.target.value)}
                      placeholder="Especifique la razón..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-md mt-md border-t border-outline-variant flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
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
    );
  };

  const renderContent = () => {
    if (isLoading) return renderLoading();
    if (!id || !recibo) return renderError();

    return (
      <div className="flex-grow flex flex-col relative min-h-screen bg-slate-50 w-full overflow-hidden">
        <div className="relative z-10 flex-grow overflow-y-auto p-4 md:p-8 pt-6 pb-32 print:p-0 print:overflow-visible print:h-auto">
          <div className="space-y-6 max-w-6xl mx-auto">

            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
              <div>
                <button
                  onClick={handleBack}
                  className="flex items-center text-slate-500 hover:text-slate-800 transition-colors mb-2 text-xs font-semibold uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined mr-1 text-[16px]">arrow_back</span>
                  VOLVER AL LISTADO
                </button>
                <h2 className="text-2xl font-bold tracking-tight text-slate-800">Detalle de Recibo</h2>
              </div>

              <div className="flex gap-3">
                {recibo.estado === 'Pendiente' && (
                  <button
                    onClick={openEditModal}
                    className="flex items-center px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors font-medium text-sm shadow-sm"
                  >
                    <span className="material-symbols-outlined mr-2 text-[18px]">edit</span> Editar
                  </button>
                )}
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors font-medium text-sm shadow-sm"
                >
                  <span className="material-symbols-outlined mr-2 text-[18px]">picture_as_pdf</span> Descargar PDF
                </button>
              </div>
            </div>

            {/* Dashboard Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column (Info & Metrics) */}
              <div className="lg:col-span-2 flex flex-col gap-6">

                {/* Hero Card */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="flex gap-4 items-center">
                    <div className={`w-12 h-12 rounded-md flex items-center justify-center text-white ${estadoConfig.bg}`}>
                      <span className="material-symbols-outlined text-[24px]">{estadoConfig.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800">{recibo.nombre_razonsocial}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">badge</span> {recibo.documento_identidad}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">location_on</span> {recibo.direccion || 'Sin dirección'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left md:text-right w-full md:w-auto bg-slate-50 p-4 rounded-md border border-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">TOTAL A PAGAR</p>
                    <p className={`text-3xl font-bold tracking-tight ${estadoConfig.text}`}>
                      <span className="text-xl font-medium mr-1 text-slate-500">S/</span>
                      {formatCurrency(recibo.total)}
                    </p>
                    <div className="mt-2">
                      <span className={`px-2.5 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider ${estadoConfig.badge}`}>
                        {recibo.estado}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Period & Consumption Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  {/* Dates */}
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                    <SectionHeader icon="calendar_month" title="Período de Facturación" />
                    <div className="space-y-4">
                      <InfoRow label="Mes" value={formatPeriodo(recibo.mes_anio)} />
                      <InfoRow label="Emisión" value={recibo.fecha_emision ? new Date(recibo.fecha_emision).toLocaleDateString('es-PE') : '-'} />
                      <InfoRow
                        label="Vencimiento"
                        value={recibo.fecha_vencimiento ? new Date(recibo.fecha_vencimiento).toLocaleDateString('es-PE') : '-'}
                        valueClassName={isVencido ? 'text-rose-600' : 'text-slate-800'}
                        hasBorder={false}
                      />
                    </div>
                  </div>

                  {/* Consumption */}
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                    <SectionHeader icon="electric_meter" title="Lecturas">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-sm text-xs font-mono border border-slate-200">
                        #{recibo.num_medidor || 'N/A'}
                      </span>
                    </SectionHeader>

                    <div>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-3xl font-bold tracking-tight text-slate-800">
                          {formatCurrency(recibo.consumo_calculado)}
                        </span>
                        <span className="text-sm font-medium text-slate-500">kWh</span>
                      </div>

                      {pctChangeText && (
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${pctChangeText.includes('Incremento') ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {pctChangeText.includes('Incremento') ? 'trending_up' : 'trending_down'}
                          </span>
                          {pctChangeText}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Anterior</span>
                          <span className="font-mono text-sm text-slate-800">
                            {recibo.lectura_anterior !== null ? formatCurrency(recibo.lectura_anterior) : '0.00'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Actual</span>
                          <span className="font-mono text-sm text-slate-800">
                            {recibo.lectura_actual !== null ? formatCurrency(recibo.lectura_actual) : '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consumption Trend Chart */}
                {renderChart()}
              </div>

              {/* Right Column (Finances) */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full">
                  <div className="p-5 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">receipt_long</span> Desglose de Cargos
                    </h4>
                  </div>

                  <div className="p-5 flex-grow space-y-3 text-sm">
                    <CargoLine label="Energía Activa" amount={recibo.cargo_energia} className="text-slate-600" />
                    <CargoLine label="Cargo Fijo" amount={recibo.cargo_fijo} className="text-slate-600" />
                    <CargoLineConditional value={recibo.cargo_mantenimiento} label="Mantenimiento" className="text-slate-600" />
                    <CargoLineConditional value={recibo.multa_manipulacion} label="Multa Manipulación" />
                    <CargoLineConditional value={recibo.multa_reconexion} label="Multa Reconexión" />
                    <CargoLineConditional value={recibo.cargo_corte} label="Cargo por Corte" />
                    <CargoLineConditional value={recibo.instalacion_medidor} label="Instalación Medidor" />

                    {recibo.cargos_dinamicos?.map((cd) => (
                      <CargoLine key={cd.id} label={cd.descripcion} amount={cd.monto} className="text-rose-600" />
                    ))}

                    <CargoLineConditional value={recibo.deuda_vencida} label="Deuda Anterior" className="text-rose-600 font-medium" />

                    {parseFloat(recibo.descuento || 0) > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        <span>Descuento Especial</span>
                        <span className="font-mono">- S/ {formatCurrency(recibo.descuento)}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 bg-slate-50 border-t border-slate-200 rounded-b-lg space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-mono text-slate-800">S/ {formatCurrency(recibo.subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3">
                      <span className="text-slate-600">IGV (18%)</span>
                      <span className="font-mono text-slate-800">S/ {formatCurrency(recibo.igv)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3">
                      <span className="font-bold text-slate-800 uppercase text-xs tracking-wider">TOTAL</span>
                      <span className="font-bold text-xl text-blue-700">S/ {formatCurrency(recibo.total)}</span>
                    </div>

                    {pagosHistorial.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                        <div className="flex justify-between items-center text-sm text-emerald-600">
                          <span className="font-medium">Pagado</span>
                          <span className="font-mono">- S/ {formatCurrency(totalPagado)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-rose-600">
                          <span>SALDO ACTUAL</span>
                          <span className="font-mono">
                            S/ {formatCurrency(Math.max(0, parseFloat(recibo.total) - totalPagado))}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Edit Cargos */}
        {renderEditModal()}
      </div>
    );
  };

  // ── Final render ───────────────────────────────────────────────────
  if (onClose) {
    return (
      <>
        <div
          className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity print:hidden ${isClosing ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-300'}`}
          onClick={handleClose}
        />
        <div className={`fixed right-0 top-0 bottom-0 w-full max-w-4xl bg-surface shadow-2xl z-50 flex flex-col border-l border-outline-variant overflow-y-auto ${isClosing ? 'animate-out slide-out-to-right duration-300 fill-mode-forwards' : 'animate-in slide-in-from-right duration-300'}`}>
          {renderContent()}
        </div>
      </>
    );
  }

  return <main className="flex-grow flex flex-col relative overflow-hidden bg-background">{renderContent()}</main>;
};

export default ReceiptDetail;
