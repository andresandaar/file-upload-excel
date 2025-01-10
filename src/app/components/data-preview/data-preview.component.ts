import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, ElementRef, signal, inject, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';;
import { MatButtonModule } from '@angular/material/button';
import { DataPreviewRow, ErrorsByRow, SelectOptions, ValidationError } from '../../models/data-preview.interface';
import { CONSUMIBLE_FORMAT_DATA_BASE, CONSUMIBLE_FORMAT_EXCEL_HEADERS } from '../../config/consumible-format';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormService } from '../../services/form-service.service';
import MyValidatorsForm from '../../utils/validators/my-validators-form';
import { InputCustomComponent, InputDateComponent, InputNumberComponent } from '../inputs';
import { CurrencyFormatterDirective } from '../../directives/CurrencyFormatter/currency-formatter.directive';

@Component({
  selector: 'app-data-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatCardModule,
    MatButtonModule,
    InputDateComponent,
    InputNumberComponent,
    InputCustomComponent,
  ],
  providers: [DatePipe],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
  templateUrl: './data-preview.component.html',
  styleUrls: ['./data-preview.component.scss'],
})
export class DataPreviewComponent implements AfterViewInit {
  private readonly fb: FormBuilder = inject(FormBuilder);
  public readonly formService: FormService = inject(FormService);
  private readonly datePipe: DatePipe = inject(DatePipe);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('container') container!: ElementRef;

  /**
   * FormArray que contiene los formularios reactivos para cada fila de datos
   */
  formArray = signal(this.fb.array<FormGroup>([]));

  /**
   * Fuente de datos para la tabla
   */
  dataSource = signal(new MatTableDataSource<DataPreviewRow[]>([]));

  /**
   * Setter para el input de datos
   * @param value Array de objetos desconocidos que se transformarán a DataPreviewRow
   */
  @Input() set data(value: unknown[]) {
    if (value) {
      const processedDataFinal: DataPreviewRow[] = this.transformData(value as any[]);
      this.initializeForms(processedDataFinal);
    }
  }

  /**
   * Evento de salida para enviar los datos validados al servidor
   */
  @Output() submitData = new EventEmitter<DataPreviewRow[]>();

  /**
   * Configuración de formato para los datos
   */
  consumibleFormatDataBase = CONSUMIBLE_FORMAT_DATA_BASE
  consumibleFormatExcelHeaders = CONSUMIBLE_FORMAT_EXCEL_HEADERS

  /**
   * Columnas a mostrar en la tabla
   */
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

  /**
   * Errores de validación por fila
   */
  validationErrors = signal<ErrorsByRow[]>([]);
  errorsByRow = signal<ErrorsByRow[]>([]);
  editingCell = signal<{ row: number, column: string } | null>(null);

  /**
   * Cantidad de filas con errores de validación
   */
  public readonly errorRowCount = computed(() => {
    return this.validationErrors().length;
  });

  /**
   * Estado de validez del formulario
   */
  public readonly formInValid = computed(() => {
    return this.validationErrors().length > 0 || this.formArray().invalid
  });

  /**
   * Opciones para los select de categorías, fabricantes y proveedores
   */
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


  /**
   * Inicializa los componentes después de la creación del componente
   */
  ngAfterViewInit() {
    this.dataSource().paginator = this.paginator;
    this.dataSource().sort = this.sort;
  }

