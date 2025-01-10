import { Empresa } from "../empresa";

export interface FabricanteResponse {
    id: number;
    nombre: string;
    prefijo: string;
    urlPWeb: string;
    imagen?: string;
    empresa: Empresa;
}