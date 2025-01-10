import { Area } from "../area";
import { Categoria } from "../categoria";
import { Fabricante } from "../fabricante/fabricante";
import { Proveedor } from "../proveedor/proveedor";
import { TipoActivo } from "../tipoActivo";

export interface AccesorioResponse {
  id: number;
  nombre: string;
  prefijo: string;
  categoria: Categoria;
  proveedor: Proveedor;
  fabricante: Fabricante;
  ubicacion: Area;
  tipoActivo: TipoActivo;
  serialInterno: string;
  serialFabrica: string;
  modelo: string;
  numeroFactura: string;
  fechaCompra: string; 
  costo: number;
  notas?: string;
  imagen?: string;
  empresa: number;
}