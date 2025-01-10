import { ActivoResponse } from "../activo/activoResponse";

export interface Traslado {
  id: number;
  activo: ActivoResponse;
  colaborador: number;
  tipoTraslado: string;
  fechaInicio: Date;
  fechaFinalizacion: Date;
  ubicacionOrigen: number;
  ubicacionDestino: number;
  empresa: number;
}
