import { Sede } from './sede';

export interface Area {
    id: number;
    nombre: string;
    codigo: string;
    tipoArea: string;
    pisoArea: string;
    sede: Sede;
}
