import { Categoria } from "../categoria";
import { Empresa } from "../empresa";
import { Fabricante } from "../fabricante/fabricante";
import { Proveedor } from "../proveedor/proveedor";

export interface ConsumibleResponse {
    id: number;
    nombre: string;
    categoria: Categoria;
    cantidad: number;
    cantidadMinima: number;
    fabricante: Fabricante;
    modelo: string;
    proveedor: Proveedor;
    numeroFactura: string;
    costo: number;
    fechaCompra: string;
    observaciones?: string;
    imagen?: string;
    empresa: Empresa;
}