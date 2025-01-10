export interface Accesorio {
  id: number;
  prefijo: string;
  nombre: string;
  categoria: number;
  proveedor: number;
  tipoActivo: number;
  fabricante: number;
  ubicacion: number;
  serialFabrica: string;
  modelo: string;
  numeroFactura: string;
  fechaCompra: string; 
  costo: number;
  notas?: string;
  imagen?: string;
  empresa: number;
}