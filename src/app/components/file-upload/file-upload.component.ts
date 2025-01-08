/**
 * Componente para la carga y procesamiento de archivos Excel
 * @description
 * Este componente proporciona una interfaz para:
 * - Cargar archivos Excel mediante drag & drop o selector de archivos
 * - Validar el formato y contenido del archivo
 * - Procesar los datos y convertirlos a formato JSON
 * - Emitir los datos procesados al componente padre
 */
import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  /**
   * Evento que emite los datos procesados al componente padre
   */
  @Output() dataLoaded = new EventEmitter<any[]>();

  /**
   * Referencia al input de archivo
   */
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef<HTMLInputElement>;

  /**
   * Estado de carga del archivo
   */
  hasFile = false;

  /**
   * Encabezados requeridos en el archivo Excel
   */
  private readonly REQUIRED_HEADERS = [
    'NOMBRE',
    'CATEGORIA',
    'CANTIDAD',
    'CANTIDAD MINIMA',
    'FABRICANTE',
    'MODELO',
    'PROVEEDOR',
    'VALOR',
    'NUMERO DE FACTURA',
    'FECHA DE COMPRA',
    'OBSERVACIONES'
  ];

  /**
   * Encabezados opcionales en el archivo Excel
   */
  private readonly OPTIONAL_HEADERS = [];

  /**
   * Constructor del componente
   * @param snackBar Servicio de snack bar
   */
  constructor(private readonly snackBar: MatSnackBar) { }

  ngOnInit(): void { }

  /**
   * Maneja el evento de arrastrar archivos sobre el componente
   * @param event Evento de drag
   */
  onDragOver(event: DragEvent): void {
    if (this.hasFile) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const dropZone = event.target as HTMLElement;
    dropZone.classList.add('dragover');
  }

  /**
   * Maneja el evento de salir del área de drop
   * @param event Evento de drag leave
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Maneja el evento de soltar archivos
   * @param event Evento de drop
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.hasFile) {
      this.showError('Por favor, borra el archivo actual antes de cargar uno nuevo');
      return;
    }

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.hasFile = true;
      this.handleFile(file);
    }
  }

  /**
   * Maneja el evento de selección de archivo
   * @param event Evento de cambio del input
   */
  onFileSelected(event: Event): void {
    if (this.hasFile) {
      this.showError('Por favor, borra el archivo actual antes de cargar uno nuevo');
      return;
    }

    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      this.hasFile = true;
      this.handleFile(file);
    }
  }

  /**
   * Procesa el archivo seleccionado
   * @param file Archivo a procesar
   */
  // private handleFile(file: File): void {
  //   if (!this.validateFileType(file)) {
  //     this.showError('Por favor, selecciona un archivo Excel (.xlsx)');
  //     return;
  //   }

  //   const reader = new FileReader();
  //   reader.onload = (e: ProgressEvent<FileReader>) => {
  //     try {
  //       const data = new Uint8Array(e.target?.result as ArrayBuffer);
  //       const workbook = XLSX.read(data, { type: 'array' });

  //       // Buscar la hoja correcta
  //       let sheetName = workbook.SheetNames[0]; // Primera hoja por defecto
  //       const targetSheetName = 'Hoja_Cargue';

  //       // Si la primera hoja no tiene los datos correctos, buscar 'Hoja_Cargue'
  //       if (!this.validateTableData(workbook.Sheets[sheetName])) {
  //         const hojaCargueIndex = workbook.SheetNames.findIndex(name => name === targetSheetName);
  //         if (hojaCargueIndex !== -1) {
  //           sheetName = targetSheetName;
  //         } else {
  //           this.showError('No se encontró una hoja válida con el formato requerido');
  //           if (this.fileInput) {
  //             this.fileInput.nativeElement.value = '';
  //           }
  //           return;
  //         }
  //       }

  //       const worksheet = workbook.Sheets[sheetName];

  //       if (!this.validateTableData(worksheet)) {
  //         this.showError('El formato de la tabla no es válido');
  //         if (this.fileInput) {
  //           this.fileInput.nativeElement.value = '';
  //         }
  //         return;
  //       }

  //       // Skip the first 5 rows as they contain header information
  //       const jsonData = XLSX.utils.sheet_to_json(worksheet, {
  //         range: 5, // Start from row 6 (0-based index)
  //         header: this.REQUIRED_HEADERS,
  //         defval: '', // Default empty value for missing cells
  //         raw: false // Convert all values to strings
  //       });

  //       // Remove empty rows and convert numeric strings to numbers
  //       const filteredData = (jsonData as any[])
  //         .filter(row => Object.values(row).some(value => value !== ''))
  //         .map(row => {
  //           // Convert numeric fields with default values of 0
  //           const cantidad = row.CANTIDAD ? Number(row.CANTIDAD) : 0;
  //           const cantidadMinima = row['CANTIDAD MINIMA'] ? Number(row['CANTIDAD MINIMA']) : 0;
  //           const valor = row.VALOR ? Number(row.VALOR) : 0;

  //           return {
  //             ...row,
  //             NOMBRE: String(row.NOMBRE || ''),
  //             CATEGORIA: String(row.CATEGORIA || ''),
  //             CANTIDAD: cantidad,
  //             'CANTIDAD MINIMA': cantidadMinima,
  //             VALOR: valor,
  //             FABRICANTE: String(row.FABRICANTE || ''),
  //             MODELO: String(row.MODELO || ''),
  //             PROVEEDOR: String(row.PROVEEDOR || ''),
  //             'NUMERO DE FACTURA': String(row['NUMERO DE FACTURA'] || ''),
  //             'FECHA DE COMPRA': row['FECHA DE COMPRA'] ? String(row['FECHA DE COMPRA']).trim() : '',
  //             OBSERVACIONES: String(row.OBSERVACIONES || '')
  //           };
  //         });

  //       // Remove the header row
  //       if (filteredData.length === 0) {
  //         this.showError('No se encontraron datos válidos en el archivo');
  //         if (this.fileInput) {
  //           this.fileInput.nativeElement.value = '';
  //         }
  //         return;
  //       }
  //       filteredData.shift();

  //       // Emit the processed data
  //       this.dataLoaded.emit(filteredData);

  //       // Show success message
  //       this.showSuccess(`Archivo cargado correctamente desde la hoja "${sheetName}"`);
  //     } catch (error) {
  //       console.error('Error processing Excel file:', error);
  //       this.showError('Error al procesar el archivo Excel');
  //       // Reset file input
  //       if (this.fileInput) {
  //         this.fileInput.nativeElement.value = '';
  //       }
  //     }
  //   };

  //   reader.onerror = () => {
  //     this.showError('Error al leer el archivo');
  //     // Reset file input
  //     if (this.fileInput) {
  //       this.fileInput.nativeElement.value = '';
  //     }
  //   };

  //   reader.readAsArrayBuffer(file);
  // }
  private handleFile(file: File): void {
    if (!this.validateFileType(file)) {
      this.showError('Por favor, selecciona un archivo Excel (.xlsx)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = this.findValidSheet(workbook);
        if (!sheetName) {
          this.showError('No se encontró una hoja válida con el formato requerido');
          this.resetFileInput();
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        if (!this.validateTableData(worksheet)) {
          this.showError('El formato de la tabla no es válido');
          this.resetFileInput();
          return;
        }

        const jsonData = this.convertSheetToJson(worksheet);
        const filteredData = this.processJsonData(jsonData);

        if (filteredData.length === 0) {
          this.showError('No se encontraron datos válidos en el archivo');
          this.resetFileInput();
          return;
        }

        // Emit the processed data
        this.dataLoaded.emit(filteredData);

        // Show success message
        this.showSuccess(`Archivo cargado correctamente desde la hoja "${sheetName}"`);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        this.showError('Error al procesar el archivo Excel');
        this.resetFileInput();
      }
    };

    reader.readAsArrayBuffer(file);
  }

  private findValidSheet(workbook: XLSX.WorkBook): string | null {
    const targetSheetName = 'Hoja_Cargue';
    let sheetName = workbook.SheetNames[0]; // Primera hoja por defecto

    if (!this.validateTableData(workbook.Sheets[sheetName])) {
      const hojaCargueIndex = workbook.SheetNames.findIndex(name => name === targetSheetName);
      if (hojaCargueIndex !== -1) {
        sheetName = targetSheetName;
      } else {
        return null;
      }
    }

    return sheetName;
  }

  private convertSheetToJson(worksheet: XLSX.WorkSheet): any[] {
    return XLSX.utils.sheet_to_json(worksheet, {
      range: 5, // Start from row 6 (0-based index)
      header: this.REQUIRED_HEADERS,
      defval: '', // Default empty value for missing cells
      raw: false // Convert all values to strings
    });
  }

  private processJsonData(jsonData: any[]): any[] {
    return jsonData
      .filter(row => Object.values(row).some(value => value !== ''))
      .map(row => ({
        ...row,
        NOMBRE: String(row.NOMBRE || ''),
        CATEGORIA: String(row.CATEGORIA || ''),
        CANTIDAD: row.CANTIDAD ? Number(row.CANTIDAD) : 0,
        'CANTIDAD MINIMA': row['CANTIDAD MINIMA'] ? Number(row['CANTIDAD MINIMA']) : 0,
        VALOR: row.VALOR ? Number(row.VALOR) : 0,
        FABRICANTE: String(row.FABRICANTE || ''),
        MODELO: String(row.MODELO || ''),
        PROVEEDOR: String(row.PROVEEDOR || ''),
        'NUMERO DE FACTURA': String(row['NUMERO DE FACTURA'] || ''),
        'FECHA DE COMPRA': row['FECHA DE COMPRA'] ? String(row['FECHA DE COMPRA']).trim() : '',
        OBSERVACIONES: String(row.OBSERVACIONES || '')
      }))
      .slice(1); // Remove the header row
  }

  private resetFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  /**
   * Verifica si el archivo es un Excel válido
   * @param file Archivo a verificar
   * @returns true si es un archivo Excel
   */
  private validateFileType(file: File): boolean {
    return file.name.endsWith('.xlsx');
  }

  /**
   * Valida las columnas del archivo
   * @param worksheet Hoja de trabajo del archivo
   * @returns true si las columnas son válidas
   */
  private validateTableData(worksheet: XLSX.WorkSheet): boolean {
    try {
      const range = XLSX.utils.decode_range(worksheet['!ref'] ?? 'A1');
      const tableRow = 5; // 0-based index for row 6

      let headers: string[] = [];
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: tableRow, c: C })];
        if (cell?.v) {
          headers.push(cell.v.toString().trim().toUpperCase());
        }
      }

      // Check if we have all required columns
      const missingColumns = this.REQUIRED_HEADERS.filter(
        required => !headers.some(header =>
          header.replace(/\s+/g, ' ').trim() === required.replace(/\s+/g, ' ').trim()
        )
      );

      if (missingColumns.length > 0) {
        this.showError(`Faltan las siguientes columnas en la tabla: ${missingColumns.join(', ')}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating table data:', error);
      this.showError('Error al validar la estructura de la tabla');
      return false;
    }
  }

  /**
   * Muestra un mensaje de error
   * @param message Mensaje de error
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Muestra un mensaje de éxito
   * @param message Mensaje de éxito
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Borra el archivo seleccionado
   */
  clearFile(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
      this.hasFile = false;
      // Emit empty array to clear the data preview
      this.dataLoaded.emit([]);
      this.showSuccess('Archivo y datos eliminados');
    }
  }
}
