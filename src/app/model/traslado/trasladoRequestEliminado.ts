export interface TrasladoEliminadoRequest {
  observacion: string;
  colaborador: number;
  tipoTraslado: string;
  fechaInicio: Date;
  fechaFinalizacion: Date;
  ubicacionOrigen: number;
  ubicacionDestino: number;
  empresa: number;
}
