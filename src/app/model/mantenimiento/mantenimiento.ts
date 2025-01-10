
import { ActivoResponse } from "../activo/activoResponse";
import { Proveedor } from "../proveedor/proveedor";
import { User } from "../user";

export interface Mantenimiento {
  id: number;
  activo: ActivoResponse;
  tipoMantenimiento: string;
  modalidadMantenimiento: string;
  proveedor: Proveedor;
  personaAutorizada: User;
  fechaProgramada: Date;
  fechaRealizacion: Date;
  costo: number;
  estado: string;
  trabajoRealizado: String;
}
