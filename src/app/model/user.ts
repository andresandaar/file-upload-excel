import { Rol } from "./rol";

export interface User {
    id:number;
    username:string;
    nombre:string;
    tipoDocumento:string;
    documento:string;
    email:string;
    telefono:string;
    empresa: number;
    roles: Rol[];
}