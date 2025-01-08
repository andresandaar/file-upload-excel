// src/app/models/excel-data.interface.ts

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