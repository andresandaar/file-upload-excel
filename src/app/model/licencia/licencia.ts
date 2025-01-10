export interface Licencia {
  id: number;
  nombreSoftware: string;
  claveProducto: string;
  numeroLicencias: number;
  cantidadMinima: number;
  fabricante: number;
  reasignable: boolean;
  proveedor: number;
  numeroFactura: string;
  costo: number;
  fechaCompra: string;
  fechaCaducidad: string;
  categoria: number;
  empresa: number;
}