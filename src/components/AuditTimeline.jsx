const ACTIONS = {
  CREACION: { label: 'Creación', icon: 'add_circle', tone: 'emerald' },
  MODIFICACION: { label: 'Modificación', icon: 'edit_note', tone: 'amber' },
  ANULACION: { label: 'Anulación', icon: 'cancel', tone: 'red' },
  REFACTURACION: { label: 'Refacturación', icon: 'published_with_changes', tone: 'violet' },
  CAMBIO_ESTADO: { label: 'Cambio de estado', icon: 'swap_horiz', tone: 'blue' },
};

const TONES = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
};

const FIELD_LABELS = {
  estado: 'Estado',
  estado_validacion: 'Estado del pago',
  lectura_anterior: 'Lectura anterior',
  lectura_actual: 'Lectura actual',
  consumo_calculado: 'Consumo calculado',
  lectura_anterior_punta: 'Lectura anterior punta',
  lectura_actual_punta: 'Lectura actual punta',
  consumo_calculado_punta: 'Consumo punta',
  factor_potencia: 'Energía reactiva',
  max_demanda_fuera_punta: 'Demanda fuera de punta',
  max_demanda_punta: 'Demanda punta',
  metodo_pago: 'Método de pago',
  numero_operacion: 'N° de operación',
  fecha_pago: 'Fecha del pago',
  monto_pagado: 'Monto pagado',
  cargo_fijo: 'Cargo fijo',
  cargo_corte: 'Cargo de corte',
  multa_manipulacion: 'Multa por manipulación',
  multa_reconexion: 'Multa de reconexión',
  instalacion_medidor: 'Instalación de medidor',
  deuda_pendiente: 'Deuda pendiente',
  deuda_consumo: 'Deuda de consumo',
  deuda_vencida: 'Deuda vencida',
  descuento: 'Descuento',
  motivo_descuento: 'Motivo del descuento',
  subtotal: 'Subtotal',
  igv: 'IGV',
  total: 'Total',
  deleted_at: 'Fecha de anulación',
  justificacion: 'Justificación',
  es_cambio_medidor: 'Cambio de medidor',
  lectura_final_viejo: 'Lectura final del medidor anterior',
  lectura_inicial_nuevo: 'Lectura inicial del medidor nuevo',
  motivo_anulacion: 'Motivo de anulación',
  cargos_dinamicos: 'Cargos adicionales',
};

const OMITTED_FIELDS = new Set([
  'id', 'medidor_id', 'periodo_id', 'operario_id', 'recibo_id', 'usuario_id',
  'num_serie', 'periodo', 'numero_comprobante', 'recibo_estado',
  'nombre_razonsocial', 'documento_identidad', 'direccion', 'socio_direccion',
  'socio_email', 'telefono', 'correo', 'medidor_tipo', 'medidor_direccion',
  'periodo_inicio', 'periodo_fin', 'fecha_registro', 'fecha_emision', 'fecha_vencimiento',
]);

const comparable = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return 'Sin valor';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'object') return Array.isArray(value) ? `${value.length} elemento(s)` : 'Datos actualizados';
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    const date = new Date(text);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString('es-PE');
  }
  return text;
};

const getChanges = (event) => {
  const before = event.valores_anteriores && typeof event.valores_anteriores === 'object' ? event.valores_anteriores : {};
  const after = event.valores_nuevos && typeof event.valores_nuevos === 'object' ? event.valores_nuevos : {};
  if (!Object.keys(before).length || !Object.keys(after).length) return [];
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((field) => !OMITTED_FIELDS.has(field) && comparable(before[field]) !== comparable(after[field]))
    .map((field) => ({ field, before: before[field], after: after[field] }));
};

const AuditTimeline = ({ events = [], loading = false, emptyMessage = 'Aún no hay movimientos registrados.' }) => {
  if (loading) {
    return <div className="py-6 flex items-center justify-center gap-2 text-xs font-bold text-on-surface-variant"><span className="material-symbols-outlined animate-spin text-[18px]" translate="no">progress_activity</span>Cargando auditoría...</div>;
  }

  if (!events.length) {
    return <div className="py-5 text-center text-xs text-on-surface-variant bg-surface-container-low rounded-xl border border-dashed border-outline-variant">{emptyMessage}</div>;
  }

  return (
    <div className="relative ml-2 border-l-2 border-outline-variant/70 space-y-4 py-1">
      {events.map((event) => {
        const action = ACTIONS[event.accion] || { label: event.accion, icon: 'history', tone: 'blue' };
        const changes = getChanges(event);
        const visibleChanges = changes.slice(0, 8);
        return (
          <article key={`${event.origen || 'audit'}-${event.id}`} className="relative pl-5">
            <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${TONES[action.tone].split(' ')[0]}`} />
            <div className="bg-white border border-outline-variant rounded-xl p-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase ${TONES[action.tone]}`}>
                    <span className="material-symbols-outlined text-[14px]" translate="no">{action.icon}</span>
                    {action.label}
                  </span>
                  <p className="mt-2 text-xs font-bold text-on-surface break-words">{event.usuario || 'Usuario del sistema'}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">{event.rol || 'Rol no disponible'}</p>
                </div>
                <time className="text-[10px] text-on-surface-variant text-right shrink-0" dateTime={event.fecha_evento}>
                  {new Date(event.fecha_evento).toLocaleString('es-PE')}
                </time>
              </div>

              {event.motivo && (
                <div className="mt-3 bg-surface-container-low rounded-lg px-3 py-2 border border-outline-variant/60">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant mb-0.5">Motivo</p>
                  <p className="text-xs text-on-surface break-words">{event.motivo}</p>
                </div>
              )}

              {visibleChanges.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Cambios realizados</p>
                  {visibleChanges.map((change) => (
                    <div key={change.field} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 text-[10px] bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-2.5 py-2">
                      <div className="min-w-0">
                        <p className="font-bold text-on-surface-variant truncate">{FIELD_LABELS[change.field] || change.field.replaceAll('_', ' ')}</p>
                        <p className="font-data-mono text-red-700 break-words">{formatValue(change.before)}</p>
                      </div>
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant" translate="no">arrow_forward</span>
                      <p className="font-data-mono font-bold text-emerald-700 break-words min-w-0">{formatValue(change.after)}</p>
                    </div>
                  ))}
                  {changes.length > visibleChanges.length && <p className="text-[10px] text-on-surface-variant">+ {changes.length - visibleChanges.length} cambio(s) adicional(es)</p>}
                </div>
              )}

              {(event.ip_address || event.user_agent) && (
                <details className="mt-3 text-[10px] text-on-surface-variant">
                  <summary className="cursor-pointer font-bold hover:text-on-surface">Datos técnicos</summary>
                  <div className="mt-1.5 space-y-1 break-all">
                    {event.ip_address && <p><strong>IP:</strong> {event.ip_address}</p>}
                    {event.user_agent && <p><strong>Dispositivo:</strong> {event.user_agent}</p>}
                  </div>
                </details>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default AuditTimeline;
