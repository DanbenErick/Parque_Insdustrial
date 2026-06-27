import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';

const TEMPLATE_HEADERS = [
  'documento_identidad',
  'nombre_razonsocial',
  'actividad_rubro',
  'correo',
  'telefono',
  'cargo_representante',
  'clave_acceso',
  'medidor_num_serie',
  'medidor_tipo',
  'medidor_direccion'
];

const MOCK_DATA = [
  ['10000001', 'Caso 1: Socio normal', 'Comercio', 'test1@mail.com', '999000111', 'Socio', '123456', 'MED-001', 'Normal', 'Avenida Principal 123'],
  ['20000002', 'Caso 2: Socio con 1 medidor hora punta', 'Manufactura', 'test2@mail.com', '999000222', 'Socio', '123456', 'MED-002', 'Hora Punta', 'Calle Dos 456'],
  ['30000003', 'Caso 3: Empresa con 2 medidores (Mismo DNI)', 'Industrial', 'test3@mail.com', '999000333', 'Socio', '123456', 'MED-003-A', 'Normal', 'Parque Tres - Almacén A'],
  ['30000003', 'Caso 3: Empresa con 2 medidores (Mismo DNI)', 'Industrial', 'test3@mail.com', '999000333', 'Socio', '123456', 'MED-003-B', 'Hora Punta', 'Parque Tres - Almacén B'],
  ['40000004', 'Caso 4: Socio sin medidor (Aún no instalado)', 'General', 'test4@mail.com', '999000444', 'Socio', '123456', '', 'Sin Medidor', ''],
];

