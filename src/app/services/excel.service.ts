import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExcelData {
  NOMBRE: string;
  CATEGORÍA: string;
  CANTIDAD: number;
  'CANTIDAD MÍNIMA': number;
  FABRICANTE?: string;
  MODELO?: string;
  PROVEEDOR?: string;
  VALOR: number;
  'NÚMERO DE FACTURA'?: string;
  'FECHA DE COMPRA'?: string;
  OBSERVACIONES?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  private readonly apiUrl = 'http://localhost:8080/api';

  constructor(private readonly http: HttpClient) {}

  uploadExcelData(data: ExcelData[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, data);
  }

  getUploadHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/history`);
  }

}
