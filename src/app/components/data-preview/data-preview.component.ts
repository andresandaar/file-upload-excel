import { Component, Input, Output, EventEmitter, ViewChild, OnChanges, AfterViewInit, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataPreviewRow, DisplayedColumn, ErrorsByRow, SelectOptions, ValidationError } from '../../models/data-preview.interface';
import { CONSUMIBLE_FORMAT_DATA_BASE, CONSUMIBLE_FORMAT_EXCEL_HEADERS } from '../../config/consumible-format';


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
    MatSelectModule
  ],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
  templateUrl: './data-preview.component.html',
  styleUrls: ['./data-preview.component.scss'],
})
export class DataPreviewComponent implements OnChanges, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('container') container!: ElementRef;

  dataSource = signal(new MatTableDataSource<DataPreviewRow>([]));

  @Input() set data(value: unknown[]) {
    if (value) {
      const processedDataFinal: DataPreviewRow[] = this.transformData(value as any[]);
      this.dataSource().data = processedDataFinal;
      this.validateData(processedDataFinal);
    }
  }

  @Output() submitData = new EventEmitter<DataPreviewRow[]>();

  consumibleFormatDataBase = CONSUMIBLE_FORMAT_DATA_BASE
  consumibleFormatExcelHeaders = CONSUMIBLE_FORMAT_EXCEL_HEADERS

  /**
   * Fuente de datos para la tabla
   */
  displayedColumns: string[] = [
    this.consumibleFormatDataBase.NOMBRE,
    this.consumibleFormatDataBase.CATEGORIA,
    this.consumibleFormatDataBase.CANTIDAD,
    this.consumibleFormatDataBase.CANTIDAD_MINIMA,
    this.consumibleFormatDataBase.FABRICANTE,
    this.consumibleFormatDataBase.MODELO,
    this.consumibleFormatDataBase.PROVEEDOR,
    this.consumibleFormatDataBase.VALOR,
    this.consumibleFormatDataBase.NUMERO_DE_FACTURA,
    this.consumibleFormatDataBase.FECHA_DE_COMPRA,
    this.consumibleFormatDataBase.OBSERVACIONES
  ];



  validationErrors = signal<ValidationError[]>([]);
  errorsByRow = signal<ErrorsByRow[]>([]);
  editingCell = signal<{ row: number, column: string } | null>(null);

  /**
   * Opciones predefinidas para los selectores
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


  constructor(private readonly dateAdapter: DateAdapter<Date>, private readonly snackBar: MatSnackBar) {
    this.dateAdapter.setLocale('es');
  }

  /**
   * Inicializa la tabla después de que se hayan cargado los datos
   */
  ngAfterViewInit() {
    this.dataSource().paginator = this.paginator;
    this.dataSource().sort = this.sort;
  }

  /**
   * Valida los datos cuando cambian
   */
  ngOnChanges() {
    if (this.dataSource().data && this.dataSource().data.length > 0) {
      this.validateData(this.dataSource().data);
    }
  }

  /**
   * Inicia la edición de una celda
   * @param event Evento del mouse
   * @param row Fila a editar
   * @param column Columna a editar
   * @param rowIndex Índice de la fila
   */
  startEditing(event: MouseEvent, row: DataPreviewRow, column: string, rowIndex: number) {
    event.stopPropagation();
    this.editingCell.set({ row: rowIndex, column });
  }

  /**
   * Finaliza la edición de una celda y valida los cambios
   */
  finishEditing() {
    if (this.editingCell()) {
      this.validateData(this.dataSource().data);
      this.editingCell.set(null);
    }
  }

  /**
   * Verifica si una celda está en modo edición
   * @param row Fila a verificar
   * @param column Columna a verificar
   * @param rowIndex Índice de la fila
   * @returns true si la celda está en edición
   */
  isEditing(row: DataPreviewRow, column: string, rowIndex: number): boolean {
    return this.editingCell()?.row === rowIndex && this.editingCell()?.column === column;
  }

  /**
   * Obtiene el tipo de entrada para una columna
   * @param column Nombre de la columna
   * @returns Tipo de entrada
   */
  getInputType(column: string): string {
    switch (column) {
      case this.consumibleFormatDataBase.CANTIDAD:
      case this.consumibleFormatDataBase.CANTIDAD_MINIMA:
      case this.consumibleFormatDataBase.VALOR:
        return 'number';
      case this.consumibleFormatDataBase.FECHA_DE_COMPRA:
        return 'date';
      default:
        return 'text';
    }
  }


  /**
   * Parsea una fecha desde un string
   * @param dateStr Fecha como string
   * @returns Fecha como objeto Date
   */
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

  /**
   * Valida una fecha
   * @param value Fecha a validar
   * @returns true si la fecha es válida
   */
  validateDate(value: any): boolean {
    if (!value) return false; // Don't allow empty dates
    if (value instanceof Date) return !isNaN(value.getTime());
    return this.parseDate(value) !== null;
  }

  /**
   * Formatea el valor de una celda según su tipo
   * @param value Valor a formatear
   * @param column Nombre de la columna
   * @returns Valor formateado como string
   */
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
      case this.consumibleFormatDataBase.VALOR:
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


  /**
   * Obtiene un ejemplo para una columna
   * @param column Nombre de la columna
   * @returns Ejemplo para la columna
   */
  getExample(column: string): string {
    switch (column) {
      case this.consumibleFormatDataBase.NOMBRE:
        return 'Ej: Tornillo hexagonal M8';
      case this.consumibleFormatDataBase.CATEGORIA:
        return 'Ej: Ferretería';
      case this.consumibleFormatDataBase.CANTIDAD:
        return 'Ej: 100';
      case this.consumibleFormatDataBase.CANTIDAD_MINIMA:
        return 'Ej: 10';
      case this.consumibleFormatDataBase.FABRICANTE:
        return 'Ej: ACME Tools';
      case this.consumibleFormatDataBase.MODELO:
        return 'Ej: THX-M8-50';
      case this.consumibleFormatDataBase.PROVEEDOR:
        return 'Ej: Ferretería Central';
      case this.consumibleFormatDataBase.VALOR:
        return 'Ej: 5000';
      case this.consumibleFormatDataBase.NUMERO_DE_FACTURA:
        return 'Ej: FAC-2025-001';
      case this.consumibleFormatDataBase.FECHA_DE_COMPRA:
        return 'DD/MM/YYYY';
      case this.consumibleFormatDataBase.OBSERVACIONES:
        return 'Ej: Material acero inoxidable';
      default:
        return '';
    }
  }


  /**
   * Envía los datos validados al componente padre
   * Elimina la propiedad _errors antes de enviar
   */
  onSubmit() {
    if (this.validationErrors().length === 0) {
      const cleanData = this.dataSource().data.map(row => {
        const { _errors, ...cleanRow } = row;
        return cleanRow;
      });
      this.submitData.emit(cleanData);
    }
  }

  /**
   * Aplica un filtro a la tabla
   * @param event Evento del teclado
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource().filter = filterValue.trim().toLowerCase();
    if (this.dataSource().paginator) {
      this.dataSource().paginator?.firstPage();
    }
  }

  /**
   * Verifica si una celda tiene errores
   * @param row Fila a verificar
   * @param column Columna a verificar
   * @returns true si la celda tiene errores
   */
  hasErrorInCell(row: DataPreviewRow, column: string): boolean {
    return row._errors ? !!row._errors[column] : false;
  }

  /**
   * Verifica si una fila tiene errores
   * @param row Fila a verificar
   * @returns true si la fila tiene errores
   */
  hasErrorsInRow(row: DataPreviewRow): boolean {
    return row._errors ? Object.keys(row._errors).length > 0 : false;
  }


  /**
   * Valida todos los datos de la tabla
   * @param data Datos a validar
   */
  private validateData(data: DataPreviewRow[]): void {

    this.validationErrors.set([]);

    data.forEach((row, index) => {
      row._errors = {};

      Object.entries(row).forEach(([key, value]) => {
        if (key === '_errors') return;
        this.validateField(row, index, key, value);
      });
    });

    this.updateErrorsByRow();
  }

  /**
   * Valida un campo específico según sus reglas
   * @param row Fila que contiene el campo
   * @param rowIndex Índice de la fila
   * @param key Nombre del campo
   * @param value Valor a validar
   */
  private validateField(row: DataPreviewRow, rowIndex: number, key: string, value: any): void {
    let error = null;
    let example: string | undefined = undefined;

    // Convert string numbers to actual numbers for select fields
    if ([this.consumibleFormatDataBase.CATEGORIA, this.consumibleFormatDataBase.FABRICANTE, this.consumibleFormatDataBase.PROVEEDOR].includes(key as CONSUMIBLE_FORMAT_DATA_BASE) && typeof value === 'string') {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        (row as any)[key] = numValue;
        value = numValue;
      }
    }

    if (value === null || value === undefined || String(value).trim() === '') {
      error = `El campo es requerido`;
      example = this.getExampleForEmptyField(key);
    } else {
      error = this.getErrorForField(key, value, row);
      example = this.getExampleForField(key);
    }

    if (error) {
      this.addError(rowIndex, key, error, example);
    }
  }

  /**
   * Obtiene un ejemplo para un campo vacío
   * @param key Nombre del campo
   * @returns Ejemplo para el campo
   */
  private getExampleForEmptyField(key: string): string | undefined {
    switch (key) {
      case this.consumibleFormatDataBase.CATEGORIA:
        return `${this.selectOptions.categorias[0].id} (${this.selectOptions.categorias[0].name})`;
      case this.consumibleFormatDataBase.FABRICANTE:
        return `${this.selectOptions.fabricantes[0].id} (${this.selectOptions.fabricantes[0].name})`;
      case this.consumibleFormatDataBase.PROVEEDOR:
        return `${this.selectOptions.proveedores[0].id} (${this.selectOptions.proveedores[0].name})`;
      case this.consumibleFormatDataBase.FECHA_DE_COMPRA:
        return '01/01/2025';
      case this.consumibleFormatDataBase.CANTIDAD:
      case this.consumibleFormatDataBase.CANTIDAD_MINIMA:
        return '1';
      case this.consumibleFormatDataBase.VALOR:
        return '1000';
      case this.consumibleFormatDataBase.NOMBRE:
        return 'Tornillo hexagonal M8';
      case this.consumibleFormatDataBase.MODELO:
        return 'THX-M8-50';
      case this.consumibleFormatDataBase.NUMERO_DE_FACTURA:
        return 'FAC-2025-001';
      default:
        return undefined;
    }
  }


  /**
   * Obtiene un error para un campo específico
   * @param key Nombre del campo
   * @param value Valor a validar
   * @param row Fila que contiene el campo
   * @returns Error para el campo
   */
  private getErrorForField(key: string, value: any, row: DataPreviewRow): string | null {
    console.log(key);
    switch (key) {
      case this.consumibleFormatDataBase.CATEGORIA:
        return this.validateCategoria(value);
      case this.consumibleFormatDataBase.FABRICANTE:
        return this.validateFabricante(value);
      case this.consumibleFormatDataBase.PROVEEDOR:
        return this.validateProveedor(value);
      case this.consumibleFormatDataBase.FECHA_DE_COMPRA:
        return this.validateFechaDeCompra(value);
      case this.consumibleFormatDataBase.CANTIDAD:
      case this.consumibleFormatDataBase.CANTIDAD_MINIMA:
        return this.validateCantidadYCantidadMinima(key, value, row);
      case this.consumibleFormatDataBase.VALOR:
        return this.validateValor(value);
      case this.consumibleFormatDataBase.NUMERO_DE_FACTURA:
        return this.validateNumeroDeFactura(value);
      default:
        return this.validateAdditionalRules(key, value, row);
    }
  }


  /**
   * Valida la categoría
   * @param value Valor a validar
   * @returns Error si la categoría es inválida
   */
  private validateCategoria(value: any): string | null {
    if (!this.selectOptions.categorias.some(c => c.id === value)) {
      return 'ID de categoría inválido';
    }
    return null;
  }

  /**
   * Valida el fabricante
   * @param value Valor a validar
   * @returns Error si el fabricante es inválido
   */
  private validateFabricante(value: any): string | null {
    if (!this.selectOptions.fabricantes.some(f => f.id === value)) {
      return 'ID de fabricante inválido';
    }
    return null;
  }

  /**
   * Valida el proveedor
   * @param value Valor a validar
   * @returns Error si el proveedor es inválido
   */
  private validateProveedor(value: any): string | null {
    if (!this.selectOptions.proveedores.some(p => p.id === value)) {
      return 'ID de proveedor inválido';
    }
    return null;
  }

  /**
   * Valida la fecha de compra
   * @param value Valor a validar
   * @returns Error si la fecha de compra es inválida
   */
  private validateFechaDeCompra(value: any): string | null {
    if (!this.validateDate(value)) {
      return 'Formato de fecha inválido. Use DD/MM/YYYY';
    }
    return null;
  }

  /**
   * Valida la cantidad
   * @param value Valor a validar
   * @returns Error si la cantidad es inválida
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
 * Verifica si una fila tiene errores de cantidad
 * @param row Fila a verificar
 * @returns true si la fila tiene errores de cantidad
 */
  hasQuantityError(row: DataPreviewRow): boolean {
    const cantidad = Number((row as any)[this.consumibleFormatDataBase.CANTIDAD]);
    const cantidadMinima = Number((row as any)[this.consumibleFormatDataBase.CANTIDAD_MINIMA]);
    return !isNaN(cantidad) && !isNaN(cantidadMinima) &&
      (cantidad < cantidadMinima || cantidad < 0);
  }
  /**
   * Valida el valor
   * @param value Valor a validar
   * @returns Error si el valor es inválido
   */
  private validateValor(value: any,): string | null {
    const valorNum = Number(value);
    if (isNaN(valorNum) || valorNum <= 0) {
      return 'Debe ser un número mayor que 0';
    }
    return null;
  }

  /**
   * Valida el número de factura
   * @param value Valor a validar
   * @returns Error si el número de factura es inválido
   */
  private validateNumeroDeFactura(value: any): string | null {
    if (!/^[A-Za-z0-9-]+$/.test(value)) {
      return 'Solo se permiten letras, números y guiones';
    }
    return null;
  }

  /**
   * Valida reglas adicionales para un campo
   * @param key Nombre del campo
   * @param value Valor a validar
   * @param row Fila que contiene el campo
   * @returns Error si el campo es inválido
   */
  private validateAdditionalRules(key: string, value: any, row: DataPreviewRow): string | null {
    return null;
  }




  /**
   * Obtiene un ejemplo para un campo
   * @param key Nombre del campo
   * @returns Ejemplo para el campo
   */
  private getExampleForField(key: string): string | undefined {
    return this.getExampleForEmptyField(key);
  }

  /**
   * Agrega un error a la lista de errores
   * @param row Índice de la fila
   * @param column Nombre de la columna
   * @param message Mensaje de error
   * @param example Ejemplo para el campo
   */
  private addError(row: number, column: string, message: string, example?: string) {
    this.validationErrors().push({ row, column, message, example });
    if (this.dataSource().data[row]) {
      if (!this.dataSource().data[row]._errors) {
        this.dataSource().data[row]._errors = {};
      }
      this.dataSource().data[row]._errors![column] = message;
    }
  }

  /**
   * Obtiene el número de filas con errores
   * @returns Número de filas con errores
   */
  getErrorRowCount(): number {
    return new Set(this.validationErrors().map(error => error.row)).size;
  }

  /**
   * Actualiza la lista de errores por fila
   */

  updateErrorsByRow() {
    const errorMap = new Map<number, ValidationError[]>();

    this.validationErrors().forEach(error => {
      if (!errorMap.has(error.row)) {
        errorMap.set(error.row, []);
      }

      // Create a new error object with transformed column name
      const transformedError = {
        ...error,
        column: this.getExcelHeaderForColumn(error.column)
      };
      errorMap.get(error.row)?.push(transformedError);
    });

    this.errorsByRow.set(
      Array.from(errorMap.entries())
        .map(([row, errors]) => ({ row, errors }))
        .sort((a, b) => a.row - b.row)
    );
  }

  // Helper method to transform column names
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
      [this.consumibleFormatDataBase.VALOR]: this.consumibleFormatExcelHeaders.VALOR,
      [this.consumibleFormatDataBase.NUMERO_DE_FACTURA]: this.consumibleFormatExcelHeaders.NUMERO_DE_FACTURA,
      [this.consumibleFormatDataBase.FECHA_DE_COMPRA]: this.consumibleFormatExcelHeaders.FECHA_DE_COMPRA,
      [this.consumibleFormatDataBase.OBSERVACIONES]: this.consumibleFormatExcelHeaders.OBSERVACIONES
    };

    return reverseMapping[column] || column;
  }

  /**
   * Maneja el clic fuera del contenedor
   * @param event Evento del mouse
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
 * Transforma los datos JSON proporcionados en un array de objetos `DataPreviewRow`.
 * 
 * @param jsonData - Un array de objetos que representan los datos JSON a transformar.
 * @returns Un array de objetos `DataPreviewRow` con los datos transformados, excluyendo la fila de encabezado.
 * 
 * El proceso de transformación incluye:
 * - Filtrar las filas donde todos los valores son cadenas vacías.
 * - Mapear cada fila a un objeto `DataPreviewRow` con propiedades específicas.
 * - Analizar valores numéricos usando `processorService.parseNumber`.
 * - Formatear valores de fecha usando `processorService.formatDate`.
 * 
 * @example
 * ```typescript
 * const jsonData = [
 *   { NOMBRE: 'Item1', CATEGORIA: 'Category1', CANTIDAD: '10', 'CANTIDAD MINIMA': '5', FABRICANTE: 'Maker1', MODELO: 'Model1', PROVEEDOR: 'Supplier1', VALOR: '100', 'NUMERO DE FACTURA': '12345', 'FECHA DE COMPRA': '2023-01-01', OBSERVACIONES: 'Note1' },
 * ];
 * const transformedData = transformData(jsonData);
 * console.log(transformedData);
 * ```
 */
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
        [this.consumibleFormatDataBase.VALOR]: this.parseNumber(row[this.consumibleFormatExcelHeaders.VALOR]),
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
