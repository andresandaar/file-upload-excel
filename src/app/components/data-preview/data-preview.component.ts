import { Component, Input, Output, EventEmitter, ViewChild, OnChanges, AfterViewInit, ElementRef, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { DataPreviewRow, ErrorsByRow, SelectOptions, ValidationError } from '../../models/data-preview.interface';
import { CONSUMIBLE_FORMAT_DATA_BASE, CONSUMIBLE_FORMAT_EXCEL_HEADERS } from '../../config/consumible-format';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { FormService } from '../../services/form-service.service';
import MyValidatorsForm from '../../utils/validators/my-validators-form';
import { InputCustomComponent, InputDateComponent, InputImageComponent, InputNumberComponent } from '../inputs';

@Component({
  selector: 'app-data-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    InputDateComponent,
    InputNumberComponent,
    InputImageComponent,
    InputCustomComponent,
  ],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
  templateUrl: './data-preview.component.html',
  styleUrls: ['./data-preview.component.scss'],
})
export class DataPreviewComponent implements AfterViewInit {
  private readonly fb: FormBuilder = inject(FormBuilder);
  public readonly formService: FormService = inject(FormService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('container') container!: ElementRef;


  formArray = signal(this.fb.array<FormGroup>([]));
  dataSource = signal(new MatTableDataSource<DataPreviewRow[]>([]));

  @Input() set data(value: unknown[]) {
    if (value) {
      const processedDataFinal: DataPreviewRow[] = this.transformData(value as any[]);
      this.initializeForms(processedDataFinal);
    }
  }

  @Output() submitData = new EventEmitter<DataPreviewRow[]>();

  consumibleFormatDataBase = CONSUMIBLE_FORMAT_DATA_BASE
  consumibleFormatExcelHeaders = CONSUMIBLE_FORMAT_EXCEL_HEADERS

  displayedColumns: string[] = [
    this.consumibleFormatDataBase.NOMBRE,
    this.consumibleFormatDataBase.CATEGORIA,
    this.consumibleFormatDataBase.CANTIDAD,
    this.consumibleFormatDataBase.CANTIDAD_MINIMA,
    this.consumibleFormatDataBase.FABRICANTE,
    this.consumibleFormatDataBase.MODELO,
    this.consumibleFormatDataBase.PROVEEDOR,
    this.consumibleFormatDataBase.COSTO,
    this.consumibleFormatDataBase.NUMERO_DE_FACTURA,
    this.consumibleFormatDataBase.FECHA_DE_COMPRA,
    this.consumibleFormatDataBase.OBSERVACIONES
  ];

  validationErrors = signal<ErrorsByRow[]>([]);
  errorsByRow = signal<ErrorsByRow[]>([]);
  editingCell = signal<{ row: number, column: string } | null>(null);
  // Create a computed value for the MatTableDataSource
  public readonly errorRowCount = computed(() => {
    return this.validationErrors().length;
  });

  public readonly formInValid = computed(() => {
    return this.validationErrors().length > 0 || this.formArray().invalid
  });

  selectOptions: SelectOptions = {
    categorias: [
      { id: 1, name: 'Ferretería' },
      { id: 2, name: 'Herramientas' },
      { id: 3, name: 'Materiales de Construcción' },
      { id: 4, name: 'Eléctricos' },
      { id: 5, name: 'Plomería' },
      { id: 6, name: 'Pintura' },
      { id: 7, name: 'Seguridad' },
      { id: 8, name: 'Jardinería' },
      { id: 9, name: 'Iluminación' },
      { id: 10, name: 'Otros' }
    ],
    fabricantes: [
      { id: 1, name: 'ACME Tools' },
      { id: 2, name: 'DeWalt' },
      { id: 3, name: 'Bosch' },
      { id: 4, name: 'Stanley' },
      { id: 5, name: 'Black & Decker' },
      { id: 6, name: 'Makita' },
      { id: 7, name: 'Milwaukee' },
      { id: 8, name: 'Hilti' },
      { id: 9, name: 'Craftsman' },
      { id: 10, name: 'Otros' }
    ],
    proveedores: [
      { id: 1, name: 'Ferretería Central' },
      { id: 2, name: 'Distribuidora Industrial' },
      { id: 3, name: 'Materiales Express' },
      { id: 4, name: 'Herramientas Pro' },
      { id: 5, name: 'Suministros Técnicos' },
      { id: 6, name: 'Importadora Nacional' },
      { id: 7, name: 'Comercial Ferretera' },
      { id: 8, name: 'Otros' }
    ]
  };

  constructor(private readonly dateAdapter: DateAdapter<Date>) {
    this.dateAdapter.setLocale('es');
  }

  ngAfterViewInit() {
    this.dataSource().paginator = this.paginator;
    this.dataSource().sort = this.sort;
  }

  private initializeForms(data: DataPreviewRow[]) {
    const forms = data.map(row => this.fb.group({
      [this.consumibleFormatDataBase.NOMBRE]: [row[this.consumibleFormatDataBase.NOMBRE], [Validators.required, Validators.maxLength(50)]],
      [this.consumibleFormatDataBase.CATEGORIA]: [row[this.consumibleFormatDataBase.CATEGORIA], [Validators.required, MyValidatorsForm.patternPositiveInteger]],
      [this.consumibleFormatDataBase.CANTIDAD]: [row[this.consumibleFormatDataBase.CANTIDAD], [Validators.required, Validators.min(1), Validators.max(1000)]],
      [this.consumibleFormatDataBase.CANTIDAD_MINIMA]: [row[this.consumibleFormatDataBase.CANTIDAD_MINIMA], [Validators.required, Validators.min(1), Validators.max(1000)]],
      [this.consumibleFormatDataBase.FABRICANTE]: [row[this.consumibleFormatDataBase.FABRICANTE], [Validators.required, MyValidatorsForm.patternPositiveInteger]],
      [this.consumibleFormatDataBase.MODELO]: [row[this.consumibleFormatDataBase.MODELO], [Validators.required, Validators.maxLength(50)]],
      [this.consumibleFormatDataBase.PROVEEDOR]: [row[this.consumibleFormatDataBase.PROVEEDOR], [Validators.required, MyValidatorsForm.patternPositiveInteger]],
      [this.consumibleFormatDataBase.COSTO]: [row[this.consumibleFormatDataBase.COSTO], [Validators.required, MyValidatorsForm.patternPositiveInteger, Validators.min(1)]],
      [this.consumibleFormatDataBase.NUMERO_DE_FACTURA]: [row[this.consumibleFormatDataBase.NUMERO_DE_FACTURA], [Validators.required, Validators.maxLength(50)]],
      [this.consumibleFormatDataBase.FECHA_DE_COMPRA]: [row[this.consumibleFormatDataBase.FECHA_DE_COMPRA], [Validators.required]],
      [this.consumibleFormatDataBase.OBSERVACIONES]: [row[this.consumibleFormatDataBase.OBSERVACIONES], [Validators.maxLength(200)]],
    }));


    this.formArray.set(this.fb.array(forms));
    const rawValue = this.formArray().getRawValue() as any[][];
    this.dataSource().data = rawValue;
    this.validateData();
  }

  getFormControl(rowIndex: number, column: string): FormControl {
    return (this.formArray() as FormArray).at(rowIndex).get(column) as FormControl;
  }

  getFormGroup(rowIndex: number): FormGroup {
    return this.formArray().at(rowIndex) as unknown as FormGroup;
  }

  startEditing(event: MouseEvent, row: DataPreviewRow, column: string, rowIndex: number) {
    event.stopPropagation();
    this.editingCell.set({ row: rowIndex, column });
  }

  finishEditing() {
    if (this.editingCell()) {
      const rawValue = this.formArray().getRawValue() as any[][];
      this.dataSource().data = rawValue;
      this.validateData();
      this.editingCell.set(null);
    }
  }

  isEditing(column: string, rowIndex: number): boolean {
    return this.editingCell()?.row === rowIndex && this.editingCell()?.column === column;
  }


  parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    // Handle "DD/MM/YYYY" format
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);

