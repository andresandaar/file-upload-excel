export interface Consumible {
    id: number;
    nombre: string;
    categoria: number;
    cantidad: number;
    cantidadMinima: number;
    fabricante: number;
    modelo: string;
    proveedor: number;
    numeroFactura: string;
    costo: number;
    fechaCompra: string;
    observaciones?: string;
    imagen?: string;
    empresa: number;
}