import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { BuildingResponse, CreateQuotationRequest, QuotationResponse, UpdateQuotationRequest } from '../../../../core/models';
import { BuildingService } from '../../../buildings/services/building.service';
import { QuotationService } from '../../services/quotation.service';

@Component({
  selector: 'app-quotation-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgFor, AsyncPipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>{{ isEditMode ? 'Editar Cotización' : 'Nueva Cotización' }}</h2>
        <a routerLink="/quotations" class="btn btn-secondary">Volver al listado</a>
      </div>
      <div class="form-container">
        <form [formGroup]="quotationForm" (ngSubmit)="onSubmit()" class="quotation-form">
          <div class="form-section">
            <h3>Información General</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="numero">Número <span class="required">*</span></label>
                <input type="text" id="numero" formControlName="numero" placeholder="Ej: COT001" />
              </div>
              <div class="form-group">
                <label for="fecha">Fecha</label>
                <input type="date" id="fecha" formControlName="fecha" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="idEdificio">Edificio</label>
                <select id="idEdificio" formControlName="idEdificio">
                  <option value="">Seleccione un edificio</option>
                  <option *ngFor="let building of buildings$ | async" [value]="building.idEdificio">{{ building.nombre }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="asunto">Asunto</label>
                <input type="text" id="asunto" formControlName="asunto" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Contenido de la Cotización</h3>
            <div class="form-group full-width">
              <label for="descripcionObra">Descripción de la Obra</label>
              <textarea id="descripcionObra" formControlName="descripcionObra" rows="4"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="valorObra">Valor de la Obra</label>
                <input type="number" id="valorObra" formControlName="valorObra" />
              </div>
              <div class="form-group">
                <label for="porcentajeUtilidad">% Utilidad</label>
                <input type="number" id="porcentajeUtilidad" formControlName="porcentajeUtilidad" step="0.01" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Información de Contacto</h3>
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
          </div>

          <div class="error-alert" *ngIf="errorMessage">{{ errorMessage }}</div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" routerLink="/quotations">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="quotationForm.invalid || isLoading">
              <span *ngIf="!isLoading">{{ isEditMode ? 'Actualizar' : 'Guardar' }}</span>
              <span *ngIf="isLoading">Guardando...</span>
            </button>
          </div>
        </form>
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
    .form-container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .quotation-form { display: flex; flex-direction: column; gap: 30px; }
    .form-section { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
    .form-section h3 { margin: 0 0 20px 0; color: #2c5282; font-size: 1.1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
    .form-row { display: flex; gap: 20px; margin-bottom: 15px; }
    .form-group { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .form-group.full-width { width: 100%; }
    .form-group label { font-weight: 500; color: #2d3748; }
    .required { color: #e53e3e; }
    .form-group input, .form-group select, .form-group textarea { padding: 12px; border: 2px solid #e2e8f0; border-radius: 6px; font-size: 1rem; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #2c5282; }
    .error-alert { background: #fed7d7; color: #c53030; padding: 15px; border-radius: 6px; }
    .form-actions { display: flex; gap: 15px; justify-content: flex-end; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  `]
})
export class QuotationFormComponent implements OnInit {
  quotationForm: FormGroup;
  isEditMode = false;
  quotationId?: number;
  isLoading = false;
  errorMessage = '';
  buildings$: Observable<BuildingResponse[]>;

  constructor(
    private fb: FormBuilder,
    private quotationService: QuotationService,
    private buildingService: BuildingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.buildings$ = this.buildingService.getAll();
    this.quotationForm = this.fb.group({
      numero: ['', Validators.required],
      fecha: [new Date().toISOString().split('T')[0]],
      idEdificio: [''],
      asunto: ['Cotización'],
      descripcionObra: [''],
      valorObra: [0],
      porcentajeUtilidad: [0],
      firmaNombre: ['Edwuin Ruiz'],
      firmaCargo: ['Contratista']
    });
  }

  ngOnInit(): void {
    this.quotationId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.quotationId;
    if (this.isEditMode) this.loadQuotation();
  }

  loadQuotation(): void {
    if (!this.quotationId) return;
    this.isLoading = true;
    this.quotationService.getById(this.quotationId).subscribe({
      next: (quotation: QuotationResponse) => {
        this.quotationForm.patchValue(quotation);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.errorMessage = 'Error al cargar la cotización.'; }
    });
  }

  onSubmit(): void {
    if (this.quotationForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.quotationForm.value;
    const payload = {
      ...formValue,
      idEdificio: formValue.idEdificio ? Number(formValue.idEdificio) : null,
      showPlazo: 0,
      showGarantia: 0
    };

    if (this.isEditMode && this.quotationId) {
      const request: UpdateQuotationRequest = { ...payload, id: this.quotationId };
      this.quotationService.update(this.quotationId, request).subscribe({
        next: () => this.router.navigate(['/quotations']),
        error: (err: unknown) => { this.isLoading = false; this.errorMessage = 'Error al actualizar la cotización.'; console.error(err); }
      });
    } else {
      const request: CreateQuotationRequest = payload;
      this.quotationService.create(request).subscribe({
        next: () => this.router.navigate(['/quotations']),
        error: (err: unknown) => { this.isLoading = false; this.errorMessage = 'Error al crear la cotización.'; console.error(err); }
      });
    }
  }
}
