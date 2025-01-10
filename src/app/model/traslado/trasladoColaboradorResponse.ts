import { ActivoResponse } from "../activo/activoResponse";
import { Colaborador } from "../colaborador/colaborador";

export interface TrasladoColaboradorResponse {
  id: number;
  activo: ActivoResponse;
  colaborador: Colaborador;
  tipoTraslado: string;
  fechaInicio: Date;
  fechaFinalizacion: Date;
  ubicacionOrigen: number;
  ubicacionDestino: number;
  empresa: number;
}
