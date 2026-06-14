import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'sonner';

// ── Constants ────────────────────────────────────────────────────────
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const ESTADO_CONFIG = {
  Pagado:       { icon: 'check_circle', bg: 'bg-emerald-500/10 text-emerald-600', text: 'text-emerald-700', badge: 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' },
  'Pago Parcial': { icon: 'timelapse', bg: 'bg-sky-500/10 text-sky-600', text: 'text-sky-700', badge: 'bg-sky-500/10 text-sky-700 border border-sky-500/20' },
  Pendiente:    { icon: 'schedule', bg: 'bg-error/10 text-error', text: 'text-error', badge: 'bg-error/10 text-error border border-error/20' },
};
const ESTADO_DEFAULT = { icon: 'warning', bg: 'bg-error/10 text-error', text: 'text-error', badge: 'bg-error/10 text-error border border-error/20' };

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
const CargoLine = React.memo(({ label, amount, className = 'text-on-surface' }) => (
  <div className={`flex justify-between items-center text-xs ${className}`}>
    <span>{label}</span>
    <span className="font-data-mono font-bold">S/ {formatCurrency(amount)}</span>
  </div>
));

const CargoLineConditional = React.memo(({ value, label, className = 'text-error font-medium' }) => {
  const parsed = parseFloat(value || 0);
  if (parsed <= 0) return null;
  return <CargoLine label={label} amount={value} className={className} />;
});

const InfoRow = React.memo(({ label, value, valueClassName = 'text-on-surface font-bold', hasBorder = true }) => (
  <div className={`flex justify-between items-center ${hasBorder ? 'border-b border-outline-variant/50 pb-2' : ''}`}>
    <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{label}</span>
    <span className={`text-xs ${valueClassName}`}>{value}</span>
  </div>
));

const SectionHeader = React.memo(({ icon, title, children }) => (
  <div className="flex items-center justify-between mb-3 border-b border-outline-variant/50 pb-2">
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-primary/70 text-[18px]">{icon}</span>
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{title}</h4>
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
      const response = await api.get(`/recibos/${id}/pdf-v3`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Recibo_${recibo.periodo}_${(recibo.nombre_razonsocial || '').replace(/\s+/g, '_')}.pdf`;
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
      <div className="bg-surface border border-outline-variant/50 rounded-xl shadow-sm p-4 md:p-6 flex-grow flex flex-col">
        <SectionHeader icon="bar_chart" title="Historial de Consumo (6 Meses)" />
        <div className="flex items-end gap-2 sm:gap-4 h-40 mt-4 border-b border-outline-variant/50 pb-2 flex-grow">
          {displayData.map((h, i) => {
            const height = maxConsumo > 0 ? (parseFloat(h.consumo_calculado || 0) / maxConsumo) * 100 : 0;
            const isCurrent = h.mes_anio === recibo.mes_anio;
            return (
              <div key={i} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                <div
                  className={`w-full max-w-[40px] rounded-t-sm transition-all relative ${isCurrent ? 'bg-primary' : 'bg-primary/20 hover:bg-primary/40'}`}
                  style={{ height: `${Math.max(height, 5)}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-on-surface text-surface text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 font-bold">
                    {parseFloat(h.consumo_calculado || 0).toFixed(2)} kWh
                  </div>
                </div>
                <span className={`text-[10px] mt-2 truncate w-full text-center ${isCurrent ? 'font-bold text-primary' : 'text-on-surface-variant font-medium'}`}>
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm print:hidden animate-in fade-in duration-200">
        <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg border border-outline-variant/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="px-lg py-md border-b border-outline-variant/50 bg-surface-container-low flex justify-between items-center">
            <h3 className="font-headline-sm font-bold flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              Editar Multas y Cargos
            </h3>
            <button
              onClick={closeEditModal}
              className="p-1 hover:bg-surface-container-highest rounded-full text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="p-lg">
            <form onSubmit={handleSaveCargos} className="space-y-md">
              {/* Dynamic Cargos Section */}
              <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/50 space-y-3">
                <label className="text-[11px] font-bold text-on-surface uppercase tracking-wider block">
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
                          className={`flex items-center justify-between p-2.5 rounded-lg border ${isSelected ? 'bg-primary/5 border-primary/30' : 'bg-surface border-outline-variant/50 hover:bg-surface-container-highest'} transition-colors cursor-pointer`}
                          onClick={() => handleToggleCargoDinamico(cargo, !isSelected)}
                        >
                          <label className="flex items-center gap-3 cursor-pointer flex-grow pointer-events-none">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="rounded text-primary focus:ring-primary w-4 h-4 border-outline-variant"
                            />
                            <div>
                              <span className="text-xs font-bold block text-on-surface">{cargo.descripcion}</span>
                              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${cargo.tipo === 'Multa' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
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
              <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/20 space-y-4">
                <div className="flex items-center gap-2 border-b border-emerald-500/10 pb-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">loyalty</span>
                  <h4 className="font-bold text-emerald-700 text-xs uppercase tracking-wide">Descuento a Favor</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Monto (S/)</label>
                    <input
                      type="number" step="0.01" min="0"
                      className="w-full border border-emerald-500/30 rounded-lg px-3 py-2 bg-surface text-sm font-data-mono text-emerald-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      value={cargos.descuento}
                      onChange={(e) => handleCargosChange('descuento', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider truncate" title="Motivo del Descuento (Obligatorio)">
                      Motivo (Obligatorio)
                    </label>
                    <input
                      type="text"
                      required={cargos.descuento > 0}
                      className="w-full border border-emerald-500/30 rounded-lg px-3 py-2 bg-surface text-sm text-emerald-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-emerald-500/50"
                      value={cargos.motivo_descuento}
                      onChange={(e) => handleCargosChange('motivo_descuento', e.target.value)}
                      placeholder="Especifique la razón..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-md mt-md border-t border-outline-variant/50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 border border-outline-variant/50 text-on-surface rounded-lg font-bold text-sm hover:bg-surface-container-highest transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
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
      <div className="flex-grow flex flex-col relative min-h-screen bg-background w-full overflow-hidden">
        <div className="relative z-10 flex-grow overflow-y-auto p-4 pt-5 pb-32 print:p-0 print:overflow-visible print:h-auto">
          <div className="space-y-4 max-w-5xl mx-auto">

            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 print:hidden">
              <div>
                <button
                  onClick={handleBack}
                  className="flex items-center text-on-surface-variant hover:text-on-surface transition-colors mb-1 text-[10px] font-bold uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined mr-1 text-[14px]">arrow_back</span>
                  VOLVER AL LISTADO
                </button>
                <h2 className="text-xl font-headline-sm tracking-tight text-on-surface font-bold">Detalle de Recibo</h2>
              </div>

              <div className="flex gap-2">
                {recibo.estado === 'Pendiente' && (
                  <button
                    onClick={openEditModal}
                    className="flex items-center px-3 py-1.5 h-8 bg-surface-container-highest border border-outline-variant/50 text-on-surface rounded-md hover:bg-surface-variant transition-colors font-bold text-xs shadow-sm"
                  >
                    <span className="material-symbols-outlined mr-1 text-[16px]">edit</span> Editar
                  </button>
                )}
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center px-3 py-1.5 h-8 bg-primary text-on-primary rounded-md hover:opacity-90 transition-colors font-bold text-xs shadow-sm"
                >
                  <span className="material-symbols-outlined mr-1 text-[16px]">picture_as_pdf</span> Descargar PDF
                </button>
              </div>
            </div>

            {/* Dashboard Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

              {/* Left Column (Info & Metrics) */}
              <div className="lg:col-span-2 flex flex-col gap-3">

                {/* Hero Card */}
                <div className="bg-surface rounded-xl border border-outline-variant/50 shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div className="flex gap-3 items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${estadoConfig.bg}`}>
                      <span className="material-symbols-outlined text-[20px]">{estadoConfig.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-on-surface leading-tight">{recibo.nombre_razonsocial}</h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">badge</span> {recibo.documento_identidad}
                        </span>
                        <span className="text-outline-variant">•</span>
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">location_on</span> {recibo.direccion || 'Sin dirección'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left md:text-right w-full md:w-auto bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/50">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant mb-0.5">TOTAL A PAGAR</p>
                    <p className={`text-2xl font-data-mono font-bold tracking-tight leading-none ${estadoConfig.text}`}>
                      <span className="text-sm font-medium mr-1 text-on-surface-variant">S/</span>
                      {formatCurrency(recibo.total)}
                    </p>
                    <div className="mt-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${estadoConfig.badge}`}>
                        {recibo.estado}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Period & Consumption Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {/* Dates */}
                  <div className="bg-surface rounded-xl border border-outline-variant/50 shadow-sm p-4">
                    <SectionHeader icon="calendar_month" title="Período de Facturación" />
                    <div className="space-y-2.5 mt-2">
                      <InfoRow label="Mes" value={formatPeriodo(recibo.mes_anio)} />
                      <InfoRow label="Emisión" value={recibo.fecha_emision ? new Date(recibo.fecha_emision).toLocaleDateString('es-PE') : '-'} />
                      <InfoRow
                        label="Vencimiento"
                        value={recibo.fecha_vencimiento ? new Date(recibo.fecha_vencimiento).toLocaleDateString('es-PE') : '-'}
                        valueClassName={isVencido ? 'text-error' : 'text-on-surface font-bold'}
                        hasBorder={false}
                      />
                    </div>
                  </div>

                  {/* Consumption */}
                  <div className="bg-surface rounded-xl border border-outline-variant/50 shadow-sm p-4">
                    <SectionHeader icon="electric_meter" title="Lecturas">
                      <span className="bg-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-data-mono font-bold border border-outline-variant/50">
                        #{recibo.num_medidor || 'N/A'}
                      </span>
                    </SectionHeader>

                    <div>
                      <div className="flex items-baseline gap-1 mb-1.5">
                        <span className="text-2xl font-data-mono font-bold tracking-tight text-on-surface leading-none">
                          {formatCurrency(recibo.consumo_calculado)}
                        </span>
                        <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">kWh</span>
                      </div>

                      {pctChangeText && (
                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${pctChangeText.includes('Incremento') ? 'bg-error/10 text-error border border-error/20' : 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'}`}>
                          <span className="material-symbols-outlined text-[12px]">
                            {pctChangeText.includes('Incremento') ? 'trending_up' : 'trending_down'}
                          </span>
                          {pctChangeText}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 mt-3 pt-2.5 border-t border-outline-variant/50">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant block mb-0.5">Anterior</span>
                          <span className="font-data-mono text-xs font-bold text-on-surface">
                            {recibo.lectura_anterior !== null ? formatCurrency(recibo.lectura_anterior) : '0.00'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant block mb-0.5">Actual</span>
                          <span className="font-data-mono text-xs font-bold text-on-surface">
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
                <div className="bg-surface rounded-xl border border-outline-variant/50 shadow-sm flex flex-col h-full overflow-hidden">
                  <div className="p-3 border-b border-outline-variant/50 bg-surface-container-low">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary/70 text-[16px]">receipt_long</span> Desglose de Cargos
                    </h4>
                  </div>

                  <div className="p-4 flex-grow space-y-2">
                    <CargoLine label="Energía Activa" amount={recibo.cargo_energia} className="text-on-surface-variant font-medium" />
                    <CargoLine label="Cargo Fijo" amount={recibo.cargo_fijo} className="text-on-surface-variant font-medium" />
                    <CargoLineConditional value={recibo.cargo_mantenimiento} label="Mantenimiento" className="text-on-surface-variant font-medium" />
                    <CargoLineConditional value={recibo.multa_manipulacion} label="Multa Manipulación" />
                    <CargoLineConditional value={recibo.multa_reconexion} label="Multa Reconexión" />
                    <CargoLineConditional value={recibo.cargo_corte} label="Cargo por Corte" />
                    <CargoLineConditional value={recibo.instalacion_medidor} label="Instalación Medidor" />

                    {recibo.cargos_dinamicos?.map((cd) => (
                      <CargoLine key={cd.id} label={cd.descripcion} amount={cd.monto} className="text-error font-medium" />
                    ))}

                    <CargoLineConditional value={recibo.deuda_vencida} label="Deuda Anterior" className="text-error font-bold" />

                    {parseFloat(recibo.descuento || 0) > 0 && (
                      <div className="flex justify-between items-center text-emerald-700 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 text-xs">
                        <span className="font-bold">Descuento Especial</span>
                        <span className="font-data-mono font-bold">- S/ {formatCurrency(recibo.descuento)}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/50 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-on-surface-variant font-bold">Subtotal</span>
                      <span className="font-data-mono font-bold text-on-surface">S/ {formatCurrency(recibo.subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-b border-outline-variant/50 pb-2">
                      <span className="text-on-surface-variant font-bold">IGV (18%)</span>
                      <span className="font-data-mono font-bold text-on-surface">S/ {formatCurrency(recibo.igv)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-on-surface uppercase text-[10px] tracking-wider">TOTAL</span>
                      <span className="font-data-mono font-bold text-xl text-primary leading-none">S/ {formatCurrency(recibo.total)}</span>
                    </div>

                    {pagosHistorial.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-outline-variant/50 space-y-2">
                        <div className="flex justify-between items-center text-xs text-emerald-600">
                          <span className="font-bold">Pagado</span>
                          <span className="font-data-mono font-bold">- S/ {formatCurrency(totalPagado)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-error">
                          <span>SALDO ACTUAL</span>
                          <span className="font-data-mono text-sm">
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
    return React.createElement(React.Fragment, null, 
      createPortal(
        <>
          <div
            className={`fixed inset-0 bg-scrim/40 backdrop-blur-sm z-[60] transition-opacity print:hidden ${isClosing ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-300'}`}
            onClick={handleClose}
          />
          <div className={`fixed right-0 top-0 bottom-0 w-full max-w-4xl bg-surface shadow-2xl z-[70] flex flex-col border-l border-outline-variant/50 overflow-y-auto ${isClosing ? 'animate-out slide-out-to-right duration-300 fill-mode-forwards' : 'animate-in slide-in-from-right duration-300'}`}>
            {renderContent()}
          </div>
        </>,
        document.body
      )
    );
  }

  return <main className="flex-grow flex flex-col relative overflow-hidden bg-background">{renderContent()}</main>;
};

export default ReceiptDetail;
