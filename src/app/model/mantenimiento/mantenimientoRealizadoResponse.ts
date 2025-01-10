
import { ActivoResponse } from "../activo/activoResponse";

export interface MantenimientoRealizadoResponse {
  id: number;
  activo: ActivoResponse;
  tipoMantenimiento: string;
  modalidadMantenimiento: string;
  proveedor: number;
  personaAutorizada: number;
  fechaProgramada: string;
  fechaRealizacion: string;
  costo: number;
  trabajoRealizado: String;
  estado: string;
}