  /**
   * Inicializa los formularios reactivos para cada fila de datos
   * @param data Array de objetos DataPreviewRow que contiene los datos a mostrar
   */
  private initializeForms(data: DataPreviewRow[]) {
    const forms = data.map(row => {
      return this.fb.group({
        [this.consumibleFormatDataBase.NOMBRE]: [row[this.consumibleFormatDataBase.NOMBRE], [Validators.required, Validators.maxLength(50)]],
        [this.consumibleFormatDataBase.CATEGORIA]: [row[this.consumibleFormatDataBase.CATEGORIA], [Validators.required, MyValidatorsForm.patternPositiveInteger]],
        [this.consumibleFormatDataBase.CANTIDAD]: [row[this.consumibleFormatDataBase.CANTIDAD], [Validators.required, Validators.min(1), Validators.max(1000)]],
        [this.consumibleFormatDataBase.CANTIDAD_MINIMA]: [row[this.consumibleFormatDataBase.CANTIDAD_MINIMA], [Validators.required, Validators.min(1), Validators.max(1000)]],
        [this.consumibleFormatDataBase.FABRICANTE]: [row[this.consumibleFormatDataBase.FABRICANTE], [Validators.required, MyValidatorsForm.patternPositiveInteger]],
        [this.consumibleFormatDataBase.MODELO]: [row[this.consumibleFormatDataBase.MODELO], [Validators.required, Validators.maxLength(50)]],
        [this.consumibleFormatDataBase.PROVEEDOR]: [row[this.consumibleFormatDataBase.PROVEEDOR], [Validators.required, MyValidatorsForm.patternPositiveInteger]],
        [this.consumibleFormatDataBase.COSTO]: [row[this.consumibleFormatDataBase.COSTO], [Validators.required, MyValidatorsForm.patternPositiveInteger, Validators.min(1)]],
        [this.consumibleFormatDataBase.NUMERO_DE_FACTURA]: [row[this.consumibleFormatDataBase.NUMERO_DE_FACTURA], [Validators.required, Validators.maxLength(50)]],
        [this.consumibleFormatDataBase.FECHA_DE_COMPRA]: [row[this.consumibleFormatDataBase.FECHA_DE_COMPRA], [Validators.required,]],
        [this.consumibleFormatDataBase.OBSERVACIONES]: [row[this.consumibleFormatDataBase.OBSERVACIONES], [Validators.maxLength(200)]],
      })
    });
    this.formArray.set(this.fb.array(forms));
    const rawValue = this.formArray().getRawValue() as any[][];
    this.dataSource().data = rawValue;
    this.validateData();
  }

  /**
   * Obtiene el FormControl para una celda específica
   * @param rowIndex Índice de la fila
   * @param column Nombre de la columna
   * @returns FormControl para la celda
   */
  getFormControl(rowIndex: number, column: string): FormControl {
    return (this.formArray() as FormArray).at(rowIndex).get(column) as FormControl;
  }

  /**
   * Obtiene el FormGroup para una fila específica
   * @param rowIndex Índice de la fila
   * @returns FormGroup para la fila
   */
  getFormGroup(rowIndex: number): FormGroup {
    return this.formArray().at(rowIndex) as unknown as FormGroup;
  }

  /**
   * Inicia la edición de una celda
   * @param event Evento del clic del mouse
   * @param row Fila de datos
   * @param column Nombre de la columna
   * @param rowIndex Índice de la fila
   */
  startEditing(event: MouseEvent, row: DataPreviewRow, column: string, rowIndex: number) {
    event.stopPropagation();
    this.editingCell.set({ row: rowIndex, column });
  }

  /**
   * Finaliza la edición de una celda
   */
  finishEditing() {
    if (this.editingCell()) {
      const rawValue = this.formArray().getRawValue() as any[][];
      this.dataSource().data = rawValue;
      this.validateData();
      this.editingCell.set(null);
    }
  }

  /**
   * Verifica si una celda está en edición
   * @param column Nombre de la columna
   * @param rowIndex Índice de la fila
   * @returns true si la celda está en edición, false de lo contrario
   */
  isEditing(column: string, rowIndex: number): boolean {
    return this.editingCell()?.row === rowIndex && this.editingCell()?.column === column;
  }

