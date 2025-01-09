import { Component, Output, EventEmitter, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExcelProcessorService } from '../../services/excel-processor.service';
import { EXCEL_CONSUMIBLES_CONFIG } from '../../config/excel-config';
import { NgxFileDropComponent } from '../ngx-file-drop/ngx-file-drop.component';
import { NgxFileDropEntry } from '../ngx-file-drop/ngx-file-drop-entry';
import { NgxFileDropContentTemplateDirective } from '../ngx-file-drop/directive/ngx-templates.directive';
import { ChipComponent } from '../chip/chip.component';

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
    NgxFileDropComponent,
    NgxFileDropContentTemplateDirective,
    ChipComponent
  ],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Output() dataLoaded = new EventEmitter<unknown[]>();
  @ViewChild(NgxFileDropComponent) fileDropComponent!: NgxFileDropComponent;

  currentFileName = signal<string | null>(null);
  currentFile = signal<File | null>(null);
  excelConsumiblesConfig = EXCEL_CONSUMIBLES_CONFIG

  constructor(
    private readonly excelProcessorService: ExcelProcessorService
  ) { }

  /**
   * Borra el archivo seleccionado
   */
  clearFile(): void {
    if (this.currentFile()) {
      this.fileDropComponent.resetFileInput()
      this.currentFile.set(null);
      this.currentFileName.set(null);
      this.dataLoaded.emit([]);
    }
  }


  /**
   * Maneja el evento de selección de archivo
   * Procesa el archivo seleccionado
   * @param event Evento de cambio del input
   * @param file Archivo seleccionado
   */
  async onFileSelected(files: NgxFileDropEntry[]): Promise<void> {
    if (files.length > 0 && files[0].fileEntry.isFile) {
      const fileEntry = files[0].fileEntry as FileSystemFileEntry;
      const fileName = files[0].fileEntry.name;
      fileEntry.file((file: File) => {
        this.excelProcessorService.processFileExcel(file, this.excelConsumiblesConfig).then((result) => {
          if (result.isValid) {
            this.currentFile.set(file);
            this.currentFileName.set(fileName);
            this.dataLoaded.emit(result.data);
          } else if (!result.isValid && result.clearFile) {
            this.dataLoaded.emit(result.data);
            this.clearFile();
          }
        })
      });
    }
  }

}