import { Empresa } from './empresa';

export interface Sede {
    id: number;
    nombre: string;
    direccion: string;
    codigo: string;
    telefono: string;
    numeroPisos: string;
    empresa: Empresa;
}
