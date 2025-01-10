export interface Componente {
    id: number;
    nombre: string;
    prefijo: string;
    categoria: number;
    cantidadMinima: number;
    cantidadActual: number;
    serial: string;
    fabricante: number;
    modelo: string;
    proveedor: number;
    ubicacion: number;
    tipoActivo: number;
    numeroFactura: string;
    costo: number;
    fechaCompra: string;
    observaciones?: string;
    imagenUrl?: string;
    empresa: number;
}