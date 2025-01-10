import { ActivoResponse } from "../activo/activoResponse";
import { Area } from "../area";
import { Colaborador } from "../colaborador/colaborador";

export interface TrasladoEliminadoResponse {
  id: number;
  trasladoId: number;
  activo: ActivoResponse;
  colaborador: Colaborador;
  colaboradorNuevo: Colaborador;
  tipoTraslado: string;
  fechaInicio: Date;
  fechaFinalizacion: Date;
  ubicacionOrigen: Area;
  ubicacionDestino: Area;
  empresa: number;
  observacion: string;
  fechaEliminacion: Date;
}
