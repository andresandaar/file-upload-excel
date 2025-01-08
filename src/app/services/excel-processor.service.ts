
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { ExcelConfig} from '../models/excel-data.interface';

@Injectable({
  providedIn: 'root'
})
export class ExcelProcessorService {
  findValidSheet(workbook: XLSX.WorkBook, EXCEL_CONFIG: ExcelConfig): string | null {
    let sheetName = workbook.SheetNames[0];
    
    if (!this.isSheetValid(workbook.Sheets[sheetName])) {
      const targetSheetIndex = workbook.SheetNames.findIndex(
        name => name === EXCEL_CONFIG.TARGET_SHEET_NAME
      );
      if (targetSheetIndex !== -1) {
        sheetName = EXCEL_CONFIG.TARGET_SHEET_NAME;
      } else {
        return null;
      }
    }

    return sheetName;
  }

  processExcelData(worksheet: XLSX.WorkSheet, EXCEL_CONFIG: ExcelConfig):unknown[] {
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      range: EXCEL_CONFIG.SKIP_ROWS,
      header: EXCEL_CONFIG.REQUIRED_HEADERS,
      defval: '',
      raw: false
    });

    return jsonData; 
  }


  private isSheetValid(worksheet: XLSX.WorkSheet): boolean {
    return worksheet?.['!ref'] !== undefined;
  }
}