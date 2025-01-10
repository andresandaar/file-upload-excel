export interface TrasladoRequest {
  id: number;
  activo: number;
  colaborador: number;
  tipoTraslado: string;
  fechaInicio: Date;
  fechaFinalizacion: Date;
  ubicacionOrigen: number;
  ubicacionDestino: number;
  empresa: number;
}
