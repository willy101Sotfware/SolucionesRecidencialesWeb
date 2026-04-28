import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { BuildingService } from '../../services/building.service';
import { CompanyService } from '../../../companies/services/company.service';
import { BuildingResponse, CompanyResponse, CreateBuildingRequest, UpdateBuildingRequest } from '../../../../core/models';

@Component({
  selector: 'app-building-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgFor, AsyncPipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>{{ isEditMode ? 'Editar Edificio' : 'Nuevo Edificio' }}</h2>
        <a routerLink="/buildings" class="btn btn-secondary">Volver al listado</a>
      </div>
      <div class="form-container">
        <form [formGroup]="buildingForm" (ngSubmit)="onSubmit()" class="building-form">
          <div class="form-row">
            <div class="form-group">
              <label for="nombre">Nombre <span class="required">*</span></label>
              <input type="text" id="nombre" formControlName="nombre" placeholder="Nombre del edificio" />
            </div>
            <div class="form-group">
              <label for="nit">NIT</label>
              <input type="text" id="nit" formControlName="nit" placeholder="NIT del edificio" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="ciudad">Ciudad</label>
              <input type="text" id="ciudad" formControlName="ciudad" />
            </div>
            <div class="form-group">
              <label for="departamento">Departamento</label>
              <input type="text" id="departamento" formControlName="departamento" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="pais">País</label>
              <input type="text" id="pais" formControlName="pais" />
            </div>
            <div class="form-group">
              <label for="companyId">Empresa</label>
              <select id="companyId" formControlName="companyId">
                <option value="">Seleccione una empresa</option>
                <option *ngFor="let company of companies$ | async" [value]="company.idEmpresa">{{ company.nombre }}</option>
              </select>
            </div>
          </div>
          <div class="form-group full-width">
            <label for="direccion">Dirección</label>
            <textarea id="direccion" formControlName="direccion" rows="3"></textarea>
          </div>
          <div class="form-group checkbox-group" *ngIf="isEditMode">
            <label><input type="checkbox" formControlName="activo"> Activo</label>
          </div>
          <div class="error-alert" *ngIf="errorMessage">{{ errorMessage }}</div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" routerLink="/buildings">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="buildingForm.invalid || isLoading">
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
    .building-form { display: flex; flex-direction: column; gap: 20px; }
    .form-row { display: flex; gap: 20px; }
    .form-group { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-weight: 500; color: #2d3748; }
    .required { color: #e53e3e; }
    .form-group input, .form-group select, .form-group textarea { padding: 12px; border: 2px solid #e2e8f0; border-radius: 6px; font-size: 1rem; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #2c5282; }
    .checkbox-group { flex-direction: row; align-items: center; }
    .error-alert { background: #fed7d7; color: #c53030; padding: 15px; border-radius: 6px; }
    .form-actions { display: flex; gap: 15px; justify-content: flex-end; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  `]
})
export class BuildingFormComponent implements OnInit {
  buildingForm: FormGroup;
  isEditMode = false;
  buildingId?: number;
  isLoading = false;
  errorMessage = '';
  companies$: Observable<CompanyResponse[]>;

  constructor(
    private fb: FormBuilder,
    private buildingService: BuildingService,
    private companyService: CompanyService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.companies$ = this.companyService.getAll();
    this.buildingForm = this.fb.group({
      nombre: ['', Validators.required],
      nit: [''],
      email: [''],
      telefono: [''],
      direccion: [''],
      ciudad: ['Medellín'],
      departamento: ['Antioquia'],
      pais: ['Colombia'],
      companyId: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.buildingId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.buildingId;
    if (this.isEditMode) this.loadBuilding();
  }

  loadBuilding(): void {
    if (!this.buildingId) return;
    this.isLoading = true;
    this.buildingService.getById(this.buildingId).subscribe({
      next: (building: BuildingResponse) => {
        this.buildingForm.patchValue({ ...building, activo: building.activo === 1 });
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.errorMessage = 'Error al cargar el edificio.'; }
    });
  }

  onSubmit(): void {
    if (this.buildingForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditMode && this.buildingId) {
      const request: UpdateBuildingRequest = { ...this.buildingForm.value, idEdificio: this.buildingId, activo: this.buildingForm.value.activo ? 1 : 0 };
      this.buildingService.update(this.buildingId, request).subscribe({
        next: () => this.router.navigate(['/buildings']),
        error: (err: unknown) => { this.isLoading = false; this.errorMessage = 'Error al actualizar el edificio.'; console.error(err); }
      });
    } else {
      const request: CreateBuildingRequest = this.buildingForm.value;
      this.buildingService.create(request).subscribe({
        next: () => this.router.navigate(['/buildings']),
        error: (err: unknown) => { this.isLoading = false; this.errorMessage = 'Error al crear el edificio.'; console.error(err); }
      });
    }
  }
}
