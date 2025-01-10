import { Empresa } from "../empresa";
import { Sede } from "../sede";

export interface ProveedorResponse {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  ciudad: string;
  pais: string; 
  nombreContacto: string;   
  telefonoContacto: string;      
  emailContacto: string;
  urlWeb: string;     
  observaciones: string;
  empresa: Empresa;
  imagenLogo: string;      
}
