// src/app/services/file-validator.service.ts
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { ExcelConfig, ValidationResult } from '../models/excel-data.interface';

@Injectable({
  providedIn: 'root'
})
export class FileValidatorService {
  validateFileType(file: File,EXCEL_CONFIG: ExcelConfig): ValidationResult {
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!EXCEL_CONFIG.SUPPORTED_FILE_TYPES.includes(extension)) {
      return {
        isValid: false,
        error: `Tipo de archivo no soportado. Por favor, use: ${EXCEL_CONFIG.SUPPORTED_FILE_TYPES.join(', ')}`
      };
    }
    return { isValid: true };
  }

  validateTableStructure(worksheet: XLSX.WorkSheet,EXCEL_CONFIG: ExcelConfig): ValidationResult {
    try {
      const range = XLSX.utils.decode_range(worksheet['!ref'] ?? 'A1');
      const headers = this.extractHeaders(worksheet, range,EXCEL_CONFIG);
      
      const missingColumns = this.findMissingColumns(headers,EXCEL_CONFIG);
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

  private extractHeaders(worksheet: XLSX.WorkSheet, range: XLSX.Range,EXCEL_CONFIG: ExcelConfig): string[] {
    const headers: string[] = [];
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: EXCEL_CONFIG.SKIP_ROWS, c: C })];
      if (cell?.v) {
        headers.push(cell.v.toString().trim().toUpperCase());
      }
    }
    return headers;
  }

  private findMissingColumns(headers: string[],EXCEL_CONFIG: ExcelConfig): string[] {
    return EXCEL_CONFIG.REQUIRED_HEADERS.filter(
      required => !headers.some(header =>
        header.replace(/\s+/g, ' ').trim() === required.replace(/\s+/g, ' ').trim()
      )
    );
  }
}