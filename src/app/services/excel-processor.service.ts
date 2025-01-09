
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { ExcelConfig, ProcessFileResult, ValidationResult } from '../models/excel-data.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ExcelProcessorService {
  constructor(
    private readonly snackBar: MatSnackBar
  ) { }
  private findValidSheet(workbook: XLSX.WorkBook, EXCEL_CONFIG: ExcelConfig): string | null {
    let sheetName = workbook.SheetNames[0];

    if (!this.isSheetValid(workbook.Sheets[sheetName])) {
      const targetSheetIndex = workbook.SheetNames.findIndex(
        name => name === EXCEL_CONFIG.TARGET_SHEET_NAME
      );
      if (targetSheetIndex !== -1) {
        sheetName = EXCEL_CONFIG.TARGET_SHEET_NAME;
      } else {
        return null;
      }
    }

    return sheetName;
  }

  private processExcelData(worksheet: XLSX.WorkSheet, EXCEL_CONFIG: ExcelConfig): unknown[] {
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      range: EXCEL_CONFIG.SKIP_ROWS,
      header: EXCEL_CONFIG.REQUIRED_HEADERS,
      defval: '',
      raw: false
    });

    return jsonData;
  }


  private isSheetValid(worksheet: XLSX.WorkSheet): boolean {
    return worksheet?.['!ref'] !== undefined;
  }

  /**
    * Procesa el archivo seleccionado
    * @param file Archivo seleccionado
    */
  async processFileExcel(file: File, EXCEL_CONFIG: ExcelConfig): Promise<ProcessFileResult> {
    return new Promise((resolve, reject) => {
      const process = async () => {
        const fileValidation = this.validateFileType(file, EXCEL_CONFIG);

        if (!fileValidation.isValid) {
          this.showError(fileValidation.error ?? 'Archivo no válido');
          return resolve({ isValid: false, clearFile: false, data: [] });
        }

        try {
          const data = await this.readFileAsArrayBuffer(file);
          const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });

          const sheetName = this.findValidSheet(workbook, EXCEL_CONFIG);
          if (!sheetName) {
            this.showError('No se encontró una hoja válida con el formato requerido');
            return resolve({ isValid: false, clearFile: true, data: [] });
          }

          const worksheet = workbook.Sheets[sheetName];
          const validation = this.validateTableStructure(worksheet, EXCEL_CONFIG);

          if (!validation.isValid) {
            this.showError(validation.error ?? 'Formato de tabla inválido');
            return resolve({ isValid: false, clearFile: true, data: [] });
          }

          const processedJsonData = this.processExcelData(worksheet, EXCEL_CONFIG);
          if (processedJsonData.length === 0 || processedJsonData.length === 1) {
            this.showError('No se encontraron datos en la tabla, verifique el archivo');
            return resolve({ isValid: false, clearFile: true, data: [] });
          }
          this.showSuccess(`Archivo cargado correctamente desde la hoja "${sheetName}"`);
          return resolve({ isValid: true, clearFile: false, data: processedJsonData });
        } catch (error) {
          this.showError('Error al procesar el archivo Excel');
          return resolve({ isValid: false, clearFile: true, data: [] });
        }
      };
      process();
    })

  }

  /**
   * Lee el archivo como un array buffer
   * @param file Archivo a leer
   */
  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsArrayBuffer(file);
    });
  }


  private validateFileType(file: File, EXCEL_CONFIG: ExcelConfig): ValidationResult {
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (EXCEL_CONFIG.SUPPORTED_FILE_TYPE !== extension) {
      return {
        isValid: false,
        error: `Tipo de archivo no soportado. Por favor, use: ${EXCEL_CONFIG.SUPPORTED_FILE_TYPE}`
      };
    }
    return { isValid: true };
  }

  private validateTableStructure(worksheet: XLSX.WorkSheet, EXCEL_CONFIG: ExcelConfig): ValidationResult {
    try {
      const range = XLSX.utils.decode_range(worksheet['!ref'] ?? 'A1');
      const headers = this.extractHeaders(worksheet, range, EXCEL_CONFIG);

      const missingColumns = this.findMissingColumns(headers, EXCEL_CONFIG);
      if (missingColumns.length > 0) {
        return {
          isValid: false,
          error: `Faltan las siguientes columnas: ${missingColumns.join(', ')}`
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating table structure:', error);
      return {
        isValid: false,
        error: 'Error al validar la estructura de la tabla'
      };
    }
  }

  private extractHeaders(worksheet: XLSX.WorkSheet, range: XLSX.Range, EXCEL_CONFIG: ExcelConfig): string[] {
    const headers: string[] = [];
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: EXCEL_CONFIG.SKIP_ROWS, c: C })];
      if (cell?.v) {
        headers.push(cell.v.toString().trim().toUpperCase());
      }
    }
    return headers;
  }

  private findMissingColumns(headers: string[], EXCEL_CONFIG: ExcelConfig): string[] {
    return EXCEL_CONFIG.REQUIRED_HEADERS.filter(
      required => !headers.some(header =>
        header.replace(/\s+/g, ' ').trim() === required.replace(/\s+/g, ' ').trim()
      )
    );
  }
  /**
   * Muestra un mensaje de error
   * @param message Mensaje de error
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Muestra un mensaje de éxito
   * @param message Mensaje de éxito
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
  }
}