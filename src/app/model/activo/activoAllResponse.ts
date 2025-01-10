import { TipoActivo } from "../tipoActivo";

export interface ActivoAllResponse {
  id: number;
  codigo: string;
  prefijo: string;
  tipoActivo: TipoActivo;
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
  estado: string;
  categoria: number;
  empresa: number;
}
