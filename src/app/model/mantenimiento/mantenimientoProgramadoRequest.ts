
export interface MantenimientoProgramadoRequest {
  id: number;
  activo: number;
  tipoMantenimiento: string;
  modalidadMantenimiento: string;
  proveedor: number;
  personaAutorizada: number;
  fechaProgramada: string;
  costo: number;
  tipoEjecutor?: string;
  estado?: String;
}
