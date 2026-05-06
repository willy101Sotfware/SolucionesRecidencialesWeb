import { CommonModule, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BuildingResponse, CompanyResponse, CreateQuotationItemRequest, CreateQuotationRequest, QuotationItemResponse, QuotationResponse, UpdateQuotationItemRequest, UpdateQuotationRequest } from '../../../../core/models';
import { BuildingService } from '../../../buildings/services/building.service';
import { CompanyService } from '../../../companies/services/company.service';
import { QuotationItemService } from '../../services/quotation-item.service';
import { QuotationService } from '../../services/quotation.service';

@Component({
  selector: 'app-quotation-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterLink, NgIf, NgFor, CommonModule, CurrencyPipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>{{ isEditMode ? 'Editar Cotización' : 'Nueva Cotización' }}</h2>
        <a routerLink="/quotations" class="btn btn-secondary">Volver al listado</a>
      </div>

      <div class="form-layout">
        <!-- Columna Izquierda: Formulario -->
        <div class="form-column">
          <form [formGroup]="quotationForm" (ngSubmit)="onSubmit()" class="quotation-form">

            <!-- Número y Fecha -->
            <div class="form-section">
              <h3>INFORMACIÓN GENERAL</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="numero">Número de Cotización <span class="required">*</span></label>
                  <input type="text" id="numero" formControlName="numero" placeholder="Ej: COT001" />
                </div>
                <div class="form-group">
                  <label>Fecha</label>
                  <div class="date-display">{{ currentFecha }}</div>
                </div>
              </div>

              <!-- Selección Empresa → Edificio -->
              <div class="form-group">
                <label for="idEmpresa">Empresa <span class="required">*</span></label>
                <select id="idEmpresa" (change)="onEmpresaChange($event)">
                  <option value="">Seleccione Empresa</option>
                  <option *ngFor="let company of companies" [value]="company.idEmpresa">{{ company.nombre }}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="idEdificio">Edificio <span class="required">*</span></label>
                <select id="idEdificio" formControlName="idEdificio" (change)="onEdificioChange($event)">
                  <option value="">Seleccione Edificio</option>
                  <option *ngFor="let building of filteredBuildings" [value]="building.idEdificio">{{ building.nombre }}</option>
                </select>
              </div>

              <div class="edificio-details" *ngIf="selectedEdificio">
                <p><strong>NIT:</strong> {{ selectedEdificio.nit || 'N/A' }}</p>
                <p><strong>Dirección:</strong> {{ selectedEdificio.direccion || 'N/A' }}</p>
              </div>
            </div>

            <!-- Textos de Encabezado -->
            <div class="form-section">
              <h3>TEXTOS DE ENCABEZADO</h3>
              <div class="form-group">
                <label for="asunto">Asunto</label>
                <input type="text" id="asunto" formControlName="asunto" />
              </div>
              <div class="form-group">
                <label for="cordialSaludo">Saludo</label>
                <input type="text" id="cordialSaludo" formControlName="cordialSaludo" />
              </div>
              <div class="form-group">
                <label for="headerPropuesta">Introducción</label>
                <textarea id="headerPropuesta" formControlName="headerPropuesta" rows="2"></textarea>
              </div>
            </div>

            <!-- Plazo y Garantía -->
            <div class="form-section">
              <h3>PLAZO Y GARANTÍA</h3>
              <div class="form-group checkbox-group">
                <input type="checkbox" id="showPlazo" formControlName="showPlazoCheckbox" />
                <label for="showPlazo">Mostrar Plazo de Entrega</label>
              </div>
              <div class="form-group" *ngIf="quotationForm.get('showPlazoCheckbox')?.value">
                <label for="plazoEntrega">Plazo de Entrega</label>
                <input type="text" id="plazoEntrega" formControlName="plazoEntrega" placeholder="Ej: 15 días hábiles" />
              </div>

              <div class="form-group checkbox-group">
                <input type="checkbox" id="showGarantia" formControlName="showGarantiaCheckbox" />
                <label for="showGarantia">Mostrar Garantía</label>
              </div>
              <div class="form-group" *ngIf="quotationForm.get('showGarantiaCheckbox')?.value">
                <label for="garantia">Garantía</label>
                <input type="text" id="garantia" formControlName="garantia" placeholder="Ej: 12 meses" />
              </div>
            </div>

            <!-- Items de la Cotización -->
            <div class="form-section">
              <h3>DESCRIPCIÓN DE LA OBRA (ÍTEMS)</h3>

              <!-- Agregar Item Simple -->
              <div class="add-item-section">
                <textarea
                  [(ngModel)]="newItemText"
                  [ngModelOptions]="{standalone: true}"
                  placeholder="Añadir ítem (Enter para entrada rápida)..."
                  rows="3"
                  class="item-input"
                  (keydown)="onItemKeyDown($event)"></textarea>
                <div class="item-buttons">
                  <button type="button" class="btn btn-add-simple" (click)="addSimpleItem()">
                    + Simple
                  </button>
                  <button type="button" class="btn btn-add-advanced" (click)="showAdvancedItemModal = true">
                    + Avanzado
                  </button>
                </div>
              </div>

              <!-- Lista de Items -->
              <div class="items-list" *ngIf="items.length > 0">
                <div class="item-card" *ngFor="let item of items; let i = index">
                  <div class="item-header">
                    <span class="item-number">{{ i + 1 }}</span>
                    <button type="button" class="btn-remove" (click)="removeItem(i)">✕</button>
                  </div>

                  <!-- Imagen del item -->
                  <div class="item-image" *ngIf="item.imagen">
                    <img [src]="item.imagen" alt="Imagen del item" />
                  </div>

                  <div class="item-details">
                    <p class="item-description">{{ item.descripcion }}</p>
                    <div class="item-meta" *ngIf="item.cantidad || item.unidadMedida || item.valorUnitario">
                      <span *ngIf="item.cantidad">{{ item.cantidad }} {{ item.unidadMedida || '' }}</span>
                      <span *ngIf="item.valorUnitario" class="item-price">
                        {{ item.valorUnitario | currency:'COP':'symbol':'1.0-0' }}
                      </span>
                      <span *ngIf="item.valorTotal" class="item-total">
                        Total: {{ item.valorTotal | currency:'COP':'symbol':'1.0-0' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="empty-items" *ngIf="items.length === 0">
                <p>No hay items agregados</p>
              </div>

              <!-- Valor de la Obra -->
              <div class="form-section">
                <h3>VALOR DE LA OBRA</h3>
                <div class="form-group">
                  <label for="valorObra">Valor de la Obra ($)</label>
                  <input type="number" id="valorObra" formControlName="valorObra"
                         placeholder="0" (input)="calculateTotals()" />
                </div>

                <div class="financial-summary">
                  <div class="summary-row">
                    <span>Utilidad ({{ porcentajeUtilidad * 100 }}%)</span>
                    <span>{{ utilidadCalculada | currency:'COP':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="summary-row">
                    <span>IVA sobre Utilidad ({{ porcentajeIva * 100 }}%)</span>
                    <span>{{ ivaCalculado | currency:'COP':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="summary-divider"></div>
                  <div class="summary-total">
                    <span>TOTAL COTIZACIÓN</span>
                    <span>{{ totalCalculado | currency:'COP':'symbol':'1.0-0' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información de Contacto -->
            <div class="form-section">
              <h3>INFORMACIÓN DE FIRMA</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="firmaNombre">Nombre</label>
                  <input type="text" id="firmaNombre" formControlName="firmaNombre" />
                </div>
                <div class="form-group">
                  <label for="firmaCargo">Cargo</label>
                  <input type="text" id="firmaCargo" formControlName="firmaCargo" />
                </div>
              </div>
              <div class="form-group">
                <label for="firmaCelular">Celular</label>
                <input type="text" id="firmaCelular" formControlName="firmaCelular" />
              </div>
              <div class="form-group">
                <label for="notaPie">Nota Pie de Página</label>
                <textarea id="notaPie" formControlName="notaPie" rows="2"></textarea>
              </div>
            </div>

            <div class="error-alert" *ngIf="errorMessage">{{ errorMessage }}</div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" routerLink="/quotations">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="isLoading || !isValid()">
                <span *ngIf="!isLoading">{{ isEditMode ? 'Actualizar' : 'Guardar y Generar' }}</span>
                <span *ngIf="isLoading">Guardando...</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal para Item Avanzado -->
      <div class="modal-overlay" *ngIf="showAdvancedItemModal" (click)="showAdvancedItemModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>AGREGAR ÍTEM DE OBRA</h3>
          <div class="modal-form">
            <!-- Descripción -->
            <div class="form-group">
              <label>Descripción del Ítem *</label>
              <textarea [(ngModel)]="advancedItem.descripcion" rows="4" placeholder="Descripción detallada del ítem..."></textarea>
            </div>

            <!-- Cantidad y Unidad de Medida -->
            <div class="form-row">
              <div class="form-group small">
                <label>Cantidad</label>
                <input type="number" [(ngModel)]="advancedItem.cantidad" (input)="calcularValorTotalItem()" step="0.01" placeholder="0" />
              </div>
              <div class="form-group flex-1">
                <label>Unidad de Medida</label>
                <select [(ngModel)]="advancedItem.unidadMedida">
                  <option value="">Seleccione...</option>
                  <option *ngFor="let unidad of unidadesMedida" [value]="unidad">{{ unidad }}</option>
                </select>
              </div>
            </div>

            <!-- Valores -->
            <div class="form-row">
              <div class="form-group">
                <label>Valor Unitario ($)</label>
                <input type="number" [(ngModel)]="advancedItem.valorUnitario" (input)="calcularValorTotalItem()" placeholder="0" />
              </div>
              <div class="form-group">
                <label>Valor Total ($)</label>
                <input type="number" [(ngModel)]="advancedItem.valorTotal" readonly class="readonly-input" />
              </div>
            </div>

            <!-- Imagen -->
            <div class="form-group">
              <label>Imagen (Opcional)</label>
              <div class="image-upload-section">
                <input type="file" accept="image/*" (change)="onImageSelected($event)" #fileInput style="display: none" />
                <button type="button" class="btn btn-image" (click)="fileInput.click()">
                  📷 Seleccionar Imagen
                </button>
                <div class="image-preview" *ngIf="advancedItem.imagen">
                  <img [src]="advancedItem.imagen" alt="Preview" />
                  <button type="button" class="btn-remove-image" (click)="advancedItem.imagen = undefined">✕</button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="showAdvancedItemModal = false">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="addAdvancedItem()">Agregar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 20px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .page-header h2 { margin: 0; color: #1e3a5f; }
    .btn { padding: 10px 20px; border-radius: 6px; text-decoration: none; cursor: pointer; border: none; font-size: 0.9rem; }
    .btn-primary { background: #2c5282; color: white; }
    .btn-secondary { background: #e2e8f0; color: #4a5568; }
    .btn-add-simple { background: #5856D6; color: white; }
    .btn-add-advanced { background: #FF9500; color: white; }
    .btn-remove { background: transparent; color: #FF453A; border: none; cursor: pointer; font-size: 1.2rem; }

    .form-layout { display: grid; grid-template-columns: 1fr; gap: 20px; }
    .form-column { min-width: 0; }

    .quotation-form { display: flex; flex-direction: column; gap: 20px; }
    .form-section { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .form-section h3 { margin: 0 0 15px 0; color: #5856D6; font-size: 0.95rem; border-bottom: 2px solid #5856D6; padding-bottom: 8px; }
    .form-row { display: flex; gap: 15px; margin-bottom: 15px; }
    .form-group { flex: 1; display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
    .form-group label { font-weight: 500; color: #2d3748; font-size: 0.9rem; }
    .required { color: #e53e3e; }
    .form-group input, .form-group select, .form-group textarea { padding: 10px; border: 2px solid #e2e8f0; border-radius: 6px; font-size: 0.95rem; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #5856D6; }
    .checkbox-group { flex-direction: row; align-items: center; gap: 8px; }
    .checkbox-group input[type="checkbox"] { width: 18px; height: 18px; }

    .edificio-details { background: #f7fafc; padding: 10px; border-radius: 6px; margin-top: 8px; }
    .edificio-details p { margin: 4px 0; font-size: 0.85rem; color: #4a5568; }

    .add-item-section { margin-bottom: 15px; }
    .item-input { width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 6px; resize: vertical; }
    .item-buttons { display: flex; gap: 8px; margin-top: 8px; }

    .items-list { display: flex; flex-direction: column; gap: 10px; margin-top: 15px; }
    .item-card { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; display: flex; gap: 12px; }
    .item-header { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .item-number { background: #5856D6; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem; }
    .item-image { width: 60px; height: 60px; border-radius: 6px; overflow: hidden; background: #e2e8f0; flex-shrink: 0; }
    .item-image img { width: 100%; height: 100%; object-fit: cover; }
    .item-details { flex: 1; min-width: 0; }
    .item-description { margin: 0 0 6px 0; color: #2d3748; font-size: 0.95rem; }
    .item-meta { display: flex; gap: 12px; font-size: 0.85rem; color: #718096; }
    .item-price { color: #3182ce; font-weight: 500; }
    .item-total { color: #2c5282; font-weight: 600; }
    .empty-items { text-align: center; padding: 30px; color: #718096; }

    .financial-card { background: linear-gradient(135deg, #2E2E3E 0%, #1E1E2E 100%); color: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 12px rgba(88,86,214,0.3); }
    .financial-card h3 { color: #5856D6; font-size: 1rem; margin: 0 0 20px 0; text-align: center; }
    .financial-icon { font-size: 3rem; text-align: center; margin-bottom: 20px; }
    .financial-input { background: #2E2E3E; color: white; border: 2px solid #5856D6; font-size: 1.3rem; font-weight: bold; text-align: right; }
    .financial-input::placeholder { color: #8E8E93; }

    .financial-summary { margin-top: 20px; padding-top: 20px; border-top: 1px solid #3E3E4E; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.9rem; }
    .summary-value { color: #8E8E93; font-weight: 500; }
    .summary-divider { height: 2px; background: #5856D6; margin: 15px 0; }
    .summary-total { font-size: 1.1rem; font-weight: bold; }
    .total-value { color: white; font-size: 1.5rem; font-weight: bold; }

    .financial-note { background: #161625; padding: 12px; border-radius: 6px; margin-top: 20px; }
    .financial-note p { margin: 0; font-size: 0.75rem; color: #8E8E93; font-style: italic; line-height: 1.4; }

    .error-alert { background: #fed7d7; color: #c53030; padding: 15px; border-radius: 6px; }
    .form-actions { display: flex; gap: 15px; justify-content: flex-end; padding-top: 20px; }
    .date-display { padding: 10px; background: #f7fafc; border-radius: 6px; color: #4a5568; font-weight: 500; }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; padding: 25px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
    .modal-content h3 { margin: 0 0 20px 0; color: #1e3a5f; font-size: 1.2rem; text-align: center; }
    .modal-form { display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px; }
    .modal-actions { display: flex; gap: 10px; justify-content: center; }

    .form-group.small { flex: 0 0 120px; }
    .form-group.flex-1 { flex: 1; }
    .readonly-input { background: #f7fafc; cursor: not-allowed; }

    .image-upload-section { display: flex; flex-direction: column; gap: 10px; }
    .btn-image { background: #5856D6; color: white; align-self: flex-start; }
    .image-preview { position: relative; width: 100px; height: 100px; border-radius: 8px; overflow: hidden; border: 2px solid #e2e8f0; }
    .image-preview img { width: 100%; height: 100%; object-fit: cover; }
    .btn-remove-image { position: absolute; top: 5px; right: 5px; background: rgba(255,69,58,0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; }

    @media (max-width: 1024px) {
      .form-layout { grid-template-columns: 1fr; }
      .financial-column { position: static; }
    }
  `]
})
export class QuotationFormComponent implements OnInit {
  quotationForm: FormGroup;
  isEditMode = false;
  quotationId?: number;
  isLoading = false;
  errorMessage = '';

  // Empresas y Edificios
  companies: CompanyResponse[] = [];
  allBuildings: BuildingResponse[] = [];
  filteredBuildings: BuildingResponse[] = [];
  selectedEdificio: BuildingResponse | null = null;

  // Items
  items: QuotationItemResponse[] = [];
  // Snapshot de los ítems que ya existían al cargar la cotización (modo edición)
  // para poder distinguir nuevos / actualizados / eliminados al guardar.
  private originalItemIds: Set<number> = new Set<number>();
  newItemText = '';
  showAdvancedItemModal = false;
  advancedItem: Partial<QuotationItemResponse> = {};

  // Unidades de medida (del WPF)
  unidadesMedida = [
    '',
    'unidad(es)',
    'm²',
    'm³',
    'm',
    'cm',
    'mm',
    'kg',
    'ton',
    'lt',
    'gal',
    'bulto(s)',
    'caja(s)',
    'paquete(s)',
    'rollo(s)',
    'placa(s)',
    'tablero(s)',
    'puerta(s)',
    'ventana(s)',
    'pieza(s)',
    'lote(s)',
    'obra(s)',
    'servicio(s)',
    'hora(s)',
    'día(s)',
    'mes(es)',
    'km',
    'ft',
    'yd'
  ];

  // Cálculos financieros
  porcentajeUtilidad = 0.06; // 6%
  porcentajeIva = 0.19; // 19%
  currentFecha = '';

  constructor(
    private fb: FormBuilder,
    private quotationService: QuotationService,
    private quotationItemService: QuotationItemService,
    private companyService: CompanyService,
    private buildingService: BuildingService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.quotationForm = this.fb.group({
      numero: ['', Validators.required],
      // Inicializamos fecha con hoy en formato ISO; antes el backend la guardaba
      // como null y el detalle mostraba "Invalid Date".
      fecha: [new Date().toISOString()],
      idEdificio: ['', Validators.required],
      asunto: ['Cotización'],
      cordialSaludo: ['Cordial saludo,'],
      headerPropuesta: ['Estamos presentando nuestra propuesta económica para'],
      valorObra: [0],
      porcentajeUtilidad: [this.porcentajeUtilidad],
      porcentajeIva: [this.porcentajeIva],
      utilidad: [0],
      ivaUtilidad: [0],
      total: [0],
      plazoEntrega: [''],
      showPlazoCheckbox: [false],
      showPlazo: [0],
      garantia: [''],
      showGarantiaCheckbox: [false],
      showGarantia: [0],
      firmaNombre: ['Edwuin Ruiz'],
      firmaCargo: ['Contratista'],
      firmaCelular: ['Cel. 314 6678378'],
      notaPie: ['Cuenta de ahorros Bancolombia N° 61400040906. Adjuntar soporte de pago al correo solucionesresidencialeser@gmail.com o al WhatsApp 304 5889873.']
    });

    // Suscribirse a cambios en valorObra para recalcular
    this.quotationForm.get('valorObra')?.valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setCurrentDate();

    this.quotationId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.quotationId;
    if (this.isEditMode) this.loadQuotation();
  }

  loadInitialData(): void {
    this.companyService.getAll().subscribe({
      next: (data) => {
        this.companies = data;
        this.cdr.detectChanges();
      }
    });

    this.buildingService.getAll().subscribe({
      next: (data) => {
        this.allBuildings = data;
        this.filteredBuildings = data;
        this.cdr.detectChanges();
      }
    });
  }

  setCurrentDate(): void {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    this.currentFecha = now.toLocaleDateString('es-ES', options);
    // Si por alguna razón se resetó el control fecha (p. ej. patchValue al cargar
    // una cotización existente sin fecha), nos aseguramos de mantener un valor válido.
    if (!this.quotationForm.get('fecha')?.value) {
      this.quotationForm.patchValue({ fecha: now.toISOString() }, { emitEvent: false });
    }
  }

  onEmpresaChange(event: any): void {
    const empresaId = Number(event.target.value);
    this.filteredBuildings = empresaId
      ? this.allBuildings.filter(b => b.companyId === empresaId)
      : this.allBuildings;
    this.quotationForm.patchValue({ idEdificio: '' });
    this.selectedEdificio = null;
  }

  onEdificioChange(event: any): void {
    const edificioId = Number(event.target.value);
    this.selectedEdificio = this.allBuildings.find(b => b.idEdificio === edificioId) || null;
  }

  // Gestión de Items
  onItemKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.ctrlKey) {
      event.preventDefault();
      this.addSimpleItem();
    }
  }

  addSimpleItem(): void {
    if (!this.newItemText.trim()) return;

    const lines = this.newItemText.split(/\r?\n/).filter(line => line.trim());

    lines.forEach(line => {
      let cleanLine = line.trim().replace(/^[•\-*\s]+/, '').trim();
      if (cleanLine) {
        this.items.push({
          id: 0,
          idCotizacion: 0,
          descripcion: cleanLine
        } as QuotationItemResponse);
      }
    });

    this.newItemText = '';
    this.recalcularValorObra();
    this.cdr.detectChanges();
  }

  addAdvancedItem(): void {
    if (!this.advancedItem.descripcion?.trim()) {
      alert('Debe ingresar la descripción del ítem.');
      return;
    }

    this.items.push({
      id: 0,
      idCotizacion: 0,
      descripcion: this.advancedItem.descripcion,
      cantidad: this.advancedItem.cantidad || null,
      unidadMedida: this.advancedItem.unidadMedida || null,
      valorUnitario: this.advancedItem.valorUnitario || null,
      valorTotal: this.advancedItem.valorTotal || null,
      imagen: this.advancedItem.imagen || null
    } as QuotationItemResponse);

    this.advancedItem = {};
    this.showAdvancedItemModal = false;
    this.recalcularValorObra();
    this.cdr.detectChanges();
  }

  // Calcular valor total automáticamente
  calcularValorTotalItem(): void {
    const cantidad = Number(this.advancedItem.cantidad) || 0;
    const valorUnitario = Number(this.advancedItem.valorUnitario) || 0;

    if (cantidad > 0 && valorUnitario > 0) {
      this.advancedItem.valorTotal = cantidad * valorUnitario;
    } else {
      delete this.advancedItem.valorTotal;
    }
  }

  // Seleccionar imagen desde archivo
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.advancedItem.imagen = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeItem(index: number): void {
    this.items.splice(index, 1);
    this.recalcularValorObra();
    this.cdr.detectChanges();
  }

  recalcularValorObra(): void {
    const sumaTotal = this.items.reduce((sum, item) => {
      return sum + (Number(item.valorTotal) || 0);
    }, 0);

    const hayItemsConValor = this.items.some(item => Number(item.valorTotal) > 0);

    // Modo Avanzado: si al menos un ítem tiene valorTotal, sincronizamos
    // valorObra con la suma de los ítems (incluyendo cuando la suma queda en 0
    // porque el usuario eliminar el único ítem con valor).
    // Modo Simple: si ningún ítem tiene valorTotal, respetamos el valor manual.
    if (hayItemsConValor || sumaTotal > 0) {
      this.quotationForm.patchValue({ valorObra: sumaTotal }, { emitEvent: false });
    }
    this.calculateTotals();
  }

  // Cálculos Financieros
  calculateTotals(): void {
    const valorObraStr = this.quotationForm.get('valorObra')?.value;
    const valor = parseFloat(valorObraStr) || 0;

    const utilidad = valor * this.porcentajeUtilidad;
    const iva = utilidad * this.porcentajeIva;
    const total = valor + utilidad + iva;

    this.quotationForm.patchValue({
      utilidad: utilidad,
      ivaUtilidad: iva,
      total: total
    });

    this.cdr.detectChanges();
  }

  get utilidadCalculada(): number {
    return this.quotationForm.get('utilidad')?.value || 0;
  }

  get ivaCalculado(): number {
    return this.quotationForm.get('ivaUtilidad')?.value || 0;
  }

  get totalCalculado(): number {
    return this.quotationForm.get('total')?.value || 0;
  }

  get valorObraCalculado(): number {
    return this.items.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
  }

  get valorObraDisplay(): string {
    const valor = this.quotationForm.get('valorObra')?.value;
    if (!valor || valor === 0) return '';
    return valor.toLocaleString('es-CO');
  }

  onValorObraInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^\d]/g, '');
    const numValue = value ? parseInt(value, 10) : 0;
    this.quotationForm.patchValue({ valorObra: numValue });
    this.calculateTotals();
  }

  // Validación
  isValid(): boolean {
    return this.quotationForm.valid &&
      this.items.length > 0;
  }

  // Carga y Guardado
  loadQuotation(): void {
    if (!this.quotationId) return;
    this.isLoading = true;

    this.quotationService.getById(this.quotationId).subscribe({
      next: (quotation: QuotationResponse) => {
        // Cargar items (algunos endpoints no retornan quotationItems anidados)
        if (quotation.quotationItems && quotation.quotationItems.length > 0) {
          this.items = quotation.quotationItems;
          this.snapshotOriginalItems();
          this.recalcularValorObra();
        } else {
          this.quotationItemService.getByQuotationId(this.quotationId!).subscribe({
            next: (items) => {
              this.items = items || [];
              this.snapshotOriginalItems();
              this.recalcularValorObra();
              this.cdr.detectChanges();
            },
            error: (err) => console.error('Error cargando ítems de cotización', err)
          });
        }

        // Cargar checkboxes
        const showPlazo = quotation.showPlazo === 1;
        const showGarantia = quotation.showGarantia === 1;

        // Si la cotización guardada no tiene fecha, usamos hoy para que al
        // actualizar se guarde una fecha válida (antes el detalle mostraba "Invalid Date").
        const fecha = quotation.fecha || quotation.createdAt || new Date().toISOString();

        this.quotationForm.patchValue({
          ...quotation,
          fecha,
          showPlazoCheckbox: showPlazo,
          showGarantiaCheckbox: showGarantia
        });

        // Seleccionar edificio
        if (quotation.idEdificio) {
          const edificio = this.allBuildings.find(b => b.idEdificio === quotation.idEdificio);
          if (edificio) {
            this.selectedEdificio = edificio;

            // Filtrar edificios por empresa sin resetear el idEdificio cargado
            if (edificio.companyId) {
              this.filteredBuildings = this.allBuildings.filter(b => b.companyId === edificio.companyId);
              this.quotationForm.patchValue({ idEdificio: quotation.idEdificio });
            }
          }
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar la cotización.';
      }
    });
  }

  onSubmit(): void {
    if (!this.isValid()) {
      if (!this.quotationForm.valid) {
        this.errorMessage = 'Por favor complete todos los campos obligatorios.';
      } else if (this.items.length === 0) {
        this.errorMessage = 'Debe añadir al menos un ítem de obra.';
      } else {
        this.errorMessage = 'El valor de la obra debe ser válido.';
      }
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.quotationForm.value;
    const payload = {
      ...formValue,
      idEdificio: formValue.idEdificio ? Number(formValue.idEdificio) : null,
      showPlazo: formValue.showPlazoCheckbox ? 1 : 0,
      showGarantia: formValue.showGarantiaCheckbox ? 1 : 0
    };

    if (this.isEditMode && this.quotationId) {
      const request: UpdateQuotationRequest = { ...payload, id: this.quotationId };
      this.quotationService.update(this.quotationId, request).subscribe({
        next: () => {
          // Guardar ítems después de actualizar la cotización
          this.saveQuotationItems(this.quotationId!);
        },
        error: (err: unknown) => {
          this.isLoading = false;
          this.errorMessage = 'Error al actualizar la cotización.';
          console.error(err);
        }
      });
    } else {
      const request: CreateQuotationRequest = payload;
      this.quotationService.create(request).subscribe({
        next: (newId) => {
          // Guardar ítems después de crear la cotización
          this.saveQuotationItems(newId);
        },
        error: (err: unknown) => {
          this.isLoading = false;
          this.errorMessage = 'Error al crear la cotización.';
          console.error(err);
        }
      });
    }
  }

  saveQuotationItems(quotationId: number): void {
    // Sincroniza el listado de ítems con el backend respetando lo que ya existía:
    //   - ítems con id > 0 que ya estaban cargados      -> PUT (update)
    //   - ítems con id == 0 (agregados en el formulario) -> POST (create)
    //   - ids originales que ya no están en this.items   -> DELETE
    const currentIds = new Set<number>(
      this.items.map(item => item.id).filter((id): id is number => typeof id === 'number' && id > 0)
    );
    const idsToDelete = Array.from(this.originalItemIds).filter(id => !currentIds.has(id));

    const requests: Promise<unknown>[] = [];

    for (const item of this.items) {
      const basePayload = {
        idCotizacion: quotationId,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        unidadMedida: item.unidadMedida,
        imagen: item.imagen,
        valorUnitario: item.valorUnitario,
        valorTotal: item.valorTotal,
        plazoEntrega: item.plazoEntrega,
        showPlazo: item.showPlazo,
        garantia: item.garantia,
        showGarantia: item.showGarantia
      };

      if (item.id && item.id > 0 && this.originalItemIds.has(item.id)) {
        const updateRequest: UpdateQuotationItemRequest = { id: item.id, ...basePayload };
        requests.push(this.quotationItemService.update(item.id, updateRequest).toPromise());
      } else {
        const createRequest: CreateQuotationItemRequest = basePayload;
        requests.push(this.quotationItemService.create(createRequest).toPromise());
      }
    }

    for (const id of idsToDelete) {
      requests.push(this.quotationItemService.delete(id).toPromise());
    }

    Promise.all(requests)
      .then(() => {
        this.isLoading = false;
        this.router.navigate(['/quotations']);
      })
      .catch((err) => {
        this.isLoading = false;
        this.errorMessage = 'Error al guardar los ítems.';
        console.error(err);
      });
  }

  private snapshotOriginalItems(): void {
    this.originalItemIds = new Set<number>(
      this.items
        .map(item => item.id)
        .filter((id): id is number => typeof id === 'number' && id > 0)
    );
  }
}
