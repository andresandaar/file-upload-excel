// src/app/models/excel-data.interface.ts
export interface ExcelRow {
    NOMBRE: string;
    CATEGORIA: string;
    CANTIDAD: number;
    CANTIDAD_MINIMA: number;
    FABRICANTE: string;
    MODELO: string;
    PROVEEDOR: string;
    VALOR: number;
    NUMERO_DE_FACTURA: string;
    FECHA_DE_COMPRA: string;
    OBSERVACIONES: string;
    _errors?: { [key: string]: string };
  }

  export interface ValidationResult {
    isValid: boolean;
    error?: string;
  }
  export interface ExcelConfig {
    REQUIRED_HEADERS: string[];
    TARGET_SHEET_NAME: string;
    SKIP_ROWS: number;
    SUPPORTED_FILE_TYPES: string[];
  }