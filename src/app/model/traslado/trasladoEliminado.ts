export interface TrasladoEliminado {
  id: number;
  trasladoId: number;
  activo: number;
  colaborador: number;
  tipoTraslado: string;
  fechaInicio: Date;
  fechaFinalizacion: Date;
  ubicacionOrigen: number;
  ubicacionDestino: number;
  empresa: number;
  observacion: string;
  fechaEliminacion: Date;
}
