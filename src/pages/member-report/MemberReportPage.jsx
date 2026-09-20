import React, { useCallback, useMemo, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const SHORT_MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const TYPE_COLORS = ['#515B3A', '#565e74', '#825100', '#00647c', '#7c3aed', '#9f1239'];
const FILL_ICON = { fontVariationSettings: "'FILL' 1" };
const STATUS = {
  Pagado: ['bg-green-100 text-green-700', 'check_circle'],
  'Pago Parcial': ['bg-blue-100 text-blue-700', 'payments'],
  Vencido: ['bg-red-100 text-red-700', 'warning'],
  Pendiente: ['bg-yellow-100 text-yellow-800', 'schedule'],
  Anulado: ['bg-slate-100 text-slate-600', 'cancel'],
};

const num = (value) => Number.parseFloat(value) || 0;
const money = (value) => num(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const kwh = (value) => num(value).toLocaleString('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
const periodOf = (item) => item?.periodo || item?.mes_anio || '';
const memberKey = (item) => item?.usuario_id != null ? String(item.usuario_id) : `nombre:${item?.socio || item?.propietario || ''}`;
const meterKey = (item) => item?.medidor_id != null ? String(item.medidor_id) : `serie:${item?.medidor_num_serie || item?.num_serie || 'sin-medidor'}`;
const meterDetails = (item) => ({
  key: meterKey(item),
  address: item?.medidor_direccion || item?.direccion || item?.socio_direccion || 'Sin dirección',
  serial: item?.medidor_num_serie || item?.num_serie || 'Sin medidor',
  type: item?.medidor_tipo || item?.tipo || 'No especificado',
});
const pendingAmount = (receipt) => Math.max(0, num(receipt?.saldo_pendiente));
const paidAmount = (receipt) => Math.min(num(receipt?.total), Math.max(0, num(receipt?.total) - pendingAmount(receipt)));

const parsePeriod = (period) => {
  if (!period?.includes('-')) return null;
  const parts = period.split('-');
  const yearFirst = parts[0].length === 4;
  return { year: yearFirst ? parts[0] : parts[1], month: Number.parseInt(yearFirst ? parts[1] : parts[0], 10) - 1 };
};

const periodOrder = (period) => {
  const parsed = parsePeriod(period);
  return parsed ? Number(parsed.year) * 12 + parsed.month : 0;
};

const formatPeriod = (period, short = false) => {
  const parsed = parsePeriod(period);
  if (!parsed || parsed.month < 0 || parsed.month > 11) return period || '-';
  return short ? `${SHORT_MONTHS[parsed.month]} ${parsed.year.slice(-2)}` : `${MONTHS[parsed.month]} ${parsed.year}`;
};

const StatusBadge = React.memo(({ value = 'Pendiente' }) => {
  const [className, icon] = STATUS[value] || STATUS.Pendiente;
  return <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${className}`}><span className="material-symbols-outlined text-[12px]" translate="no" style={FILL_ICON}>{icon}</span>{value}</span>;
});

const KpiCard = React.memo(({ icon, label, value, subtitle, tone = 'text-primary bg-primary/5 border-primary/10' }) => (
  <div className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface p-3 shadow-sm">
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${tone}`}><span className="material-symbols-outlined text-[20px]" translate="no">{icon}</span></div>
    <div className="min-w-0 flex-1"><p className="truncate text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</p><p className="truncate font-data-mono text-lg font-bold leading-tight text-on-surface">{value}</p><p className="truncate text-[9px] text-on-surface-variant/70">{subtitle}</p></div>
  </div>
));

const ChartCard = React.memo(({ title, subtitle, children, className = '' }) => (
  <section className={`flex h-[360px] flex-col rounded-xl border border-outline-variant bg-surface p-4 shadow-sm ${className}`}><div className="mb-3"><h3 className="text-base font-bold text-on-surface">{title}</h3><p className="text-xs text-on-surface-variant">{subtitle}</p></div><div className="relative min-h-0 flex-1">{children}</div></section>
));

const EmptyState = ({ children }) => <div className="flex h-full items-center justify-center px-4 text-center text-sm text-on-surface-variant">{children}</div>;

const ReceiptRow = React.memo(({ receipt, showPeriod = false }) => (
  <tr className="transition-colors hover:bg-surface-container-low">
    <td className="px-4 py-3"><p className="max-w-[240px] truncate text-xs font-bold text-on-surface" title={receipt.socio}>{receipt.socio || 'Socio no identificado'}</p><p className="mt-0.5 flex items-center gap-1 text-[10px] text-on-surface-variant"><span className="material-symbols-outlined text-[12px]" translate="no">electric_meter</span>{receipt.medidor_num_serie || 'Sin medidor'} · {receipt.medidor_tipo || 'No especificado'}</p>{showPeriod && <p className="mt-0.5 text-[10px] font-semibold text-primary">{formatPeriod(periodOf(receipt))}</p>}</td>
    <td className="px-4 py-3"><p className="font-data-mono text-xs font-bold text-primary">{kwh(receipt.consumo_kwh)} kWh</p>{num(receipt.consumo_kwh_punta) > 0 && <p className="text-[10px] text-on-surface-variant">Punta: {kwh(receipt.consumo_kwh_punta)} kWh</p>}</td>
    <td className="px-4 py-3 text-[10px] text-on-surface-variant"><p>Subtotal: <span className="font-data-mono">S/ {money(receipt.subtotal)}</span></p><p>IGV real: <span className="font-data-mono">S/ {money(receipt.igv)}</span></p></td>
    <td className="px-4 py-3 text-[10px] text-on-surface-variant"><p>Pagado: <span className="font-data-mono text-green-700">S/ {money(paidAmount(receipt))}</span></p><p>Saldo: <span className="font-data-mono text-amber-700">S/ {money(pendingAmount(receipt))}</span></p></td>
    <td className="px-4 py-3 text-right"><p className="font-data-mono text-sm font-bold text-on-surface">S/ {money(receipt.total)}</p><StatusBadge value={receipt.estado} /></td>
  </tr>
));

const ReportTable = ({ receipts, historical = false }) => (
  <div className="max-h-[460px] overflow-auto custom-scrollbar"><table className="w-full min-w-[950px] border-collapse text-left"><thead className="sticky top-0 z-10 bg-surface-container-lowest text-[10px] uppercase tracking-wider text-on-surface-variant"><tr><th className="px-4 py-3">Socio / suministro</th><th className="px-4 py-3">Consumo</th><th className="px-4 py-3">Subtotal / IGV</th><th className="px-4 py-3">Pagado / saldo</th><th className="px-4 py-3 text-right">Total / estado</th></tr></thead><tbody className="divide-y divide-outline-variant/50">{receipts.map((receipt) => <ReceiptRow key={receipt.id} receipt={receipt} showPeriod={historical} />)}{!receipts.length && <tr><td colSpan="5" className="px-4 py-12 text-center text-sm text-on-surface-variant">No hay recibos para mostrar.</td></tr>}</tbody></table></div>
);

const MemberReport = ({ lecturas = [], recibos = [], selectedPeriod = '' }) => {
  const [selectedMember, setSelectedMember] = useState('Todos');
  const [selectedMeter, setSelectedMeter] = useState('Todos');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const members = useMemo(() => {
    const result = new Map();
    const addMember = (item, name) => {
      const key = memberKey(item);
      if (key === 'nombre:') return;
      const member = result.get(key) || { key, name: name || 'Socio sin nombre', supplies: new Map() };
      const supply = meterDetails(item);
      if (!member.supplies.has(supply.key)) member.supplies.set(supply.key, supply);
      result.set(key, member);
    };
    recibos.forEach((item) => addMember(item, item.socio));
    lecturas.forEach((item) => addMember(item, item.propietario));
    return [...result.values()]
      .map((member) => ({ ...member, supplies: [...member.supplies.values()] }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [lecturas, recibos]);

  const searchedMembers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es');
    return query ? members.filter((member) => {
      const searchableText = [
        member.name,
        ...member.supplies.flatMap((supply) => [supply.address, supply.serial, supply.type]),
      ].join(' ').toLocaleLowerCase('es');
      return searchableText.includes(query);
    }) : members;
  }, [members, search]);

  const periodReadings = useMemo(() => lecturas.filter((item) => periodOf(item) === selectedPeriod), [lecturas, selectedPeriod]);
  const periodReceipts = useMemo(() => recibos.filter((item) => periodOf(item) === selectedPeriod), [recibos, selectedPeriod]);
  const uniqueMembers = useMemo(() => new Set(periodReceipts.map(memberKey)).size, [periodReceipts]);

  const periodSummary = useMemo(() => ({
    consumption: periodReadings.reduce((sum, item) => sum + num(item.consumo_calculado), 0),
    billed: periodReceipts.reduce((sum, item) => sum + num(item.total), 0),
    paid: periodReceipts.reduce((sum, item) => sum + paidAmount(item), 0),
    pending: periodReceipts.reduce((sum, item) => sum + pendingAmount(item), 0),
  }), [periodReadings, periodReceipts]);

  const topConsumers = useMemo(() => {
    const result = new Map();
    periodReadings.forEach((item) => { const key = memberKey(item); const current = result.get(key) || { name: item.propietario || 'Socio sin nombre', value: 0 }; current.value += num(item.consumo_calculado); result.set(key, current); });
    return [...result.values()].sort((a, b) => b.value - a.value).slice(0, 5);
  }, [periodReadings]);

  const consumptionByType = useMemo(() => {
    const result = {};
    periodReadings.forEach((item) => { const type = item.medidor_tipo || 'No especificado'; result[type] = (result[type] || 0) + num(item.consumo_calculado); });
    return result;
  }, [periodReadings]);

  const typeTotal = useMemo(() => Object.values(consumptionByType).reduce((sum, value) => sum + value, 0), [consumptionByType]);
  const selectedName = useMemo(() => members.find((member) => member.key === selectedMember)?.name || '', [members, selectedMember]);
  const memberReceipts = useMemo(() => selectedMember === 'Todos' ? [] : recibos.filter((item) => memberKey(item) === selectedMember), [recibos, selectedMember]);
  const memberReadings = useMemo(() => selectedMember === 'Todos' ? [] : lecturas.filter((item) => memberKey(item) === selectedMember), [lecturas, selectedMember]);

  const meters = useMemo(() => {
    const result = new Map();
    memberReceipts.forEach((item) => result.set(meterKey(item), { key: meterKey(item), serial: item.medidor_num_serie || 'Sin medidor', type: item.medidor_tipo || '' }));
    memberReadings.forEach((item) => { if (!result.has(meterKey(item))) result.set(meterKey(item), { key: meterKey(item), serial: item.num_serie || 'Sin medidor', type: item.medidor_tipo || '' }); });
    return [...result.values()].sort((a, b) => a.serial.localeCompare(b.serial, 'es'));
  }, [memberReadings, memberReceipts]);

  const scopedReceipts = useMemo(() => selectedMeter === 'Todos' ? memberReceipts : memberReceipts.filter((item) => meterKey(item) === selectedMeter), [memberReceipts, selectedMeter]);
  const scopedReadings = useMemo(() => selectedMeter === 'Todos' ? memberReadings : memberReadings.filter((item) => meterKey(item) === selectedMeter), [memberReadings, selectedMeter]);
  const currentReceipts = useMemo(() => scopedReceipts.filter((item) => periodOf(item) === selectedPeriod), [scopedReceipts, selectedPeriod]);
  const currentReadings = useMemo(() => scopedReadings.filter((item) => periodOf(item) === selectedPeriod), [scopedReadings, selectedPeriod]);
  const recentReceipts = useMemo(() => [...scopedReceipts].sort((a, b) => periodOrder(periodOf(b)) - periodOrder(periodOf(a))).slice(0, 8), [scopedReceipts]);

  const memberSummary = useMemo(() => ({
    consumption: currentReadings.reduce((sum, item) => sum + num(item.consumo_calculado), 0),
    billed: currentReceipts.reduce((sum, item) => sum + num(item.total), 0),
    paid: currentReceipts.reduce((sum, item) => sum + paidAmount(item), 0),
    pending: currentReceipts.reduce((sum, item) => sum + pendingAmount(item), 0),
  }), [currentReadings, currentReceipts]);

  const history = useMemo(() => {
    const result = new Map();
    scopedReadings.forEach((item) => result.set(periodOf(item), (result.get(periodOf(item)) || 0) + num(item.consumo_calculado)));
    return [...result.entries()].sort((a, b) => periodOrder(a[0]) - periodOrder(b[0])).slice(-6);
  }, [scopedReadings]);

  const topData = useMemo(() => ({ labels: topConsumers.map((item) => item.name), datasets: [{ data: topConsumers.map((item) => item.value), backgroundColor: '#00647c', borderRadius: 5 }] }), [topConsumers]);
  const typeData = useMemo(() => ({ labels: Object.keys(consumptionByType), datasets: [{ data: Object.values(consumptionByType), backgroundColor: TYPE_COLORS, borderColor: '#fff', borderWidth: 2 }] }), [consumptionByType]);
  const historyData = useMemo(() => ({ labels: history.map(([period]) => formatPeriod(period, true)), datasets: [{ data: history.map(([, value]) => value), backgroundColor: '#515B3A', borderRadius: 5 }] }), [history]);
  const barOptions = useMemo(() => ({ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${kwh(context.raw)} kWh` } } }, scales: { y: { beginAtZero: true } } }), []);
  const topOptions = useMemo(() => ({ ...barOptions, indexAxis: 'y', scales: { x: { beginAtZero: true }, y: { grid: { display: false } } } }), [barOptions]);
  const typeOptions = useMemo(() => ({ responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true } }, tooltip: { callbacks: { label: (context) => `${context.label}: ${kwh(context.raw)} kWh (${typeTotal ? ((num(context.raw) / typeTotal) * 100).toFixed(1) : 0}%)` } } } }), [typeTotal]);

  const selectMember = useCallback((key) => { setSelectedMember(key); setSelectedMeter('Todos'); setSearch(''); setIsOpen(false); }, []);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <section className="relative z-20 flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface p-4 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="relative w-full max-w-md"><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Socio / propietario</label><button type="button" onClick={() => setIsOpen((value) => !value)} className="flex h-10 w-full items-center justify-between rounded-lg border border-outline-variant bg-white px-3 text-left text-sm font-bold text-on-surface hover:border-primary/50"><span className="flex min-w-0 items-center gap-2"><span className="material-symbols-outlined text-[18px] text-primary" translate="no">group</span><span className="truncate">{selectedMember === 'Todos' ? 'Ver todos los socios' : selectedName}</span></span><span className="material-symbols-outlined text-[18px]" translate="no">{isOpen ? 'expand_less' : 'expand_more'}</span></button>
          {isOpen && <><button type="button" aria-label="Cerrar selector" className="fixed inset-0 z-30 cursor-default" onClick={() => setIsOpen(false)} /><div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-xl border border-outline-variant bg-white shadow-xl"><div className="border-b border-outline-variant p-2"><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar socio, dirección o medidor..." className="h-9 w-full rounded-md border border-outline-variant px-3 text-sm outline-none focus:border-primary" /></div><div className="max-h-80 overflow-y-auto py-1 custom-scrollbar"><button type="button" onClick={() => selectMember('Todos')} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-bold text-primary hover:bg-primary/5"><span className="material-symbols-outlined text-[16px]" translate="no">groups</span>Ver todos los socios</button>{searchedMembers.map((member) => <button key={member.key} type="button" onClick={() => selectMember(member.key)} className="block w-full border-t border-outline-variant/40 px-3 py-2.5 text-left hover:bg-primary/5"><span className="block truncate text-sm font-semibold text-on-surface" title={member.name}>{member.name}</span>{member.supplies.map((supply) => <span key={supply.key} className="mt-1 block text-[10px] leading-snug text-on-surface-variant"><span className="flex min-w-0 items-center gap-1"><span className="material-symbols-outlined shrink-0 text-[12px]" translate="no">location_on</span><span className="truncate" title={supply.address}>{supply.address}</span></span><span className="flex min-w-0 items-center gap-1"><span className="material-symbols-outlined shrink-0 text-[12px]" translate="no">electric_meter</span><span className="truncate" title={`${supply.serial} · ${supply.type}`}>{supply.serial} · {supply.type}</span></span></span>)}</button>)}{!searchedMembers.length && <p className="px-3 py-4 text-center text-xs text-on-surface-variant">No se encontraron socios.</p>}</div></div></>}
        </div>
        {selectedMember !== 'Todos' && meters.length > 1 && <div className="w-full md:max-w-xs"><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Suministro</label><select value={selectedMeter} onChange={(event) => setSelectedMeter(event.target.value)} className="h-10 w-full rounded-lg border border-outline-variant bg-white px-3 text-sm font-bold text-on-surface outline-none focus:border-primary"><option value="Todos">Todos los medidores</option>{meters.map((meter) => <option key={meter.key} value={meter.key}>{meter.serial}{meter.type ? ` · ${meter.type}` : ''}</option>)}</select></div>}
        <div className="shrink-0 md:text-right"><p className="text-xs text-on-surface-variant">Periodo reportado</p><p className="font-bold uppercase text-primary">{formatPeriod(selectedPeriod)}</p></div>
      </section>

      {selectedMember === 'Todos' ? <>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard icon="groups" label="Socios facturados" value={uniqueMembers.toLocaleString('es-PE')} subtitle={`${periodReceipts.length} recibos emitidos`} /><KpiCard icon="bolt" label="Consumo total" value={`${kwh(periodSummary.consumption)} kWh`} subtitle="Suma real de lecturas" /><KpiCard icon="receipt_long" label="Total facturado" value={`S/ ${money(periodSummary.billed)}`} subtitle="Incluye cargos y ajustes" tone="text-slate-700 bg-slate-50 border-slate-200" /><KpiCard icon="account_balance_wallet" label="Saldo pendiente" value={`S/ ${money(periodSummary.pending)}`} subtitle={`Pagado: S/ ${money(periodSummary.paid)}`} tone="text-amber-700 bg-amber-50 border-amber-200" /></div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3"><ChartCard className="lg:col-span-2" title="Socios con mayor consumo" subtitle="Top 5 del periodo, sumando todos sus medidores">{topConsumers.length ? <Bar data={topData} options={topOptions} /> : <EmptyState>No hay lecturas para este periodo.</EmptyState>}</ChartCard><ChartCard title="Consumo por tipo de medidor" subtitle="Distribución real por modalidad de suministro">{Object.keys(consumptionByType).length ? <Doughnut data={typeData} options={typeOptions} /> : <EmptyState>No hay datos de medidores.</EmptyState>}</ChartCard></div>
        <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm"><div className="flex flex-col gap-1 border-b border-outline-variant bg-surface-container-lowest px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-base font-bold text-on-surface">Facturación por socio y suministro</h3><p className="text-[11px] text-on-surface-variant">Valores reales registrados en cada recibo</p></div><span className="text-xs font-medium text-on-surface-variant">{periodReceipts.length} recibos · {uniqueMembers} socios</span></div><ReportTable receipts={periodReceipts} /></section>
      </> : <>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard icon="bolt" label="Consumo del periodo" value={`${kwh(memberSummary.consumption)} kWh`} subtitle={selectedMeter === 'Todos' ? `${meters.length} suministro(s)` : 'Suministro seleccionado'} /><KpiCard icon="receipt_long" label="Total facturado" value={`S/ ${money(memberSummary.billed)}`} subtitle={`${currentReceipts.length} recibo(s)`} tone="text-slate-700 bg-slate-50 border-slate-200" /><KpiCard icon="payments" label="Total pagado" value={`S/ ${money(memberSummary.paid)}`} subtitle="Pagos aplicados al periodo" tone="text-green-700 bg-green-50 border-green-200" /><KpiCard icon="pending_actions" label="Saldo pendiente" value={`S/ ${money(memberSummary.pending)}`} subtitle="Monto aún por cobrar" tone="text-amber-700 bg-amber-50 border-amber-200" /></div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3"><ChartCard className="lg:col-span-2" title="Historial de consumo" subtitle="Consumo consolidado de los últimos 6 periodos">{history.length ? <Bar data={historyData} options={barOptions} /> : <EmptyState>No hay lecturas históricas registradas.</EmptyState>}</ChartCard><ChartCard title="Recibos recientes" subtitle="Importes, saldos y estados registrados"><div className="h-full space-y-2 overflow-y-auto pr-1 custom-scrollbar">{recentReceipts.map((receipt) => <div key={receipt.id} className="rounded-lg border border-outline-variant bg-surface-container-low p-2.5"><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-bold text-on-surface">{formatPeriod(periodOf(receipt))}</p><p className="text-[10px] text-on-surface-variant">{receipt.medidor_num_serie || 'Sin medidor'}</p></div><div className="text-right"><p className="font-data-mono text-xs font-bold text-on-surface">S/ {money(receipt.total)}</p><StatusBadge value={receipt.estado} /></div></div>{pendingAmount(receipt) > 0 && <p className="mt-1 text-right text-[10px] font-semibold text-amber-700">Saldo: S/ {money(pendingAmount(receipt))}</p>}</div>)}{!recentReceipts.length && <EmptyState>No hay recibos registrados.</EmptyState>}</div></ChartCard></div>
        <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm"><div className="border-b border-outline-variant bg-surface-container-lowest px-4 py-3"><h3 className="text-base font-bold text-on-surface">Historial de facturación de {selectedName}</h3><p className="text-[11px] text-on-surface-variant">Un registro por recibo y suministro</p></div><ReportTable receipts={recentReceipts} historical /></section>
      </>}
    </div>
  );
};

export default MemberReport;
