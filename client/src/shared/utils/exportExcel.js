// client/src/shared/utils/exportExcel.js
// Utilidad compartida para exportar datos de experimentos como .xlsx con formato profesional.

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Exporta datos de un experimento como archivo .xlsx con formato profesional.
 *
 * @param {Object} options
 * @param {string}   options.title       - Nombre del experimento (ej: "Principio de Bernoulli")
 * @param {string}   options.subtitle    - Subtítulo o descripción corta
 * @param {string[]} options.params      - Líneas de parámetros (ej: ["h = 50 cm", "D = 20 cm"])
 * @param {string[]} options.headers     - Encabezados de columna
 * @param {Array[]}  options.data        - Arreglo de filas (cada fila es un arreglo de valores)
 * @param {string}   options.filename    - Nombre del archivo sin extensión
 * @param {string}   [options.sheetName] - Nombre de la hoja (default: "Datos")
 */
export async function exportToExcel({
  title,
  subtitle = '',
  params = [],
  headers = [],
  data = [],
  filename = 'lab2hand_export',
  sheetName = 'Datos',
}) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Lab2Hand';
  wb.created = new Date();

  const ws = wb.addWorksheet(sheetName);

  const colCount = headers.length;

  // ── Colores ──
  const brandBlue = '2563EB';
  const darkBg = '0B1220';
  const headerBg = '1E3A5F';
  const headerFont = 'FFFFFF';
  const altRowBg = 'F0F4F8';
  const borderColor = 'B0BEC5';
  const paramColor = '475569';

  // ── Título ──
  const titleRow = ws.addRow([title]);
  ws.mergeCells(titleRow.number, 1, titleRow.number, colCount);
  const titleCell = titleRow.getCell(1);
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: brandBlue } };
  titleCell.alignment = { horizontal: 'left', vertical: 'middle' };
  titleRow.height = 30;

  // ── Subtítulo ──
  if (subtitle) {
    const subRow = ws.addRow([subtitle]);
    ws.mergeCells(subRow.number, 1, subRow.number, colCount);
    const subCell = subRow.getCell(1);
    subCell.font = { name: 'Calibri', size: 11, italic: true, color: { argb: '64748B' } };
    subCell.alignment = { horizontal: 'left', vertical: 'middle' };
  }

  // ── Fecha ──
  const dateRow = ws.addRow([`Fecha de exportación: ${new Date().toLocaleString('es-CO')}`]);
  ws.mergeCells(dateRow.number, 1, dateRow.number, colCount);
  const dateCell = dateRow.getCell(1);
  dateCell.font = { name: 'Calibri', size: 10, color: { argb: paramColor } };

  // ── Parámetros ──
  if (params.length > 0) {
    const paramRow = ws.addRow([`Parámetros: ${params.join('  ·  ')}`]);
    ws.mergeCells(paramRow.number, 1, paramRow.number, colCount);
    const paramCell = paramRow.getCell(1);
    paramCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: paramColor } };
  }

  // ── Fila vacía separadora ──
  ws.addRow([]);

  // ── Encabezados ──
  const headerRow = ws.addRow(headers);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: headerFont } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBg } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      bottom: { style: 'medium', color: { argb: brandBlue } },
    };
  });

  // ── Datos ──
  data.forEach((row, idx) => {
    const dataRow = ws.addRow(row);
    dataRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 10.5 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
      };

      // Filas alternas
      if (idx % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: altRowBg } };
      }
    });
  });

  // ── Fila de total/resumen ──
  if (data.length > 0) {
    ws.addRow([]);
    const summaryRow = ws.addRow([`Total de registros: ${data.length}`]);
    ws.mergeCells(summaryRow.number, 1, summaryRow.number, colCount);
    const summaryCell = summaryRow.getCell(1);
    summaryCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: '94A3B8' } };
  }

  // ── Autoajustar anchos de columna ──
  ws.columns.forEach((col, i) => {
    const headerLen = headers[i] ? headers[i].length : 8;
    let maxLen = headerLen;
    data.forEach((row) => {
      const val = row[i];
      const len = val != null ? String(val).length : 0;
      if (len > maxLen) maxLen = len;
    });
    col.width = Math.max(12, Math.min(maxLen + 4, 30));
  });

  // ── Congelar encabezados ──
  const headerRowNumber = headerRow.number;
  ws.views = [{ state: 'frozen', ySplit: headerRowNumber }];

  // ── Exportar ──
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `${filename}.xlsx`);
}