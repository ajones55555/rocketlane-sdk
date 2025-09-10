// Export/Import utilities for the Rocketlane SDK
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export type ExportFormat = 'csv' | 'xlsx' | 'json' | 'xml' | 'pdf';
export type ImportFormat = 'csv' | 'xlsx' | 'json';
export type ErrorHandlingMode = 'stop' | 'skip' | 'collect';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  fields?: string[];
  includeHeaders?: boolean;
  dateFormat?: string;
  encoding?: string;
  delimiter?: string; // For CSV
  sheetName?: string; // For Excel
  template?: string; // For PDF
  compress?: boolean;
}

export interface ImportOptions {
  mapping?: Record<string, string>; // Map import fields to API fields
  validateFirst?: boolean;
  onError?: ErrorHandlingMode;
  skipRows?: number;
  maxRows?: number;
  dateFormat?: string;
  batchSize?: number;
  dryRun?: boolean;
}

export interface ExportResult {
  filename: string;
  format: ExportFormat;
  recordCount: number;
  fileSize: number;
  downloadUrl?: string;
  exportedAt: Date;
  fields: string[];
}

export interface ImportResult<T> {
  success: boolean;
  imported: T[];
  errors: ImportError[];
  skipped: number;
  total: number;
  importedAt: Date;
  dryRun: boolean;
}

export interface ImportError {
  row: number;
  field?: string;
  value?: any;
  error: string;
  data?: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ImportError[];
  warnings: string[];
  preview: Record<string, any>[];
}

