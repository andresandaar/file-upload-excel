import { ExcelConfig } from "../models/excel-data.interface";
import { CONSUMIBLE_FORMAT_EXCEL_HEADERS } from "./consumible-format";

 const consumibleFormatExcelHeaders = CONSUMIBLE_FORMAT_EXCEL_HEADERS

export const EXCEL_CONSUMIBLES_CONFIG: ExcelConfig = {
  REQUIRED_HEADERS: [
    consumibleFormatExcelHeaders.NOMBRE,
    consumibleFormatExcelHeaders.CATEGORIA,
    consumibleFormatExcelHeaders.CANTIDAD,
    consumibleFormatExcelHeaders.CANTIDAD_MINIMA,  // Asegúrate de que esta clave esté correctamente definida en consumibleFormatExcelHeaders
    consumibleFormatExcelHeaders.FABRICANTE,
    consumibleFormatExcelHeaders.MODELO,
    consumibleFormatExcelHeaders.PROVEEDOR,
    consumibleFormatExcelHeaders.VALOR,
    consumibleFormatExcelHeaders.NUMERO_DE_FACTURA,
    consumibleFormatExcelHeaders.FECHA_DE_COMPRA,
    consumibleFormatExcelHeaders.OBSERVACIONES,
  ],
  TARGET_SHEET_NAME: 'Hoja_Cargue',
  SKIP_ROWS: 5,
  SUPPORTED_FILE_TYPES: ['.xlsx'],
};