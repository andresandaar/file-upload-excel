import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'input-image',
  standalone: true,
  imports: [CommonModule, MatIcon,],
  templateUrl: './input-image.component.html',
  styleUrl: './input-image.component.css'
})
export class InputImageComponent {

  @Input() label: string = 'Imagen:';
  @Input() accept: string = 'image/*';
  @Input() currentImageName: string = '';
  @Input() imageBlob: Blob | null = null;
  @Input() imageTitle: string = 'Haga clic para ver la imagen';

  @Output() fileSelected = new EventEmitter<File>();

  selectedImage: File | undefined = undefined;

  constructor(private readonly snackBar: MatSnackBar) { }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      if (this.isImageFile(file)) {
        this.selectedImage = file;
        this.fileSelected.emit(this.selectedImage);  // Emitir el nuevo archivo
      } else {
        this.showSnackBar('Por favor, seleccione solo archivos de imagen.', 'error');
        element.value = '';
      }
    } else if (this.selectedImage) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(this.selectedImage);
      element.files = dataTransfer.files;
      this.fileSelected.emit(this.selectedImage);
    } else {
      this.selectedImage = undefined;
      this.fileSelected.emit(undefined);  
    }
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  openImage() {
    if (this.imageBlob) {
      const url = URL.createObjectURL(this.imageBlob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, undefined, {
      duration: 3000,
      panelClass: type === 'success' ? ['snackbar-success'] : ['snackbar-error'],
    });
  }

}
