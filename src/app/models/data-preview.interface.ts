import { CONSUMIBLE_FORMAT_DATA_BASE } from "../config/consumible-format";

export interface DataPreviewRow {
  [CONSUMIBLE_FORMAT_DATA_BASE.NOMBRE]: string;
  [CONSUMIBLE_FORMAT_DATA_BASE.CATEGORIA]: string;
  [CONSUMIBLE_FORMAT_DATA_BASE.CANTIDAD]: number;
  [CONSUMIBLE_FORMAT_DATA_BASE.CANTIDAD_MINIMA]: number;
  [CONSUMIBLE_FORMAT_DATA_BASE.FABRICANTE]: string;
  [CONSUMIBLE_FORMAT_DATA_BASE.MODELO]: string;
  [CONSUMIBLE_FORMAT_DATA_BASE.PROVEEDOR]: string;
  [CONSUMIBLE_FORMAT_DATA_BASE.COSTO]: number;
  [CONSUMIBLE_FORMAT_DATA_BASE.NUMERO_DE_FACTURA]: string;
  [CONSUMIBLE_FORMAT_DATA_BASE.FECHA_DE_COMPRA]: string;
  [CONSUMIBLE_FORMAT_DATA_BASE.OBSERVACIONES]: string;
}


/** 
 * Representa un error de validación con su ubicación y mensaje
 * @interface ValidationError
 */
export interface ValidationError {
  row: number;
  column: string;
  message: string | null;
}

/** 
 * Agrupa los errores por fila para mostrarlos en el panel de expansión
 * @interface ErrorsByRow
 */
export interface ErrorsByRow {
  row: number;
  errors: ValidationError[];
}

/** 
 * Representa una opción en los selectores (categorías, fabricantes, proveedores)
 * @interface SelectOption
 */
export interface SelectOption {
  id: number;
  name: string;
}

/** 
 * Contiene las listas de opciones para los selectores
 * @interface SelectOptions
 */
export interface SelectOptions {
  categorias: SelectOption[];
  fabricantes: SelectOption[];
  proveedores: SelectOption[];
}

export interface DisplayedColumn {
  dataCellName: string; // Nombre de la columna (debe coincidir con las propiedades de ExcelRow)
  headerCellName: string; // Etiqueta personalizada para la cabecera
}