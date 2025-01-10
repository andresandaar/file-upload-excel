
import { ActivoAllResponse } from "../activo/activoAllResponse";
import { Area } from "../area";
import { Colaborador } from "../colaborador/colaborador";
import { Empresa } from "../empresa";

export interface TrasladoResponse {
  id: number;
  activo: ActivoAllResponse;
  colaborador: Colaborador;
  tipoTraslado: string;
  fechaInicio: Date;
  fechaFinalizacion: Date;
  ubicacionOrigen: Area;
  ubicacionDestino: Area;
  empresa: Empresa;
}
