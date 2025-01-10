export interface  ActivoEliminado {
  id: number;
  activoId: number;
  codigo: string;
  prefijo: string;
  tipoActivo: number;
  marca: string;
  modelo: string;
  serialInterno: string;
  serialFabrica: string;
  foto?: string;
  proveedor: number;
  fabricante: number;
  tipoAdquisicion: string;
  color: string;
  prefijoColor: string;
  fechaCompra: string;
  valor: number;
  numeroFactura: string;
  fechaGarantia: string;
  colaborador?: number;
  ubicacionInicial: number;
  ubicacionActual: number;
  categoria: number;
  empresa: number;
  fechaEliminacion: Date;
  observacion: string;
}
