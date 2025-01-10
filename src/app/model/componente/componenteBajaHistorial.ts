export interface ComponenteBajaHistorial {
    id: number;
    componenteId: number;
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
    fechaBaja: Date;
    observacionBaja: string;
    empresa: number;
}