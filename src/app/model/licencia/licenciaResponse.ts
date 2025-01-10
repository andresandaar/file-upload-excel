import { Categoria } from "../categoria";
import { Empresa } from "../empresa";
import { Fabricante } from "../fabricante/fabricante";
import { Proveedor } from "../proveedor/proveedor";

export interface LicenciaResponse {
  id: number;
  nombreSoftware: string;
  claveProducto: string;
  numeroLicencias: number;
  cantidadMinima: number;
  fabricante: Fabricante;
  reasignable: boolean;
  proveedor: Proveedor;
  numeroFactura: string;
  costo: number;
  fechaCompra: string;
  fechaCaducidad: string;
  categoria: Categoria;
  empresa: Empresa;
}