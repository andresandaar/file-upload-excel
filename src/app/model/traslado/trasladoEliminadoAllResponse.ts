import { ActivoResponse } from "../activo/activoResponse";
import { Colaborador } from "../colaborador/colaborador";

export interface TrasladoEliminadoAllResponse {
  id: number;
  trasladoId: number;
  activo: ActivoResponse;
  colaborador: Colaborador;
  colaboradorNuevo: Colaborador;
  tipoTraslado: string;
  fechaInicio: Date;
  fechaFinalizacion: Date;
  ubicacionOrigen: number;
  ubicacionDestino: number;
  empresa: number;
  observacion: string;
  fechaEliminacion: Date;
}
