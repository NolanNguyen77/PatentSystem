import ExcelJS from 'exceljs';
import { Readable } from 'stream';

export interface ExcelRow {
  [key: string]: any;
}

export interface ColumnMapping {
  [systemField: string]: string | null; // Maps system field to CSV column
}

/**
 * Parse Excel file and return rows
 */
export const parseExcel = async (fileBuffer: Buffer): Promise<ExcelRow[]> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer as any);

  const worksheet = workbook.worksheets[0];
  const rows: ExcelRow[] = [];

  // Get headers from first row
  const headers: string[] = [];
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber - 1] = cell.value?.toString() || '';
  });

  // Parse data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header row

    const rowData: ExcelRow = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1];
      if (header) {
        rowData[header] = cell.value?.toString() || '';
      }
    });

    rows.push(rowData);
  });

  return rows;
};

/**
 * Parse CSV file and return rows
 */
export const parseCSV = async (fileBuffer: Buffer): Promise<ExcelRow[]> => {
  const csv = require('csv-parser');
  const rows: ExcelRow[] = [];

  return new Promise((resolve, reject) => {
    const stream = Readable.from(fileBuffer.toString());

    stream
      .pipe(csv())
      .on('data', (row: ExcelRow) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
};

/**
 * Map CSV columns to system fields
 */
export const mapColumns = (
  csvRow: ExcelRow,
  mapping: ColumnMapping
): Record<string, any> => {
  const mapped: Record<string, any> = {};

  Object.entries(mapping).forEach(([systemField, csvColumn]) => {
    if (csvColumn && csvRow[csvColumn] !== undefined) {
      mapped[systemField] = csvRow[csvColumn];
    }
  });

  return mapped;
};

/**
 * Export data to Excel
 */
export const exportToExcel = async (
  data: any[],
  columns: string[],
  filename: string
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');

  // Add headers
  worksheet.addRow(columns);

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Add data rows
  data.forEach((row) => {
    const rowData = columns.map((col) => row[col] || '');
    worksheet.addRow(rowData);
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    if (column.header) {
      column.width = 15;
    }
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as any as Buffer;
};

/**
 * Export data to CSV
 */
export const exportToCSV = (data: any[], columns: string[]): string => {
  const headers = columns.join(',');
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col] || '';
      // Escape commas and quotes
      if (value.includes(',') || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return '\uFEFF' + [headers, ...rows].join('\n');
};

