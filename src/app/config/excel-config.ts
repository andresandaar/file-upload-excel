import { ExcelConfig } from "../models/excel-data.interface";


export const EXCEL_CONSUMIBLES_CONFIG: ExcelConfig = {
  REQUIRED_HEADERS: [
    'NOMBRE',
    'CATEGORIA',
    'CANTIDAD',
    'CANTIDAD MINIMA',
    'FABRICANTE',
    'MODELO',
    'PROVEEDOR',
    'VALOR',
    'NUMERO DE FACTURA',
    'FECHA DE COMPRA',
    'OBSERVACIONES',
  ],
  TARGET_SHEET_NAME: 'Hoja_Cargue',
  SKIP_ROWS: 5,
  SUPPORTED_FILE_TYPES: ['.xlsx'],
};
