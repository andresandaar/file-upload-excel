export interface AccesorioEliminado {
  id?: number;
  accesorioId: number;
  prefijo: string;
  nombre: string;
  categoria: number;
  proveedor: number;
  fabricante: number;
  ubicacion: number;
  tipoActivo: number;
  serialInterno: string;
  serialFabrica: string;
  modelo: string;
  numeroFactura: string;
  fechaCompra: Date; 
  costo: number;
  notas?: string;
  imagen?: string;
  fechaBaja: Date;
  observacionBaja: string;
  empresa: number;
}