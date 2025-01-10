export interface LicenciaBajaHistorial {
    id: number;
    licenciaId: number;
    nombreSoftware: string;
    claveProducto: string;
    numeroLicencias: number;
    cantidadMinima: number;
    fabricante: number;
    reasignable: boolean;
    proveedor: number;
    categoria: number;
    numeroFactura: string;
    costo: number;
    fechaCompra: string;
    fechaCaducidad: string;
    fechaBaja: Date;
    observacionBaja: string;
    empresa: number;
}