      // Validate day, month, and year
      if (month < 0 || month > 11) return null;
      if (day < 1 || day > 31) return null;
      if (year < 2000 || year > 2100) return null;

      const date = new Date(year, month, day);

      // Verify the date is valid (handles cases like 31/04/2025)
      if (date.getMonth() !== month || date.getDate() !== day || date.getFullYear() !== year) {
        return null;
      }

      return date;
    }

    return null;
  }

  validateDate(value: any): boolean {
    if (!value) return false; // Don't allow empty dates
    if (value instanceof Date) return !isNaN(value.getTime());
    return this.parseDate(value) !== null;
  }

  formatCellValue(value: any, column: string): string {
    if (value === null || value === undefined) return '';

    let categoria;
    let fabricante;
    let proveedor;
    let date;

    switch (column) {
      case this.consumibleFormatDataBase.CATEGORIA:
        categoria = this.selectOptions.categorias.find(c => c.id === value);
        return categoria ? categoria.name : value;
      case this.consumibleFormatDataBase.FABRICANTE:
        fabricante = this.selectOptions.fabricantes.find(f => f.id === value);
        return fabricante ? fabricante.name : value;
      case this.consumibleFormatDataBase.PROVEEDOR:
        proveedor = this.selectOptions.proveedores.find(p => p.id === value);
        return proveedor ? proveedor.name : value;
      case this.consumibleFormatDataBase.COSTO:
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0
        }).format(value);
      case this.consumibleFormatDataBase.FECHA_DE_COMPRA:
        if (!value) return '';
        date = value instanceof Date ? value : this.parseDate(value);
        if (!date) return value;
        return date.toLocaleDateString('es', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      default:
        return String(value);
    }
  }

  onSubmit() {
    // if (this.validationErrors().length === 0) {
    //   const cleanData = this.dataSource().data.map(row => {
    //     const { _errors, ...cleanRow } = row;
    //     return cleanRow;
    //   });
    //   this.submitData.emit(cleanData);
    // }
  }


  hasErrorInCell(row: any, column: string): boolean {
    const rowIndex = this.dataSource().data.indexOf(row);
    const rowErrors = this.validationErrors().find(error => error.row === rowIndex);
    return rowErrors?.errors.some(error => error.column === column) ?? false;
  }

  hasErrorsInRow(row: any): boolean {
    const rowIndex = this.dataSource().data.indexOf(row);
    return this.validationErrors().some(error => error.row === rowIndex);
  }

  getCellErrorMessage(row: any, column: string): string {
    const rowIndex = this.dataSource().data.indexOf(row);
    const rowErrors = this.validationErrors().find(error => error.row === rowIndex);
    const error = rowErrors?.errors.find(error => error.column === column);
    return error?.message ?? '';
  }

  private validateData(): void {
    const formArray = this.formArray();
    const errorsByRow = new Map<number, ValidationError[]>();
    const validationErrors = new Map<number, ValidationError[]>();

    formArray.controls.forEach((formGroup: AbstractControl, rowIndex: number) => {
      if (formGroup instanceof FormGroup) {
        Object.keys(formGroup.controls).forEach(controlName => {
          const control = formGroup.get(controlName);
          if (control?.errors) {
            Object.keys(control.errors).forEach(errorType => {
              if (!errorsByRow.has(rowIndex) && !validationErrors.has(rowIndex)) {
                errorsByRow.set(rowIndex, []);
                validationErrors.set(rowIndex, []);
              }

              errorsByRow.get(rowIndex)?.push({
                row: rowIndex,
                column: this.getExcelHeaderForColumn(controlName),
                message: this.formService.getErrorMessage(control),
              });

              validationErrors.get(rowIndex)?.push({
                row: rowIndex,
                column: controlName,
                message: this.formService.getErrorMessage(control),
              })

            });
          }
        });
      }
    });

    // Convertir el Map a un array de objetos con el formato deseado
    const groupedErrors = Array.from(errorsByRow.entries())
      .map(([row, errors]) => ({ row, errors }))
      .sort((a, b) => a.row - b.row);

    const groupedValidationErrors = Array.from(validationErrors.entries())
      .map(([row, errors]) => ({ row, errors }))
      .sort((a, b) => a.row - b.row);

    this.errorsByRow.set(groupedErrors);
    this.validationErrors.set(groupedValidationErrors);
    console.log(this.validationErrors())
  }


  private getExcelHeaderForColumn(column: string): string {
    // Create a reverse mapping from database fields to excel headers
    const reverseMapping: { [key: string]: string } = {
      [this.consumibleFormatDataBase.NOMBRE]: this.consumibleFormatExcelHeaders.NOMBRE,
      [this.consumibleFormatDataBase.CATEGORIA]: this.consumibleFormatExcelHeaders.CATEGORIA,
      [this.consumibleFormatDataBase.CANTIDAD]: this.consumibleFormatExcelHeaders.CANTIDAD,
      [this.consumibleFormatDataBase.CANTIDAD_MINIMA]: this.consumibleFormatExcelHeaders.CANTIDAD_MINIMA,
      [this.consumibleFormatDataBase.FABRICANTE]: this.consumibleFormatExcelHeaders.FABRICANTE,
      [this.consumibleFormatDataBase.MODELO]: this.consumibleFormatExcelHeaders.MODELO,
      [this.consumibleFormatDataBase.PROVEEDOR]: this.consumibleFormatExcelHeaders.PROVEEDOR,
      [this.consumibleFormatDataBase.COSTO]: this.consumibleFormatExcelHeaders.COSTO,
      [this.consumibleFormatDataBase.NUMERO_DE_FACTURA]: this.consumibleFormatExcelHeaders.NUMERO_DE_FACTURA,
      [this.consumibleFormatDataBase.FECHA_DE_COMPRA]: this.consumibleFormatExcelHeaders.FECHA_DE_COMPRA,
      [this.consumibleFormatDataBase.OBSERVACIONES]: this.consumibleFormatExcelHeaders.OBSERVACIONES
    };

    return reverseMapping[column] || column;
  }

  private validateCategoria(value: any): string | null {
    if (!this.selectOptions.categorias.some(c => c.id === value)) {
      return 'ID de categoría inválido';
    }
    return null;
  }

  private validateFabricante(value: any): string | null {
    if (!this.selectOptions.fabricantes.some(f => f.id === value)) {
      return 'ID de fabricante inválido';
    }
    return null;
  }

  private validateProveedor(value: any): string | null {
    if (!this.selectOptions.proveedores.some(p => p.id === value)) {
      return 'ID de proveedor inválido';
    }
    return null;
  }

  private validateFechaDeCompra(value: any): string | null {
    if (!this.validateDate(value)) {
      return 'Formato de fecha inválido. Use DD/MM/YYYY';
    }
    return null;
  }

  private validateCantidadYCantidadMinima(key: string, value: any, row: DataPreviewRow): string | null {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue)) {
      return 'Debe ser un número entero positivo';
    }
    if (key === this.consumibleFormatDataBase.CANTIDAD && this.hasQuantityError(row)) {
      return 'La cantidad no puede ser menor que la cantidad mínima';
    }
    return null;
  }

  private hasQuantityError(row: DataPreviewRow): boolean {
    const cantidad = Number((row as any)[this.consumibleFormatDataBase.CANTIDAD]);
    const cantidadMinima = Number((row as any)[this.consumibleFormatDataBase.CANTIDAD_MINIMA]);
    return !isNaN(cantidad) && !isNaN(cantidadMinima) &&
      (cantidad < cantidadMinima || cantidad < 0);
  }




  onDocumentClick(event: MouseEvent) {
    // Si el click fue dentro del contenedor, no hacemos nada
    if (this.container?.nativeElement.contains(event.target)) {
      return;
    }
    // Si hay una celda en edición, la cancelamos
    if (this.editingCell()) {
      this.editingCell.set(null);
    }
  }

  transformData(jsonData: any[]): DataPreviewRow[] {
    return jsonData
      .filter(row => Object.values(row).some(value => value !== ''))
      .map(row => ({
        [this.consumibleFormatDataBase.NOMBRE]: String(row[this.consumibleFormatExcelHeaders.NOMBRE] || ''),
        [this.consumibleFormatDataBase.CATEGORIA]: String(row[this.consumibleFormatExcelHeaders.CATEGORIA] || ''),
        [this.consumibleFormatDataBase.CANTIDAD]: this.parseNumber(row[this.consumibleFormatExcelHeaders.CANTIDAD]),
        [this.consumibleFormatDataBase.CANTIDAD_MINIMA]: this.parseNumber(row[this.consumibleFormatExcelHeaders.CANTIDAD_MINIMA]),
        [this.consumibleFormatDataBase.FABRICANTE]: String(row[this.consumibleFormatExcelHeaders.FABRICANTE] || ''),
        [this.consumibleFormatDataBase.MODELO]: String(row[this.consumibleFormatExcelHeaders.MODELO] || ''),
        [this.consumibleFormatDataBase.PROVEEDOR]: String(row[this.consumibleFormatExcelHeaders.PROVEEDOR] || ''),
        [this.consumibleFormatDataBase.COSTO]: this.parseNumber(row[this.consumibleFormatExcelHeaders.COSTO]),
        [this.consumibleFormatDataBase.NUMERO_DE_FACTURA]: String(row[this.consumibleFormatExcelHeaders.NUMERO_DE_FACTURA] || ''),
        [this.consumibleFormatDataBase.FECHA_DE_COMPRA]: this.formatDate(row[this.consumibleFormatExcelHeaders.FECHA_DE_COMPRA]),
        [this.consumibleFormatDataBase.OBSERVACIONES]: String(row[this.consumibleFormatExcelHeaders.OBSERVACIONES] || '')
      } as unknown as DataPreviewRow))
      .slice(1); // Remove header row
  }

  parseNumber(value: any): number {
    const parsed = Number(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  formatDate(date: string): string {
    return date ? String(date).trim() : '';
  }
}
