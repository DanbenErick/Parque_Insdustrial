const cellText = (value) => {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') {
    if ('text' in value) return String(value.text);
    if ('result' in value) return cellText(value.result);
    if ('richText' in value) return value.richText.map(part => part.text).join('');
  }
  return String(value);
};

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += char;
  }
  if (quoted) throw new Error('CSV con comillas sin cerrar.');
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
};

export const parseImportFile = async (file) => {
  let matrix;
  if (/\.csv$/i.test(file.name)) {
    matrix = parseCsv((await file.text()).replace(/^\uFEFF/, ''));
  } else if (/\.xlsx$/i.test(file.name)) {
    const { default: ExcelJS } = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const sheet = workbook.worksheets[0];
    matrix = sheet ? Array.from({ length: sheet.rowCount }, (_, index) => {
      const row = sheet.getRow(index + 1);
      return Array.from({ length: sheet.columnCount }, (_, col) => cellText(row.getCell(col + 1).value));
    }) : [];
  } else {
    throw new Error('Solo se admiten archivos .xlsx o .csv.');
  }

  const [headers = [], ...data] = matrix;
  return data.filter(row => row.some(value => String(value).trim())).map(row =>
    Object.fromEntries(headers.map((header, index) => [String(header).trim(), row[index] ?? '']))
  );
};