export class ExportUtility {
  /**
   * Export data to CSV format
   */
  static exportToCSV<T>(
    data: T[],
    options: Partial<ExportOptions> = {}
  ): ExportResult {
    const {
      filename = `export_${Date.now()}.csv`,
      fields,
      includeHeaders = true,
      delimiter = ',',
      encoding = 'utf-8'
    } = options;

    if (data.length === 0) {
      throw new Error('No data to export');
    }

    // Determine fields to export
    const exportFields = fields || Object.keys(data[0] as any);
    
    let csvContent = '';
    
    // Add headers
    if (includeHeaders) {
      csvContent += exportFields.map(field => this.escapeCsvField(field)).join(delimiter) + '\n';
    }
    
    // Add data rows
    data.forEach(item => {
      const row = exportFields.map(field => {
        const value = (item as any)[field];
        return this.escapeCsvField(this.formatValue(value, options));
      });
      csvContent += row.join(delimiter) + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=' + encoding });
    
    return {
      filename,
      format: 'csv',
      recordCount: data.length,
      fileSize: blob.size,
      exportedAt: new Date(),
      fields: exportFields
    };
  }

  /**
   * Export data to JSON format
   */
  static exportToJSON<T>(
    data: T[],
    options: Partial<ExportOptions> = {}
  ): ExportResult {
    const {
      filename = `export_${Date.now()}.json`,
      fields,
      compress = false
    } = options;

    let exportData = data;

    // Filter fields if specified
    if (fields) {
      exportData = data.map(item => {
        const filtered: Partial<T> = {};
        fields.forEach(field => {
          if (field in (item as any)) {
            (filtered as any)[field] = (item as any)[field];
          }
        });
        return filtered as T;
      });
    }

    const jsonContent = JSON.stringify({
      metadata: {
        exportedAt: new Date().toISOString(),
        recordCount: data.length,
        fields: fields || Object.keys(data[0] as any)
      },
      data: exportData
    }, null, compress ? 0 : 2);

    const blob = new Blob([jsonContent], { type: 'application/json' });
    
    return {
      filename,
      format: 'json',
      recordCount: data.length,
      fileSize: blob.size,
      exportedAt: new Date(),
      fields: fields || Object.keys(data[0] as any)
    };
  }

  /**
   * Export data to Excel format using xlsx library
   */
  static exportToExcel<T>(
    data: T[],
    options: Partial<ExportOptions> = {}
  ): ExportResult {
    const {
      filename = `export_${Date.now()}.xlsx`,
      fields,
      sheetName = 'Sheet1'
    } = options;

    if (data.length === 0) {
      throw new Error('No data to export');
    }

    const exportFields = fields || Object.keys(data[0] as any);
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    
    // Prepare data for Excel
    const worksheetData = [
      exportFields, // Headers
      ...data.map(item => 
        exportFields.map(field => this.formatValue((item as any)[field], options))
      )
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    worksheet['!cols'] = exportFields.map(() => ({ width: 15 }));
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate buffer and get size
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;

    return {
      filename,
      format: 'xlsx',
      recordCount: data.length,
      fileSize: excelBuffer.byteLength,
      exportedAt: new Date(),
      fields: exportFields
    };
  }

  /**
   * Export data to PDF format using pdf-lib
   */
  static async exportToPDF<T>(
    data: T[],
    options: Partial<ExportOptions> = {}
  ): Promise<ExportResult> {
    const {
      filename = `export_${Date.now()}.pdf`,
      fields,
      template
    } = options;

    if (data.length === 0) {
      throw new Error('No data to export');
    }

    const exportFields = fields || Object.keys(data[0] as any);
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    
    let yPosition = height - 50;
    const fontSize = 10;
    const lineHeight = 14;
    const margin = 50;
    const columnWidth = (width - 2 * margin) / exportFields.length;
    
    // Draw headers
    exportFields.forEach((field, index) => {
      page.drawText(String(field), {
        x: margin + index * columnWidth,
        y: yPosition,
        size: fontSize,
        font: helveticaBold,
        color: rgb(0, 0, 0)
      });
    });
    
    yPosition -= lineHeight * 2;
    
    // Draw data rows
    for (const item of data) {
      if (yPosition < 50) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = height - 50;
      }
      
      exportFields.forEach((field, index) => {
        const value = this.formatValue((item as any)[field], options);
        const truncatedValue = value.length > 20 ? value.substring(0, 17) + '...' : value;
        
        page.drawText(truncatedValue, {
          x: margin + index * columnWidth,
          y: yPosition,
          size: fontSize,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      });
      
      yPosition -= lineHeight;
    }
    
    const pdfBytes = await pdfDoc.save();

    return {
      filename,
      format: 'pdf',
      recordCount: data.length,
      fileSize: pdfBytes.byteLength,
      exportedAt: new Date(),
      fields: exportFields
    };
  }

  /**
   * Export data to XML format
   */
  static exportToXML<T>(
    data: T[],
    options: Partial<ExportOptions> = {}
  ): ExportResult {
    const {
      filename = `export_${Date.now()}.xml`,
      fields,
      encoding = 'utf-8'
    } = options;

    if (data.length === 0) {
      throw new Error('No data to export');
    }

    const exportFields = fields || Object.keys(data[0] as any);
    
    let xmlContent = `<?xml version="1.0" encoding="${encoding}"?>\n`;
    xmlContent += `<export>\n`;
    xmlContent += `  <metadata>\n`;
    xmlContent += `    <exportedAt>${new Date().toISOString()}</exportedAt>\n`;
    xmlContent += `    <recordCount>${data.length}</recordCount>\n`;
    xmlContent += `    <fields>${exportFields.join(',')}</fields>\n`;
    xmlContent += `  </metadata>\n`;
    xmlContent += `  <data>\n`;
    
    data.forEach(item => {
      xmlContent += `    <record>\n`;
      exportFields.forEach(field => {
        const value = this.formatValue((item as any)[field], options);
        const escapedValue = this.escapeXmlValue(value);
        xmlContent += `      <${field}>${escapedValue}</${field}>\n`;
      });
      xmlContent += `    </record>\n`;
    });
    
    xmlContent += `  </data>\n`;
    xmlContent += `</export>`;

    const blob = new Blob([xmlContent], { type: 'application/xml' });

    return {
      filename,
      format: 'xml',
      recordCount: data.length,
      fileSize: blob.size,
      exportedAt: new Date(),
      fields: exportFields
    };
  }

  /**
   * Generate export with download capability
   */
  static async generateExport<T>(
    data: T[],
    options: ExportOptions
  ): Promise<ExportResult & { blob: Blob; downloadUrl: string }> {
    let result: ExportResult;
    let blob: Blob;

    switch (options.format) {
      case 'csv':
        result = this.exportToCSV(data, options);
        blob = this.createCSVBlob(data, options);
        break;
      case 'json':
        result = this.exportToJSON(data, options);
        blob = this.createJSONBlob(data, options);
        break;
      case 'xlsx':
        result = this.exportToExcel(data, options);
        blob = this.createExcelBlob(data, options);
        break;
      case 'pdf':
        result = await this.exportToPDF(data, options);
        blob = await this.createPDFBlob(data, options);
        break;
      case 'xml':
        result = this.exportToXML(data, options);
        blob = this.createXMLBlob(data, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }

    const downloadUrl = URL.createObjectURL(blob);

    return {
      ...result,
      blob,
      downloadUrl
    };
  }

  private static createCSVBlob<T>(data: T[], options: Partial<ExportOptions>): Blob {
    const {
      fields,
      includeHeaders = true,
      delimiter = ','
    } = options;

    if (data.length === 0) {
      throw new Error('No data to export');
    }

    const exportFields = fields || Object.keys(data[0] as any);
    
    let csvContent = '';
    
    if (includeHeaders) {
      csvContent += exportFields.map(field => this.escapeCsvField(field)).join(delimiter) + '\n';
    }
    
    data.forEach(item => {
      const row = exportFields.map(field => {
        const value = (item as any)[field];
        return this.escapeCsvField(this.formatValue(value, options));
      });
      csvContent += row.join(delimiter) + '\n';
    });

    return new Blob([csvContent], { type: 'text/csv' });
  }

  private static createJSONBlob<T>(data: T[], options: Partial<ExportOptions>): Blob {
    const {
      fields,
      compress = false
    } = options;

    let exportData = data;

    if (fields) {
      exportData = data.map(item => {
        const filtered: Partial<T> = {};
        fields.forEach(field => {
          if (field in (item as any)) {
            (filtered as any)[field] = (item as any)[field];
          }
        });
        return filtered as T;
      });
    }

    const jsonContent = JSON.stringify({
      metadata: {
        exportedAt: new Date().toISOString(),
        recordCount: data.length,
        fields: fields || Object.keys(data[0] as any)
      },
      data: exportData
    }, null, compress ? 0 : 2);

    return new Blob([jsonContent], { type: 'application/json' });
  }

  private static createExcelBlob<T>(data: T[], options: Partial<ExportOptions>): Blob {
    const exportFields = options.fields || Object.keys(data[0] as any);
    const sheetName = options.sheetName || 'Sheet1';
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    
    // Prepare data for Excel
    const worksheetData = [
      exportFields, // Headers
      ...data.map(item => 
        exportFields.map(field => this.formatValue((item as any)[field], options))
      )
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet['!cols'] = exportFields.map(() => ({ width: 15 }));
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
    
    return new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  private static async createPDFBlob<T>(data: T[], options: Partial<ExportOptions>): Promise<Blob> {
    const exportFields = options.fields || Object.keys(data[0] as any);
    
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    
    let yPosition = height - 50;
    const fontSize = 10;
    const lineHeight = 14;
    const margin = 50;
    const columnWidth = (width - 2 * margin) / exportFields.length;
    
    // Draw headers
    exportFields.forEach((field, index) => {
      page.drawText(String(field), {
        x: margin + index * columnWidth,
        y: yPosition,
        size: fontSize,
        font: helveticaBold,
        color: rgb(0, 0, 0)
      });
    });
    
    yPosition -= lineHeight * 2;
    
    // Draw data rows
    for (const item of data) {
      if (yPosition < 50) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = height - 50;
      }
      
      exportFields.forEach((field, index) => {
        const value = this.formatValue((item as any)[field], options);
        const truncatedValue = value.length > 20 ? value.substring(0, 17) + '...' : value;
        
        page.drawText(truncatedValue, {
          x: margin + index * columnWidth,
          y: yPosition,
          size: fontSize,
          font: helveticaFont,
          color: rgb(0, 0, 0)
        });
      });
      
      yPosition -= lineHeight;
    }
    
    const pdfBytes = await pdfDoc.save();
    
    return new Blob([pdfBytes] as BlobPart[], { type: 'application/pdf' });
  }

  private static createXMLBlob<T>(data: T[], options: Partial<ExportOptions>): Blob {
    const exportFields = options.fields || Object.keys(data[0] as any);
    const encoding = options.encoding || 'utf-8';
    
    let xmlContent = `<?xml version="1.0" encoding="${encoding}"?>\n`;
    xmlContent += `<export>\n`;
    xmlContent += `  <metadata>\n`;
    xmlContent += `    <exportedAt>${new Date().toISOString()}</exportedAt>\n`;
    xmlContent += `    <recordCount>${data.length}</recordCount>\n`;
    xmlContent += `    <fields>${exportFields.join(',')}</fields>\n`;
    xmlContent += `  </metadata>\n`;
    xmlContent += `  <data>\n`;
    
    data.forEach(item => {
      xmlContent += `    <record>\n`;
      exportFields.forEach(field => {
        const value = this.formatValue((item as any)[field], options);
        const escapedValue = this.escapeXmlValue(value);
        xmlContent += `      <${field}>${escapedValue}</${field}>\n`;
      });
      xmlContent += `    </record>\n`;
    });
    
    xmlContent += `  </data>\n`;
    xmlContent += `</export>`;
    
    return new Blob([xmlContent], { type: 'application/xml' });
  }

  private static escapeCsvField(value: string): string {
    if (value == null) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  private static formatValue(value: any, options: Partial<ExportOptions>): string {
    if (value == null) return '';
    
    if (value instanceof Date) {
      return options.dateFormat 
        ? this.formatDate(value, options.dateFormat)
        : value.toISOString();
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  }

  private static formatDate(date: Date, format: string): string {
    // Simple date formatting - would use a proper library in production
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day);
  }

  private static escapeXmlValue(value: string): string {
    if (value == null) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

export class ImportUtility {
  /**
   * Validate import data before processing
   */
  static async validateImportData<T>(
    data: any[],
    schema: Record<string, any>,
    options: ImportOptions = {}
  ): Promise<ValidationResult> {
    const errors: ImportError[] = [];
    const warnings: string[] = [];
    
    if (!Array.isArray(data)) {
      return {
        valid: false,
        errors: [{ row: 0, error: 'Invalid data format: expected array' }],
        warnings: [],
        preview: []
      };
    }

    // Validate each row
    data.forEach((row, index) => {
      this.validateRow(row, schema, index + 1, errors, options);
    });

    const preview = data.slice(0, 5).map(row => this.mapFields(row, options.mapping));

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      preview
    };
  }

  /**
   * Import data from parsed content
   */
  static async importData<T>(
    data: any[],
    createMethod: (item: any) => Promise<T>,
    options: ImportOptions = {}
  ): Promise<ImportResult<T>> {
    const {
      onError = 'stop',
      batchSize = 10,
      dryRun = false,
      skipRows = 0,
      maxRows
    } = options;

    const imported: T[] = [];
    const errors: ImportError[] = [];
    let processed = 0;
    let skipped = skipRows;

    // Skip initial rows if specified
    const processData = data.slice(skipRows, maxRows ? skipRows + maxRows : undefined);

    // Process in batches
    for (let i = 0; i < processData.length; i += batchSize) {
      const batch = processData.slice(i, i + batchSize);
      
      for (let batchIndex = 0; batchIndex < batch.length; batchIndex++) {
        const rawRow = batch[batchIndex];
        const rowIndex = skipped + i + batchIndex + 1;
        
        try {
          const mappedRow = this.mapFields(rawRow, options.mapping);
          
          if (!dryRun) {
            const result = await createMethod(mappedRow);
            imported.push(result);
          }
          processed++;
        } catch (error) {
          const importError: ImportError = {
            row: rowIndex,
            error: error instanceof Error ? error.message : String(error),
            data: rawRow
          };
          
          errors.push(importError);
          
          if (onError === 'stop') {
            break;
          } else if (onError === 'skip') {
            skipped++;
            continue;
          }
          // 'collect' continues processing
        }
      }
      
      if (onError === 'stop' && errors.length > 0) {
        break;
      }
    }

    return {
      success: errors.length === 0,
      imported,
      errors,
      skipped,
      total: processData.length,
      importedAt: new Date(),
      dryRun
    };
  }

  /**
   * Parse CSV content
   */
  static parseCSV(content: string, delimiter: string = ','): any[] {
    const lines = content.trim().split('\n');
    if (lines.length === 0) return [];

    const headers = this.parseCSVLine(lines[0] || '', delimiter);
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i] || '', delimiter);
      const row: any = {};
      
      headers.forEach((header, index) => {
        if (header != null) {
          row[header.trim()] = values[index]?.trim() || null;
        }
      });
      
      data.push(row);
    }

    return data;
  }

  /**
   * Parse JSON content
   */
  static parseJSON(content: string): any[] {
    try {
      const parsed = JSON.parse(content);
      
      if (Array.isArray(parsed)) {
        return parsed;
      }
      
      if (parsed.data && Array.isArray(parsed.data)) {
        return parsed.data;
      }
      
      throw new Error('Invalid JSON format: expected array or object with data array');
    } catch (error) {
      throw new Error(`JSON parsing error: ${error}`);
    }
  }

  /**
   * Parse Excel content using xlsx library
   */
  static parseExcel(content: string | ArrayBuffer): any[] {
    try {
      let workbook: XLSX.WorkBook;
      
      if (typeof content === 'string') {
        // If content is base64 string, decode it first  
        const binaryString = typeof atob !== 'undefined' ? atob(content) : content;
        workbook = XLSX.read(binaryString, { type: 'binary' });
      } else {
        // If content is ArrayBuffer
        workbook = XLSX.read(content, { type: 'array' });
      }
      
      // Get the first worksheet
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error('No worksheets found in Excel file');
      }
      
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        throw new Error('Worksheet not found');
      }
      
      // Convert to JSON with header row as keys
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // Use first row as header
        defval: null, // Default value for empty cells
        blankrows: false // Skip blank rows
      }) as any[][];
      
      if (data.length === 0) {
        return [];
      }
      
      const headers = data[0];
      if (!headers || headers.length === 0) {
        throw new Error('No headers found in Excel file');
      }
      
      const rows = data.slice(1);
      
      return rows.map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          if (header != null) {
            obj[String(header)] = row[index] || null;
          }
        });
        return obj;
      });
    } catch (error) {
      throw new Error(`Excel parsing error: ${error}`);
    }
  }

  private static parseCSVLine(line: string, delimiter: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current);
    return values;
  }

  private static mapFields(row: any, mapping?: Record<string, string>): any {
    if (!mapping) return row;
    
    const mapped: any = {};
    
    for (const [importField, apiField] of Object.entries(mapping)) {
      if (importField in row) {
        mapped[apiField] = row[importField];
      }
    }
    
    // Include unmapped fields
    for (const [key, value] of Object.entries(row)) {
      if (!mapping[key] && !(Object.values(mapping).includes(key))) {
        mapped[key] = value;
      }
    }
    
    return mapped;
  }

  private static validateRow(
    row: any,
    schema: Record<string, any>,
    rowIndex: number,
    errors: ImportError[],
    options: ImportOptions
  ): void {
    // Basic validation - would be more sophisticated in production
    for (const [field, rules] of Object.entries(schema)) {
      const value = row[field];
      
      if (rules.required && (value == null || value === '')) {
        errors.push({
          row: rowIndex,
          field,
          value,
          error: `${field} is required`
        });
      }
      
      if (rules.type && value != null) {
        if (!this.validateType(value, rules.type)) {
          errors.push({
            row: rowIndex,
            field,
            value,
            error: `${field} must be of type ${rules.type}`
          });
        }
      }
    }
  }

  private static validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'number':
        return !isNaN(Number(value));
      case 'boolean':
        return typeof value === 'boolean' || value === 'true' || value === 'false';
      case 'date':
        return !isNaN(Date.parse(value));
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      default:
        return true;
    }
  }
}