import { Area } from "../area";
import { Categoria } from "../categoria";
import { Colaborador } from "../colaborador/colaborador";
import { Empresa } from "../empresa";
import { Fabricante } from "../fabricante/fabricante";
import { Proveedor } from "../proveedor/proveedor";
import { TipoActivo } from "../tipoActivo";

export interface ActivoResponse {
  id: number;
  codigo: string;
  prefijo: string;
  tipoActivo: TipoActivo;
  marca: string;
  modelo: string;
  serialInterno: string;
  serialFabrica: string;
  foto?: string;
  proveedor: Proveedor;
  fabricante: Fabricante;
  tipoAdquisicion: string;
  color: string;
  prefijoColor: string;
  fechaCompra: string;
  valor: number;
  numeroFactura: string;
  fechaGarantia: string;
  colaborador?: Colaborador;
  ubicacionInicial: Area;
  ubicacionActual?: Area;
  estado: string;
  categoria: Categoria;
  empresa: Empresa;
}