const TenantImportModal = ({ onClose, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Socios', {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    sheet.columns = [
      { header: 'documento_identidad', key: 'doc', width: 20 },
      { header: 'nombre_razonsocial', key: 'nombre', width: 45 },
      { header: 'actividad_rubro', key: 'rubro', width: 20 },
      { header: 'correo', key: 'correo', width: 30 },
      { header: 'telefono', key: 'telefono', width: 15 },
      { header: 'cargo_representante', key: 'cargo', width: 20 },
      { header: 'clave_acceso', key: 'clave', width: 15 },
      { header: 'medidor_num_serie', key: 'med_serie', width: 20 },
      { header: 'medidor_tipo', key: 'med_tipo', width: 20 },
      { header: 'medidor_direccion', key: 'med_dir', width: 35 }
    ];

    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1A73E8' } // Color primary
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: {style:'thin', color: {argb:'FFCCCCCC'}},
        left: {style:'thin', color: {argb:'FFCCCCCC'}},
        bottom: {style:'thin', color: {argb:'FFCCCCCC'}},
        right: {style:'thin', color: {argb:'FFCCCCCC'}}
      };
    });

    // Data validation params
    const validationRule = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Normal,Tiempo Real,Sin medidor"'],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Tipo de Medidor Inválido',
      error: 'Seleccione una opción de la lista.'
    };

    // Update MOCK_DATA 'Hora Punta' to 'Tiempo Real' to match backend enums
    const MOCK_DATA_FIXED = MOCK_DATA.map(row => {
      const newRow = [...row];
      if (newRow[8] === 'Hora Punta') newRow[8] = 'Tiempo Real';
      return newRow;
    });

    MOCK_DATA_FIXED.forEach((dataRow, idx) => {
      const row = sheet.addRow(dataRow);
      const rowIndex = idx + 2;

      // Inyectar fórmula en la columna de correo (Columna D = B para nombre)
      row.getCell('correo').value = { 
        formula: `LOWER(SUBSTITUTE(SUBSTITUTE(B${rowIndex}, " ", ""), ".", "")) & "@gmail.com"`,
        result: dataRow[3]
      };

      row.eachCell((cell) => {
        // Formato texto para documento_identidad para que no borre los ceros
        if (cell._column.key === 'doc') {
          cell.numFmt = '@';
        }
      });
      if (idx % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F9FF' } };
        });
      }
    });

    // Agregar filas vacías extra con la fórmula ya puesta y validación
    for (let i = 0; i < 1000; i++) {
      const rowIndex = MOCK_DATA.length + 2 + i;
      const row = sheet.addRow([]);
      row.getCell('correo').value = { 
        formula: `IF(ISBLANK(B${rowIndex}), "", LOWER(SUBSTITUTE(SUBSTITUTE(B${rowIndex}, " ", ""), ".", "")) & "@gmail.com")`
      };
      row.getCell('doc').numFmt = '@'; // Mantener formato texto
    }

    // Apply data validation to all rows (from row 2 to end)
    for (let i = 2; i <= sheet.rowCount; i++) {
      sheet.getCell(`I${i}`).dataValidation = validationRule;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "Plantilla_Importacion_Socios.xlsx";
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
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
      
      // Filtrar filas vacías (donde no hay documento de identidad)
      const rows = rawRows.filter(r => r.documento_identidad && String(r.documento_identidad).trim() !== '');

      if (rows.length === 0) {
        toast.error('El archivo está vacío o no contiene socios válidos.');
        setIsProcessing(false);
        return;
      }

      // Format check (at least one valid column)
      if (!rows[0].hasOwnProperty('documento_identidad')) {
        toast.error('El formato no es correcto. Falta la columna documento_identidad. Por favor descarga la plantilla.');
        setIsProcessing(false);
        return;
      }

      // Limpiar y formatear las filas según las reglas de negocio
      const cleanRows = rows.map(r => {
        let tipo = String(r.medidor_tipo || '').trim();
        let serie = String(r.medidor_num_serie || '').trim();
        let direccion = String(r.medidor_direccion || '').trim();

        if (tipo.toLowerCase() === 'sin medidor') {
          serie = '';
          direccion = '';
        }

        return {
          ...r,
          clave_acceso: r.clave_acceso ? String(r.clave_acceso) : '123456',
          actividad_rubro: r.actividad_rubro || 'General',
          cargo_representante: r.cargo_representante || 'Socio',
          medidor_tipo: tipo,
          medidor_num_serie: serie,
          medidor_direccion: direccion
        };
      });

      const res = await api.post('/usuarios/bulk', cleanRows);
      
      setResults({
        total: rows.length,
        successful: res.data.successful.length,
        failed: res.data.failed.length,
        failedDetails: res.data.failed,
        sociosCreados: res.data.sociosCreados,
        medidoresCreados: res.data.medidoresCreados
      });

      if (res.data.successful.length > 0) {
        toast.success(`Se importaron ${res.data.successful.length} socios exitosamente.`);
        onImportSuccess();
      }
      if (res.data.failed.length > 0) {
        toast.error(`Fallaron ${res.data.failed.length} registros. Revisa el resumen.`);
      }

    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al procesar el archivo.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant animate-in zoom-in-95 duration-200">
        
        {/* Header (Mismo estilo que Aperturar Periodo) */}
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[24px]">upload_file</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-surface tracking-tight leading-none mb-1">
                Importar Socios
              </h3>
              <p className="text-xs text-on-surface-variant font-medium">
                Carga masiva de usuarios desde un archivo Excel
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors shadow-sm relative z-10 border border-outline-variant/50"
            title="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto custom-scrollbar bg-surface-container-lowest/50">
          {!results ? (
            <>
              {/* Sección 1: Descarga */}
              <div className="bg-surface border border-outline-variant rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors flex items-center justify-between">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="ml-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    Paso 1: Preparar archivo
                  </h4>
                  <p className="text-on-surface-variant text-xs mt-0.5">Descarga la plantilla oficial con el formato correcto.</p>
                </div>
                <button 
                  onClick={downloadTemplate}
                  className="px-4 py-2.5 bg-surface-container-highest text-on-surface font-bold text-xs rounded-xl hover:bg-surface-variant border border-outline-variant flex items-center gap-2 transition-all shadow-sm group-hover:shadow hover:-translate-y-0.5"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">download</span>
                  Descargar Plantilla
                </button>
              </div>

              {/* Sección 2: Subida */}
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
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
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
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-surface-variant/30 rounded-xl border border-outline-variant p-5 text-center">
                <h4 className="font-bold text-on-surface text-lg mb-2">Importación Completada</h4>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="text-center">
                    <p className="text-3xl font-data-mono font-bold text-on-surface">{results.total}</p>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mt-1">Filas Leídas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-data-mono font-bold text-green-600">{results.sociosCreados || 0}</p>
                    <p className="text-[10px] text-green-600 uppercase tracking-wider font-bold mt-1">Socios Creados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-data-mono font-bold text-primary">{results.medidoresCreados || 0}</p>
                    <p className="text-[10px] text-primary uppercase tracking-wider font-bold mt-1">Medidores Creados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-data-mono font-bold text-error">{results.failed}</p>
                    <p className="text-[10px] text-error uppercase tracking-wider font-bold mt-1">Filas Fallidas</p>
                  </div>
                </div>
              </div>

              {results.failed > 0 && (
                <div className="border border-error/20 bg-error/5 rounded-xl overflow-hidden flex flex-col max-h-[200px]">
                  <div className="bg-error/10 px-4 py-2 border-b border-error/20">
                    <p className="font-bold text-error text-xs uppercase tracking-wider">Detalles de errores</p>
                  </div>
                  <div className="overflow-y-auto custom-scrollbar p-0">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-error/5 sticky top-0">
                        <tr>
                          <th className="py-2 px-4 text-[10px] font-bold text-error uppercase">Fila</th>
                          <th className="py-2 px-4 text-[10px] font-bold text-error uppercase">Documento</th>
                          <th className="py-2 px-4 text-[10px] font-bold text-error uppercase">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.failedDetails.map((f, idx) => (
                          <tr key={idx} className="border-t border-error/10">
                            <td className="py-2 px-4 text-xs font-data-mono text-on-surface">{f.row}</td>
                            <td className="py-2 px-4 text-xs font-data-mono text-on-surface">{f.documento}</td>
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
        <div className="px-6 py-4 border-t border-outline-variant bg-surface-container flex justify-end gap-3">
          {results ? (
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-primary text-on-primary text-sm font-bold rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Cerrar y ver Socios
            </button>
          ) : (
            <>
              <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-variant rounded-xl transition-colors">
                Cancelar
              </button>
              <button
                type="button" 
                disabled={!file || isProcessing}
                onClick={handleImport}
                className="group px-6 py-2.5 text-sm bg-primary text-on-primary font-bold rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
              >
                {isProcessing
                  ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                  : <span className="material-symbols-outlined text-[18px] group-hover:-translate-y-0.5 transition-transform">cloud_upload</span>
                }
                {isProcessing ? 'Procesando...' : 'Importar Socios'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantImportModal;
