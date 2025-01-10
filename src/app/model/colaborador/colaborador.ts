
export interface Colaborador {
  id: number;
  codigo: string;
  nombre: string;
  apellido: string;
  telefono: string;
  cargo: string;
  departamento: string;
  direccion: string;
  ciudad: string;
  pais: string;
  modalidadTrabajo: string;
  fechaInicioContrato: string;
  fechaFinContrato: string;
  ubicacion: number;
  sede: number;
  email: string;
  imagen?: string;
  empresa: number;
}
