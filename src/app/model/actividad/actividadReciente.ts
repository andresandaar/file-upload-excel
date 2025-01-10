import { User } from "../user";

export interface ActividadReciente {
    id: number;
    entidad: string;
    entidadId: number;
    accion: string;
    descripcion: string;
    user: User;
    fechaActividad: Date;
    empresa: number;
}
