/**
 * Componente para la carga y procesamiento de archivos Excel
 * @description
 * Este componente proporciona una interfaz para:
 * - Cargar archivos Excel mediante drag & drop o selector de archivos
 * - Validar el formato y contenido del archivo
 * - Procesar los datos y convertirlos a formato JSON
 * - Emitir los datos procesados al componente padre
 */
import { Component,  Output, EventEmitter, ViewChild, ElementRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import { FileValidatorService } from '../../services/file-validator.service';
import { ExcelProcessorService } from '../../services/excel-processor.service';
import { EXCEL_CONSUMIBLES_CONFIG } from '../../config/excel-config';
import { NgxFileDropComponent } from '../ngx-file-drop/ngx-file-drop.component';
import { NgxFileDropEntry } from '../ngx-file-drop/ngx-file-drop-entry';


/**
 * Componente para la carga y procesamiento de archivos Excel
 */
@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NgxFileDropComponent
  ],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Output() dataLoaded = new EventEmitter<unknown[]>();
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef<HTMLInputElement>;

  hasFile = signal(false);
  isDragging = signal(false);
  currentFile = signal<File | null>(null);

  // Computed signal para el estado de la UI
  uiState = computed(() => ({
    canUpload: !this.hasFile(),
    showDragIndicator: this.isDragging() && !this.hasFile(),
    hasActiveFile: this.hasFile()
  }));

  /**
   * Constructor del componente
   * @param validatorService Servicio de validación de archivos
   * @param processorService Servicio de procesamiento de archivos
   * @param snackBar Servicio de notificaciones
   */
  constructor(
    private readonly validatorService: FileValidatorService,
    private readonly processorService: ExcelProcessorService,
    private readonly snackBar: MatSnackBar
  ) { }


  /**
   * Maneja el evento de arrastrar archivos sobre el componente
   * @param event Evento de drag
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.hasFile()) {
      this.isDragging.set(true);
    }
  }

  /**
   * Maneja el evento de salir del área de drop
   * @param event Evento de drag leave
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  /**
   * Maneja el evento de soltar archivos
   * @param event Evento de drop
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (this.hasFile()) {
      this.showError('Por favor, borra el archivo actual antes de cargar uno nuevo');
      return;
    }

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.handleFile(files[0]);
    }
  }

  /**
   * Maneja el evento de selección de archivo
   * @param event Evento de cambio del input
   */
  onFileSelected(event: Event): void {
    if (this.hasFile()) {
      this.showError('Por favor, borra el archivo actual antes de cargar uno nuevo');
      return;
    }

    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files?.length) {
      this.handleFile(files[0]);
    }
  }

  /**
   * Procesa el archivo seleccionado
   * @param file Archivo seleccionado
   */
  private async handleFile(file: File): Promise<void> {
    const fileValidation = this.validatorService.validateFileType(file, EXCEL_CONSUMIBLES_CONFIG);
    if (!fileValidation.isValid) {
      this.showError(fileValidation.error ?? 'Archivo no válido');
      return;
    }

    try {
      const data = await this.readFileAsArrayBuffer(file);
      const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });

      const sheetName = this.processorService.findValidSheet(workbook, EXCEL_CONSUMIBLES_CONFIG);
      if (!sheetName) {
        this.showError('No se encontró una hoja válida con el formato requerido');
        this.resetFileInput();
        return;
      }

      const worksheet = workbook.Sheets[sheetName];
      const validation = this.validatorService.validateTableStructure(worksheet, EXCEL_CONSUMIBLES_CONFIG);

      if (!validation.isValid) {
        this.showError(validation.error ?? 'Formato de tabla inválido');
        this.resetFileInput();
        return;
      }

      const processedJsonData = this.processorService.processExcelData(worksheet, EXCEL_CONSUMIBLES_CONFIG);
      if (processedJsonData.length === 0 || processedJsonData.length === 1) {
        this.showError('No se encontraron datos en la tabla, verifique el archivo');
        this.resetFileInput();
        return;
      }

      this.currentFile.set(file);
      this.hasFile.set(true);
      this.dataLoaded.emit(processedJsonData);
      this.showSuccess(`Archivo cargado correctamente desde la hoja "${sheetName}"`);
    } catch (error) {
      console.error('Error processing Excel file:', error);
      this.showError('Error al procesar el archivo Excel');
      this.resetFileInput();
    }
  }

  /**
   * Lee el archivo como un array buffer
   * @param file Archivo a leer
   */
  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Resetea el input de archivo
   */
  private resetFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
      this.hasFile.set(false);
      this.currentFile.set(null);
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
    this.resetFileInput();
    this.dataLoaded.emit([]);
    this.showSuccess('Archivo y datos eliminados');
  }


  public files: NgxFileDropEntry[] = [];

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {

      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {

          // Here you can access the real file
          console.log(droppedFile.relativePath, file);

          /**
          // You could upload it like this:
          const formData = new FormData()
          formData.append('logo', file, relativePath)

          // Headers
          const headers = new HttpHeaders({
            'security-token': 'mytoken'
          })

          this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
          .subscribe(data => {
            // Sanitized logo returned from backend
          })
          **/

        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }

  public fileOver(event:any){
    console.log(event);
  }

  public fileLeave(event:any){
    console.log(event);
  }
}