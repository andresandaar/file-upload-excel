import { Area } from "../area";
import { Empresa } from "../empresa";

export interface ColaboradorResponse {
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
  ubicacion: Area;
  email: string;
  imagen?: string;
  empresa: Empresa;
}
