export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const CURRENCY_OPTS = { minimumFractionDigits: 2 };
const KWH_OPTS = { minimumFractionDigits: 2 };

export const fmtCurrency = (v) => parseFloat(v || 0).toLocaleString('en-US', CURRENCY_OPTS);
export const fmtVal = (v) => parseFloat(v || 0).toLocaleString('en-US', KWH_OPTS);
export const parseSafe = (v) => {
  const parsed = parseFloat(v);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatPeriodo = (periodoStr) => {
  if (!periodoStr) return '';
  const parts = periodoStr.split('-');
  if (parts.length !== 2) return periodoStr;
  
  const isYearFirst = parts[0].length === 4;
  const monthIdx = parseInt(isYearFirst ? parts[1] : parts[0], 10) - 1;
  return monthIdx >= 0 && monthIdx < 12 ? MESES[monthIdx] : periodoStr;
};

const shortDateFmt = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const longDateFmt = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const formatDateShort = (isoString) => isoString ? shortDateFmt.format(new Date(isoString)) : '';
export const formatDateLong = (isoString) => isoString ? longDateFmt.format(new Date(isoString)) : '';

export const MODAL_BACKDROP = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } };
export const MODAL_CONTENT = { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.95, opacity: 0 }, transition: { duration: 0.2, ease: "easeOut" } };
