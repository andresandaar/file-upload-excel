import { ActivoResponse } from "../activo/activoResponse";
import { Proveedor } from "../proveedor/proveedor";
import { User } from "../user";

export interface MantenimientoRealizado {
  id: number;
  activo: ActivoResponse;
  tipoMantenimiento: string;
  modalidadMantenimiento: string;
  proveedor: Proveedor;
  personaAutorizada: User;
  fechaProgramada: string;
  fechaRealizacion: string;
  costo: number;
  estado: string;
  trabajoRealizado: String;
}
