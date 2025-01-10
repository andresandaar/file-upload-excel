
import { ActivoResponse } from "../activo/activoResponse";
import { Proveedor } from "../proveedor/proveedor";
import { User } from "../user";

export interface MantenimientoProgramado {
  id: number;
  activo: ActivoResponse;
  tipoMantenimiento: string;
  modalidadMantenimiento: string;
  proveedor: Proveedor;
  personaAutorizada: User;
  fechaProgramada: string;
  costo: number;
  estado: string;
}
