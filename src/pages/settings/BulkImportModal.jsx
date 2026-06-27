import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';

const TEMPLATE_HEADERS = [
  'mes_anio', 'documento_identidad', 'num_serie',
  'lectura_anterior', 'lectura_actual',
  'lectura_anterior_punta', 'lectura_actual_punta',
  'factor_potencia', 'precio_factor_potencia',
  'cargo_fijo', 'cargo_corte', 'multa_manipulacion', 'multa_reconexion', 'deuda_vencida', 'instalacion_medidor', 'descuento',
  'estado_pago', 'fecha_pago', 'metodo_pago', 'numero_operacion'
];

const MOCK_DATA = [
  ['2026-06', '10050400', 'MED-001', 100, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'Pagado', '2026-06-15', 'Transferencia', 'OP-001'],
  ['2026-06', '73028967', 'MED-002', 200, 380, 50, 85, 12.5, 0.05, 0, 0, 0, 0, 10, 0, 0, 'Pagado', '2026-06-18', 'Efectivo', ''],
  ['2026-06', '04015514', 'MED-003', 500, 620, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 0, 'Pendiente', '', '', ''],
  ['2026-06', '40000004', '', 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 'Pagado', '2026-06-20', 'Depósito', 'DEP-999'],
  ['2026-06', '50000005', 'MED-005', 300, 450, 0, 0, 0, 0, 0, 50, 100, 0, 0, 20, 'Pendiente', '', '', ''],
];

const BulkImportModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Facturación', {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    const colDefs = [
      { header: 'mes_anio', key: 'mes_anio', width: 14 },
      { header: 'documento_identidad', key: 'doc', width: 20 },
      { header: 'num_serie', key: 'med', width: 16 },
      { header: 'lectura_anterior', key: 'la', width: 18 },
      { header: 'lectura_actual', key: 'lact', width: 18 },
      { header: 'lectura_anterior_punta', key: 'lap', width: 22 },
      { header: 'lectura_actual_punta', key: 'lactp', width: 22 },
      { header: 'factor_potencia', key: 'fp', width: 18 },
      { header: 'precio_factor_potencia', key: 'pfp', width: 22 },
      { header: 'cargo_fijo', key: 'cf', width: 14 },
      { header: 'cargo_corte', key: 'cc', width: 14 },
      { header: 'multa_manipulacion', key: 'mm', width: 20 },
      { header: 'multa_reconexion', key: 'mr', width: 20 },
      { header: 'deuda_vencida', key: 'dv', width: 16 },
      { header: 'instalacion_medidor', key: 'im', width: 20 },
      { header: 'descuento', key: 'desc', width: 14 },
      { header: 'estado_pago', key: 'ep', width: 16 },
      { header: 'fecha_pago', key: 'fpa', width: 16 },
      { header: 'metodo_pago', key: 'mp', width: 18 },
      { header: 'numero_operacion', key: 'nop', width: 20 },
    ];
    sheet.columns = colDefs;

    // Estilos del header
    const headerRow = sheet.getRow(1);
    headerRow.height = 32;
    headerRow.eachCell((cell, colNumber) => {
      // Columnas obligatorias (1-3) en azul oscuro, opcionales en gris
      const isRequired = colNumber <= 5;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isRequired ? 'FF1E3A8A' : 'FF475569' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = { bottom: { style: 'medium', color: { argb: 'FF1E293B' } } };
    });

    // Datos de ejemplo
    MOCK_DATA.forEach((dataRow, idx) => {
      const row = sheet.addRow(dataRow);
      row.height = 22;
      row.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: colNumber <= 3 ? 'left' : 'center' };
        cell.font = { size: 10, color: { argb: 'FF1E293B' } };
        // Formato texto para documento
        if (colNumber === 2) cell.numFmt = '@';
        if (colNumber === 3) cell.numFmt = '@';
      });
      // Zebra striping
      if (idx % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F9FF' } };
        });
      }
    });

    // Hoja de instrucciones
    const instrSheet = workbook.addWorksheet('Instrucciones');
    instrSheet.columns = [
      { header: 'Columna', key: 'col', width: 25 },
      { header: 'Requerida', key: 'req', width: 12 },
      { header: 'Descripción', key: 'desc', width: 60 },
      { header: 'Ejemplo', key: 'ejemplo', width: 25 },
    ];
    const instrHeader = instrSheet.getRow(1);
    instrHeader.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    instrHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };
    instrHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    instrHeader.height = 28;

    const instrucciones = [
      ['mes_anio', 'SÍ', 'Periodo de facturación. Debe existir en el sistema.', '2026-06'],
      ['documento_identidad', 'SÍ', 'DNI o RUC del socio. Debe existir en el sistema.', '10050400'],
      ['num_serie', 'Condicional', 'N° de medidor. Vacío = socio sin medidor (cargo fijo).', 'MED-001'],
      ['lectura_anterior', 'Si hay medidor', 'Lectura anterior en kWh.', '100.00'],
      ['lectura_actual', 'Si hay medidor', 'Lectura actual en kWh. Debe ser >= anterior.', '250.50'],
      ['lectura_anterior_punta', 'NO', 'Solo para medidores Hora Punta.', '0.00'],
      ['lectura_actual_punta', 'NO', 'Solo para medidores Hora Punta.', '30.00'],
      ['factor_potencia', 'NO', 'Energía reactiva en kVARh.', '0.00'],
      ['precio_factor_potencia', 'NO', 'Precio por kVARh de energía reactiva.', '0.00'],
      ['cargo_fijo', 'NO', 'Cargo fijo adicional (S/). Default: 10 si no tiene medidor.', '0.00'],
      ['cargo_corte', 'NO', 'Cargo por corte de servicio (S/).', '0.00'],
      ['multa_manipulacion', 'NO', 'Multa por manipulación de medidor (S/).', '0.00'],
      ['multa_reconexion', 'NO', 'Multa por reconexión (S/).', '0.00'],
      ['deuda_vencida', 'NO', 'Deuda vencida arrastrada de meses anteriores (S/).', '0.00'],
      ['instalacion_medidor', 'NO', 'Cobro por instalación de medidor nuevo (S/).', '0.00'],
      ['descuento', 'NO', 'Descuento aplicado al subtotal (S/).', '0.00'],
      ['estado_pago', 'NO', 'Pagado, Pendiente o vacío (default: Pendiente).', 'Pagado'],
      ['fecha_pago', 'Si pagado', 'Fecha del pago (YYYY-MM-DD). Solo si estado_pago = Pagado.', '2026-06-15'],
      ['metodo_pago', 'Si pagado', 'Transferencia, Efectivo, Depósito, Cheque.', 'Transferencia'],
      ['numero_operacion', 'NO', 'Código de transacción bancaria.', 'OP-12345'],
    ];
    instrucciones.forEach((instr, idx) => {
      const row = instrSheet.addRow(instr);
      if (idx % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Plantilla_Importacion_Facturacion.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
        toast.error('Solo se permiten archivos Excel (.xlsx, .xls, .csv)');
        return;
      }
      setFile(selectedFile);
      setResults(null);

      // Parsear inmediatamente
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

        if (rows.length === 0) {
          toast.error('El archivo está vacío.');
          setFile(null);
          return;
        }
        if (!rows[0].hasOwnProperty('mes_anio') || !rows[0].hasOwnProperty('documento_identidad')) {
          toast.error('El formato no es correcto. Faltan columnas obligatorias (mes_anio, documento_identidad). Descarga la plantilla.');
          setFile(null);
          return;
        }
        setParsedRows(rows);
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!parsedRows || parsedRows.length === 0) return;

    setIsProcessing(true);
    try {
      const res = await api.post('/importar/facturacion-masiva', parsedRows);
      setResults(res.data);

      if (res.data.successful.length > 0) {
        toast.success(`Se importaron ${res.data.successful.length} registros exitosamente.`);
        if (onImportSuccess) onImportSuccess();
      }
      if (res.data.failed.length > 0) {
        toast.error(`Fallaron ${res.data.failed.length} registros. Revisa el resumen.`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Ocurrió un error al procesar la importación.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setParsedRows(null);
    setResults(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant animate-in zoom-in-95 duration-200 max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[24px]">database_upload</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-surface tracking-tight leading-none mb-1">
                Importar Facturación Masiva
              </h3>
              <p className="text-xs text-on-surface-variant font-medium">
                Carga lecturas, recibos y pagos desde un solo archivo Excel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { resetModal(); onClose(); }}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors shadow-sm relative z-10 border border-outline-variant/50"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto custom-scrollbar bg-surface-container-lowest/50">
          {!results ? (
            <>
              {/* Paso 1: Descargar Plantilla */}
              <div className="bg-surface border border-outline-variant rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors flex items-center justify-between">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="ml-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    Paso 1: Descargar Plantilla
                  </h4>
                  <p className="text-on-surface-variant text-xs mt-0.5">Incluye hoja de instrucciones y datos de ejemplo para todos los casos.</p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="px-4 py-2.5 bg-surface-container-highest text-on-surface font-bold text-xs rounded-xl hover:bg-surface-variant border border-outline-variant flex items-center gap-2 transition-all shadow-sm group-hover:shadow hover:-translate-y-0.5"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">download</span>
                  Descargar Plantilla
                </button>
              </div>

              {/* Paso 2: Subir archivo */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-5 shadow-inner relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500 pointer-events-none" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-1.5 relative z-10">
                  <span className="material-symbols-outlined text-[16px]">upload</span>
                  Paso 2: Subir archivo completado
                </h4>

                <div
                  className={`relative z-10 mt-2 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all bg-surface/60 backdrop-blur-sm ${file ? 'border-primary shadow-md' : 'border-outline-variant hover:border-primary/50 hover:bg-surface cursor-pointer'}`}
                  onClick={() => !file && fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                  />

                  {file ? (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                      <div className="w-14 h-14 rounded-2xl bg-green-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                        <span className="material-symbols-outlined text-[28px]">task</span>
                      </div>
                      <p className="font-bold text-base text-on-surface">{file.name}</p>
                      <p className="text-xs text-on-surface-variant font-medium mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                      {parsedRows && (
                        <p className="text-xs text-primary font-bold mt-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">table_rows</span>
                          {parsedRows.length} filas detectadas
                        </p>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); setParsedRows(null); }}
                        className="mt-5 px-4 py-1.5 rounded-lg bg-error/10 text-error text-xs font-bold hover:bg-error/20 transition-colors"
                      >
                        Quitar archivo
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center opacity-70 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-[32px]">note_add</span>
                      </div>
                      <p className="font-bold text-sm text-on-surface">Haz clic para seleccionar el archivo</p>
                      <p className="text-xs text-on-surface-variant mt-1">Formatos admitidos: .xlsx, .xls o .csv</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Previsualización */}
              {parsedRows && parsedRows.length > 0 && (
                <div className="bg-surface border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-outline-variant bg-surface-container-lowest flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">preview</span>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      Paso 3: Previsualización ({parsedRows.length} registros)
                    </h4>
                  </div>
                  <div className="overflow-x-auto max-h-[200px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead className="bg-surface-container-low sticky top-0 z-10">
                        <tr>
                          <th className="py-2 px-3 text-[9px] font-bold text-on-surface-variant uppercase">#</th>
                          <th className="py-2 px-3 text-[9px] font-bold text-on-surface-variant uppercase">Periodo</th>
                          <th className="py-2 px-3 text-[9px] font-bold text-on-surface-variant uppercase">Documento</th>
                          <th className="py-2 px-3 text-[9px] font-bold text-on-surface-variant uppercase">Medidor</th>
                          <th className="py-2 px-3 text-[9px] font-bold text-on-surface-variant uppercase">L. Ant.</th>
                          <th className="py-2 px-3 text-[9px] font-bold text-on-surface-variant uppercase">L. Act.</th>
                          <th className="py-2 px-3 text-[9px] font-bold text-on-surface-variant uppercase">Consumo</th>
                          <th className="py-2 px-3 text-[9px] font-bold text-on-surface-variant uppercase">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.slice(0, 50).map((row, idx) => {
                          const consumo = (parseFloat(row.lectura_actual) || 0) - (parseFloat(row.lectura_anterior) || 0);
                          return (
                            <tr key={idx} className={`border-t border-outline-variant/30 ${idx % 2 === 0 ? 'bg-surface-container-lowest' : ''}`}>
                              <td className="py-1.5 px-3 text-[10px] font-data-mono text-on-surface-variant">{idx + 1}</td>
                              <td className="py-1.5 px-3 text-[10px] font-bold text-on-surface">{row.mes_anio}</td>
                              <td className="py-1.5 px-3 text-[10px] font-data-mono text-on-surface">{row.documento_identidad}</td>
                              <td className="py-1.5 px-3 text-[10px] font-data-mono text-primary">{row.num_serie || '—'}</td>
                              <td className="py-1.5 px-3 text-[10px] font-data-mono text-on-surface-variant">{row.lectura_anterior || '—'}</td>
                              <td className="py-1.5 px-3 text-[10px] font-data-mono font-bold text-on-surface">{row.lectura_actual || '—'}</td>
                              <td className="py-1.5 px-3 text-[10px] font-data-mono font-bold text-primary">{row.num_serie ? consumo.toFixed(2) : '—'}</td>
                              <td className="py-1.5 px-3">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  (row.estado_pago || '').toLowerCase() === 'pagado'
                                    ? 'bg-green-500/10 text-green-600'
                                    : 'bg-orange-500/10 text-orange-600'
                                }`}>
                                  {row.estado_pago || 'Pendiente'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {parsedRows.length > 50 && (
                    <div className="px-5 py-2 border-t border-outline-variant text-[10px] text-on-surface-variant text-center font-medium">
                      Mostrando 50 de {parsedRows.length} filas...
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Resultados */
            <div className="flex flex-col gap-5">
              <div className="bg-surface-variant/30 rounded-2xl border border-outline-variant p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[32px]">{results.failed.length === 0 ? 'check_circle' : 'info'}</span>
                </div>
                <h4 className="font-bold text-on-surface text-lg mb-4">Importación Completada</h4>
                <div className="flex justify-center gap-10">
                  <div className="text-center">
                    <p className="text-3xl font-data-mono font-bold text-on-surface">{results.successful.length + results.failed.length}</p>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mt-1">Procesados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-data-mono font-bold text-green-600">{results.successful.length}</p>
                    <p className="text-xs text-green-600 uppercase tracking-wider font-bold mt-1">Exitosos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-data-mono font-bold text-error">{results.failed.length}</p>
                    <p className="text-xs text-error uppercase tracking-wider font-bold mt-1">Fallidos</p>
                  </div>
                </div>
              </div>

              {/* Detalle de éxitos */}
              {results.successful.length > 0 && (
                <div className="border border-green-500/20 bg-green-50/30 dark:bg-green-900/10 rounded-2xl overflow-hidden flex flex-col max-h-[150px]">
                  <div className="bg-green-500/10 px-4 py-2 border-b border-green-500/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-green-600">check</span>
                    <p className="font-bold text-green-600 text-xs uppercase tracking-wider">Registros importados</p>
                  </div>
                  <div className="overflow-y-auto custom-scrollbar text-xs p-3 text-on-surface-variant">
                    {results.successful.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2 py-1">
                        <span className="text-green-500 text-[10px]">✓</span>
                        <span className="font-data-mono text-[10px]">Fila {s.row}</span>
                        <span className="text-on-surface-variant text-[10px]">— Doc: {s.documento}, Med: {s.medidor}, Per: {s.periodo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detalle de errores */}
              {results.failed.length > 0 && (
                <div className="border border-error/20 bg-error/5 rounded-2xl overflow-hidden flex flex-col max-h-[200px]">
                  <div className="bg-error/10 px-4 py-2 border-b border-error/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-error">error</span>
                    <p className="font-bold text-error text-xs uppercase tracking-wider">Detalles de errores</p>
                  </div>
                  <div className="overflow-y-auto custom-scrollbar p-0">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-error/5 sticky top-0">
                        <tr>
                          <th className="py-2 px-4 text-[10px] font-bold text-error uppercase">Fila</th>
                          <th className="py-2 px-4 text-[10px] font-bold text-error uppercase">Documento</th>
                          <th className="py-2 px-4 text-[10px] font-bold text-error uppercase">Medidor</th>
                          <th className="py-2 px-4 text-[10px] font-bold text-error uppercase">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.failed.map((f, idx) => (
                          <tr key={idx} className="border-t border-error/10">
                            <td className="py-2 px-4 text-xs font-data-mono text-on-surface">{f.row}</td>
                            <td className="py-2 px-4 text-xs font-data-mono text-on-surface">{f.documento}</td>
                            <td className="py-2 px-4 text-xs font-data-mono text-on-surface">{f.medidor}</td>
                            <td className="py-2 px-4 text-xs text-error font-medium">{f.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant bg-surface-container flex justify-end gap-3 shrink-0">
          {results ? (
            <button
              type="button"
              onClick={() => { resetModal(); onClose(); }}
              className="px-6 py-2.5 bg-primary text-on-primary text-sm font-bold rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Cerrar
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { resetModal(); onClose(); }}
                className="px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-variant rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!parsedRows || parsedRows.length === 0 || isProcessing}
                onClick={handleImport}
                className="group px-6 py-2.5 text-sm bg-primary text-on-primary font-bold rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
              >
                {isProcessing
                  ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                  : <span className="material-symbols-outlined text-[18px] group-hover:-translate-y-0.5 transition-transform">cloud_upload</span>
                }
                {isProcessing ? 'Procesando...' : `Importar ${parsedRows?.length || 0} Registros`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