  /**
   * Formatea el valor de una celda según el tipo de columna
   * @param value Valor a formatear
   * @param column Nombre de la columna
   * @returns Valor formateado según el tipo de columna
   */
  formatCellValue(value: any, column: string): any {
    if (value === null || value === undefined) return '';
    let categoria;
    let fabricante;
    let proveedor;
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
        return this.formatNumberOne(value);
      case this.consumibleFormatDataBase.FECHA_DE_COMPRA:
        return this.formatDateOne(value);
      default:
        return String(value);
    }
  }

  /**
   * Valida si el ID de categoría existe en las opciones disponibles
   * @param value ID de la categoría a validar
   * @returns Mensaje de error si el ID es inválido, null si es válido
   */
  private validateCategoria(value: any): string | null {
    if (!this.selectOptions.categorias.some(c => c.id === value)) {
      return 'ID de categoría inválido';
    }
    return null;
  }

  /**
   * Valida si el ID del fabricante existe en las opciones disponibles
   * @param value ID del fabricante a validar
   * @returns Mensaje de error si el ID es inválido, null si es válido
   */
  private validateFabricante(value: any): string | null {
    if (!this.selectOptions.fabricantes.some(f => f.id === value)) {
      return 'ID de fabricante inválido';
    }
    return null;
  }

  /**
   * Valida si el ID del proveedor existe en las opciones disponibles
   * @param value ID del proveedor a validar
   * @returns Mensaje de error si el ID es inválido, null si es válido
   */
  private validateProveedor(value: any): string | null {
    if (!this.selectOptions.proveedores.some(p => p.id === value)) {
      return 'ID de proveedor inválido';
    }
    return null;
  }

  /**
   * Valida las cantidades ingresadas (cantidad y cantidad mínima)
   * @param key Identificador del campo (CANTIDAD o CANTIDAD_MINIMA)
   * @param value Valor a validar
   * @param row Fila completa de datos para validaciones cruzadas
   * @returns Mensaje de error si hay problemas con las cantidades, null si son válidas
   */
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

  /**
   * Verifica si hay error en la relación entre cantidad y cantidad mínima
   * @param row Fila de datos a validar
   * @returns true si la cantidad es menor que la cantidad mínima o es negativa
   */
  private hasQuantityError(row: DataPreviewRow): boolean {
    const cantidad = Number((row as any)[this.consumibleFormatDataBase.CANTIDAD]);
    const cantidadMinima = Number((row as any)[this.consumibleFormatDataBase.CANTIDAD_MINIMA]);
    return !isNaN(cantidad) && !isNaN(cantidadMinima) &&
      (cantidad < cantidadMinima || cantidad < 0);
  }

  /**
   * Maneja el evento de clic en el documento
   * Cierra la edición de celdas cuando se hace clic fuera del contenedor
   * @param event Evento del clic del mouse
   */
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

  /**
   * Transforma los datos JSON importados al formato requerido por el componente
   * Realiza el parseo inicial de los datos y aplica las transformaciones necesarias
   * @param jsonData Datos JSON importados del Excel
   * @returns Array de objetos DataPreviewRow con los datos transformados
   */
  transformData(jsonData: any[]): DataPreviewRow[] {
    return jsonData
      .filter(row => Object.values(row).some(value => value !== ''))
      .map(row => ({
        [this.consumibleFormatDataBase.NOMBRE]: this.parseString(row[this.consumibleFormatExcelHeaders.NOMBRE] ?? ''),
        [this.consumibleFormatDataBase.CATEGORIA]: this.parseNumber(row[this.consumibleFormatExcelHeaders.CATEGORIA]),
        [this.consumibleFormatDataBase.CANTIDAD]: this.parseNumber(row[this.consumibleFormatExcelHeaders.CANTIDAD]),
        [this.consumibleFormatDataBase.CANTIDAD_MINIMA]: this.parseNumber(row[this.consumibleFormatExcelHeaders.CANTIDAD_MINIMA]),
        [this.consumibleFormatDataBase.FABRICANTE]: this.parseNumber(row[this.consumibleFormatExcelHeaders.FABRICANTE]),
        [this.consumibleFormatDataBase.MODELO]: this.parseString(row[this.consumibleFormatExcelHeaders.MODELO] ?? ''),
        [this.consumibleFormatDataBase.PROVEEDOR]: this.parseNumber(row[this.consumibleFormatExcelHeaders.PROVEEDOR]),
        [this.consumibleFormatDataBase.COSTO]: this.parseNumber(row[this.consumibleFormatExcelHeaders.COSTO]),
        [this.consumibleFormatDataBase.NUMERO_DE_FACTURA]: this.parseString(row[this.consumibleFormatExcelHeaders.NUMERO_DE_FACTURA] ?? ''),
        [this.consumibleFormatDataBase.FECHA_DE_COMPRA]: this.parseDate(row[this.consumibleFormatExcelHeaders.FECHA_DE_COMPRA]),
        [this.consumibleFormatDataBase.OBSERVACIONES]: this.parseString(row[this.consumibleFormatExcelHeaders.OBSERVACIONES] ?? '')
      } as unknown as DataPreviewRow))
      .slice(1); // Remove header row
  }

  /**
   * Parsea un valor a número
   * @param value Valor a convertir a número
   * @returns Número parseado o null si no es válido
   */
  parseNumber(value: any): number | null {
    const parsed = Number(value);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Parsea un valor a string
   * @param value Valor a convertir a string
   * @returns String o null si el valor no es una cadena válida
   */
  parseString(value: any): string | null {
    return typeof value === 'string' ? value : null;
  }

  /**
   * Parsea una cadena a objeto Date
   * Soporta múltiples formatos de fecha (yyyy-MM-dd, dd/MM/yyyy)
   * @param dateString Cadena de fecha a parsear
   * @returns Objeto Date o null si la fecha no es válida
   */
  parseDate(dateString: string | undefined): Date | null {
    if (!dateString) {
      return null;
    }

    // Try parsing the date string directly first
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // If direct parsing fails, try manual parsing
    const parts = dateString.split(/[-/]/); // Handle both - and / separators
    if (parts.length !== 3) {
      return null;
    }

    let year = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10) - 1;
    let day = parseInt(parts[2], 10);

    // Handle two-digit years
    if (year < 100) {
      year += 2000;
    }

    const result = new Date(year, month, day);
    return !isNaN(result.getTime()) ? result : null;
  }

  /**
   * Formatea un número como moneda utilizando el directivo CurrencyFormatter
   * @param value Número o cadena a formatear como moneda
   * @returns Cadena formateada en formato de moneda colombiana
   */
  formatNumberOne(value: number | string): string {
    const directive = new CurrencyFormatterDirective(null!, null!);
    return directive.formatStaticValue(value);
  }

  /**
   * Formatea una fecha utilizando DatePipe
   * @param value Fecha a formatear
   * @returns Cadena de fecha formateada en formato dd/MM/yyyy
   */
  formatDateOne(value: Date | null): string {
    return this.datePipe.transform(value, 'dd/MM/yyyy') ?? '';
  }

  /**
 * Valida los datos del formulario y selecciona el primer error por cada celda (control)
 */
  private validateData(): void {
    this.errorsByRow.set([]);
    this.validationErrors.set([]);
    const formArray = this.formArray();
    const errorsByRow = new Map<number, ValidationError[]>();
    const validationErrors = new Map<number, ValidationError[]>();

    formArray.controls.forEach((formGroup: AbstractControl, rowIndex: number) => {
      if (formGroup instanceof FormGroup) {
        Object.keys(formGroup.controls).forEach(controlName => {
          const control = formGroup.get(controlName);
          if (control?.errors) {
            const firstErrorMessage = this.formService.getErrorMessage(control);
            // Si no existen errores en esta fila, inicializarlos
            if (!errorsByRow.has(rowIndex)) {
              errorsByRow.set(rowIndex, []);
            }
            if (!validationErrors.has(rowIndex)) {
              validationErrors.set(rowIndex, []);
            }

            // Crear el error para la celda
            const error: ValidationError = {
              row: rowIndex,
              column: this.getExcelHeaderForColumn(controlName),
              message: firstErrorMessage,
            };

            errorsByRow.get(rowIndex)?.push(error);
            validationErrors.get(rowIndex)?.push({
              ...error,
              column: controlName, // Nombre técnico del control
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
  }


  /**
   * Obtiene el encabezado de Excel para una columna específica
   * @param column Nombre de la columna
   * @returns Encabezado de Excel para la columna
   */
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

  /**
   * Verifica si hay error en una celda específica
   * @param row Fila de datos
   * @param column Nombre de la columna
   * @returns true si hay error en la celda, false de lo contrario
   */
  hasErrorInCell(row: any, column: string): boolean {
    const rowIndex = this.dataSource().data.indexOf(row);
    const rowErrors = this.validationErrors().find(error => error.row === rowIndex);
    return rowErrors?.errors.some(error => error.column === column) ?? false;
  }

  /**
   * Verifica si hay errores en una fila específica
   * @param row Fila de datos
   * @returns true si hay errores en la fila, false de lo contrario
   */
  hasErrorsInRow(row: any): boolean {
    const rowIndex = this.dataSource().data.indexOf(row);
    return this.validationErrors().some(error => error.row === rowIndex);
  }

  /**
   * Obtiene el mensaje de error para una celda específica
   * @param row Fila de datos
   * @param column Nombre de la columna
   * @returns Mensaje de error para la celda
   */
  getCellErrorMessage(row: any, column: string): string {
    const rowIndex = this.dataSource().data.indexOf(row);
    const rowErrors = this.validationErrors().find(error => error.row === rowIndex);
    const error = rowErrors?.errors.find(error => error.column === column);
    return error?.message ?? '';
  }

  /**
   * Envía los datos validados al servidor
   */
  onSubmit() {
    console.log(this.formArray().getRawValue());
    // if (this.validationErrors().length === 0) {
    //   const cleanData = this.dataSource().data.map(row => {
    //     const { _errors, ...cleanRow } = row;
    //     return cleanRow;
    //   });
    //   this.submitData.emit(cleanData);
    // }
  }
}
