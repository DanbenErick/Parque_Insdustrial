import { downloadBlob, MIME_TYPES } from '../../../utils/downloadFile';

export const exportLecturasToExcel = async (medidores, lecturasMap, periodo) => {
  if (!medidores || medidores.length === 0) {
    throw new Error('No hay medidores para exportar.');
  }

  if (!periodo) {
    throw new Error('No hay periodo seleccionado.');
  }

  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Parque Industrial Jicamarca';
  workbook.created = new Date();

  const mesNombre = periodo.mes_anio ? periodo.mes_anio.toUpperCase() : 'PERIODO';
  const sheet = workbook.addWorksheet(`Lecturas ${mesNombre.replace(' ', '_').substring(0, 30)}`);

  // Diseño General
  sheet.properties.defaultRowHeight = 20;

  // Titulo del Reporte
  sheet.mergeCells('A1:O1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = `REPORTE DE LECTURAS - ${mesNombre}`;
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0D9488' } // Teal 600
  };
  sheet.getRow(1).height = 30;

  // Fecha de Exportación
  sheet.mergeCells('A2:O2');
  const dateCell = sheet.getCell('A2');
  const now = new Date();
  dateCell.value = `Exportado el: ${now.toLocaleDateString('es-ES')} ${now.toLocaleTimeString('es-ES')}`;
  dateCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF475569' } };
  dateCell.alignment = { horizontal: 'right' };

  // Espacio en blanco
  sheet.addRow([]);

  // Definición de Columnas (sin "header" para no sobreescribir la fila 1)
  sheet.columns = [
    { key: 'idx', width: 6 },
    { key: 'socio', width: 40 },
    { key: 'direccion', width: 25 },
    { key: 'medidor', width: 15 },
    { key: 'isTR', width: 12 },
    { key: 'estado', width: 12 },

    // Normal / Fuera de Punta
    { key: 'antN', width: 12 },
    { key: 'actN', width: 12 },
    { key: 'consN', width: 12 },

    // Punta
    { key: 'antP', width: 12 },
    { key: 'actP', width: 12 },
    { key: 'consP', width: 12 },

    { key: 'factorP', width: 15 },
    { key: 'fechaReg', width: 18 },
    { key: 'observacion', width: 25 },
  ];

  // Escribir y dar estilo a la Cabecera en la fila 4
  const headerRow = sheet.getRow(4);
  headerRow.values = [
    'N°', 'SOCIO / EMPRESA', 'DIRECCIÓN', 'MEDIDOR', 'MULTITARIFA', 'ESTADO',
    'L. ANT (N)', 'L. ACT (N)', 'CONS. (N)',
    'L. ANT (P)', 'L. ACT (P)', 'CONS. (P)',
    'FACTOR POT.', 'FECHA REG.', 'OBSERVACIÓN'
  ];

  headerRow.height = 25;
  headerRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colNumber >= 7 && colNumber <= 9 ? 'FF2563EB' : colNumber >= 10 && colNumber <= 12 ? 'FFEA580C' : 'FF475569' }
      // Azul para Normal, Naranja para Punta, Gris para resto
    };
    cell.border = {
      top: {style:'thin'},
      left: {style:'thin'},
      bottom: {style:'thin'},
      right: {style:'thin'}
    };
  });

  // Agregar Datos
  let idx = 1;
  medidores.forEach(medidor => {
    const lectura = lecturasMap.get(medidor.num_serie);
    const isTR = medidor.tipo === 'Tiempo Real' || medidor.tipo === 'Hora Punta' || medidor.tipo === 'TRIPLE_TARIFA';
    const registrado = !!lectura;

    const row = sheet.addRow({
      idx: idx++,
      socio: medidor.propietario || 'Sin socio',
      direccion: medidor.direccion || medidor.socio_direccion || '-',
      medidor: medidor.num_serie,
      isTR: isTR ? 'SÍ' : 'NO',
      estado: registrado ? 'REGISTRADO' : 'PENDIENTE',

      antN: lectura ? Number(lectura.lectura_anterior || 0) : '-',
      actN: lectura ? Number(lectura.lectura_actual || 0) : '-',
      consN: lectura ? Number(lectura.consumo_total || 0) : '-',

      antP: lectura && isTR ? Number(lectura.lectura_anterior_punta || 0) : '-',
      actP: lectura && isTR ? Number(lectura.lectura_actual_punta || 0) : '-',
      consP: lectura && isTR ? Number(lectura.consumo_punta || 0) : '-',

      factorP: lectura && isTR ? Number(lectura.factor_potencia || 0) : '-',
      fechaReg: lectura && lectura.fecha_registro ? new Date(lectura.fecha_registro).toLocaleString('es-ES') : '-',
      observacion: (lectura?.justificacion_modificacion || lectura?.observacion || '')
    });

    // Estilos de la fila
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 9 };
      cell.alignment = { vertical: 'middle', horizontal: colNumber >= 7 && colNumber <= 13 ? 'right' : colNumber === 6 ? 'center' : 'left' };
      cell.border = {
        top: {style:'thin', color: {argb:'FFE2E8F0'}},
        left: {style:'thin', color: {argb:'FFE2E8F0'}},
        bottom: {style:'thin', color: {argb:'FFE2E8F0'}},
        right: {style:'thin', color: {argb:'FFE2E8F0'}}
      };

      // Color Estado
      if (colNumber === 6) {
        if (registrado) {
          cell.font = { ...cell.font, color: { argb: 'FF16A34A' }, bold: true }; // Verde
        } else {
          cell.font = { ...cell.font, color: { argb: 'FFDC2626' }, bold: true }; // Rojo
        }
      }

      // Formato numérico para lecturas
      if (colNumber >= 7 && colNumber <= 13 && cell.value !== '-') {
         cell.numFmt = '#,##0.00';
      }
    });
  });

  // Alternar colores de fila para mejor lectura
  for (let i = 5; i <= sheet.rowCount; i++) {
    if (i % 2 === 0) {
      sheet.getRow(i).eachCell({ includeEmpty: true }, cell => {
        if(!cell.fill) {
           cell.fill = {
             type: 'pattern',
             pattern: 'solid',
             fgColor: { argb: 'FFF8FAFC' }
           };
        }
      });
    }
  }

  // Descargar Archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const mesFile = mesNombre.replace(' ', '_');
  downloadBlob(buffer, `Lecturas_Parque_Jicamarca_${mesFile}.xlsx`, MIME_TYPES.EXCEL);
};
