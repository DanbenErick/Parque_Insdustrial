export const formatPeriodo = (periodo) => {
  const match = /^(\d{4})-(\d{2})$/.exec(String(periodo || ''));
  if (!match || Number(match[2]) < 1 || Number(match[2]) > 12) return periodo || 'N/A';
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${meses[Number(match[2]) - 1]} ${match[1]}`;
};
