import { ActivoResponse } from "../activo/activoResponse";

export interface MantenimientoProgramadoResponse {
  id: number;
  activo: ActivoResponse;
  tipoMantenimiento: string;
  modalidadMantenimiento: string;
  proveedor: number;
  personaAutorizada: number;
  fechaProgramada: string;
  costo: number;
  estado: string;
  tipoEjecutor?: string;
}
