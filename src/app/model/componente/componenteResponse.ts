import { Area } from "../area";
import { Categoria } from "../categoria";
import { Empresa } from "../empresa";
import { Fabricante } from "../fabricante/fabricante";
import { Proveedor } from "../proveedor/proveedor";
import { TipoActivo } from "../tipoActivo";

export interface ComponenteResponse {
    id: number;
    nombre: string;
    prefijo: string;
    categoria: Categoria;
    cantidadMinima: number;
    cantidadActual: number;
    serial: string;
    fabricante: Fabricante;
    modelo: string;
    proveedor: Proveedor;
    ubicacion: Area;
    tipoActivo: TipoActivo;
    numeroFactura: string;
    costo: number;
    fechaCompra: string;
    observaciones?: string;
    imagenUrl?: string;
    empresa: Empresa;
}