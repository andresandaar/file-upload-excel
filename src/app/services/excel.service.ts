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
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  uploadExcelData(data: ExcelData[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, data);
  }

  getUploadHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/history`);
  }

  validateData(data: ExcelData[]): string[] {
    const errors: string[] = [];
    
    data.forEach((row, index) => {
     
      // Required field validations
      if (!row.NOMBRE) {
        errors.push(`Fila ${index + 1}: Nombre es requerido`);
      }
      if (!row.CATEGORÍA) {
        errors.push(`Fila ${index + 1}: Categoría es requerida`);
      }
      if (typeof row.CANTIDAD !== 'number' || row.CANTIDAD < 0) {
        errors.push(`Fila ${index + 1}: Cantidad debe ser un número positivo`);
      }
      if (typeof row['CANTIDAD MÍNIMA'] !== 'number' || row['CANTIDAD MÍNIMA'] < 0) {
        errors.push(`Fila ${index + 1}: Cantidad mínima debe ser un número positivo`);
      }
      if (typeof row.VALOR !== 'number' || row.VALOR <= 0) {
        errors.push(`Fila ${index + 1}: Valor debe ser mayor que 0`);
      }

      // Business rule validations
      if (row.CANTIDAD < row['CANTIDAD MÍNIMA']) {
        errors.push(`Fila ${index + 1}: Cantidad no puede ser menor que la cantidad mínima`);
      }

      // Date format validation
      if (row['FECHA DE COMPRA']) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(row['FECHA DE COMPRA'])) {
          errors.push(`Fila ${index + 1}: Fecha de compra debe estar en formato YYYY-MM-DD`);
        }
      }
    });

    console.log(errors);
    return errors;
  }
}
